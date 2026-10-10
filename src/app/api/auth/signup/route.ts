import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const signupRateMap = new Map<string, number[]>();

function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2)}`;
  }
  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const recentAttempts = (signupRateMap.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
    if (recentAttempts.length >= 10) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }
    recentAttempts.push(now);
    signupRateMap.set(ip, recentAttempts);

    const body = await req.json();
    const {
      name,
      email,
      phone,
      city,
      password,
      confirmPassword,
      acceptedTerms,
      agreementVersion = "v1.0",
      privacyVersion = "v1.0",
      language = "en",
    } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Please enter your mobile / WhatsApp number." },
        { status: 400 }
      );
    }

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return NextResponse.json(
        { error: "Please enter a valid 10 to 15 digit mobile number." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        { error: "Password must include at least one letter and one number." },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (acceptedTerms !== true) {
      return NextResponse.json(
        { error: "You must accept the User Agreement and Privacy Policy to create an account." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = normalizePhone(phone);
    const rawPhoneTrimmed = phone.trim();
    const cleanName = name.trim();
    const cleanCity = city && typeof city === "string" && city.trim() ? city.trim() : "Pune";

    // Check if User already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Find or create linked Customer record
    let dbCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: cleanPhone },
          { phone: rawPhoneTrimmed },
        ],
      },
    });

    if (!dbCustomer) {
      const custCount = await prisma.customer.count();
      let customerCode = `ALC-2026-${String(custCount + 1).padStart(4, "0")}`;
      const existingCode = await prisma.customer.findUnique({
        where: { customerCode },
        select: { id: true },
      });
      if (existingCode) {
        customerCode = `ALC-2026-${String(custCount + 1).padStart(4, "0")}-${Date.now().toString().slice(-3)}`;
      }

      dbCustomer = await prisma.customer.create({
        data: {
          customerCode,
          name: cleanName,
          phone: cleanPhone,
          whatsapp: cleanPhone,
          email: cleanEmail,
          city: cleanCity,
        },
      });
    } else if (!dbCustomer.email) {
      // Ensure existing customer record has the email linked
      dbCustomer = await prisma.customer.update({
        where: { id: dbCustomer.id },
        data: { email: cleanEmail },
      });
    }

    // Create User account with CUSTOMER role
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: cleanName,
        phone: cleanPhone,
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    });

    // Link any existing Leads with matching mobile or email to this Customer
    await prisma.lead.updateMany({
      where: {
        customerId: null,
        OR: [
          { mobile: cleanPhone },
          { mobile: rawPhoneTrimmed },
          { email: cleanEmail },
        ],
      },
      data: {
        customerId: dbCustomer.id,
      },
    });

    // Record User Agreement & Privacy Policy acceptance
    await Promise.all([
      logAudit({
        userId: newUser.id,
        action: "ACCEPT_USER_AGREEMENT",
        entity: "UserAgreement",
        entityId: newUser.id,
        details: {
          customerId: dbCustomer.id,
          customerCode: dbCustomer.customerCode,
          email: cleanEmail,
          phone: cleanPhone,
          agreementVersion,
          privacyVersion,
          acceptedTerms: true,
          acceptedPrivacy: true,
          acceptedAt: new Date().toISOString(),
          language,
        },
        ipAddress: ip,
      }),
      prisma.auditLog.create({
        data: {
          userId: newUser.id,
          action: "SIGNUP_SUCCESS",
          entity: "AnalyticsEvent",
          entityId: "SITE",
          details: JSON.stringify({
            sessionKey: `signup_${newUser.id}`,
            userId: newUser.id,
            customerId: dbCustomer.id,
            sourcePage: "/signup",
            language,
            timestamp: new Date().toISOString(),
          }),
          ipAddress: ip,
        },
      }),
    ]);

    // Set Session Cookie
    await setSessionCookie({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      customerId: dbCustomer.id,
    });

    return NextResponse.json({
      success: true,
      redirectTo: "/customer/dashboard",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        customerId: dbCustomer.id,
        customerCode: dbCustomer.customerCode,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to create account";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

