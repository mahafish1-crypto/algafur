import prisma from "./db";

export function getFloatingWhatsAppMessage(pageType: "home" | "package" | "booking" | "contact", packageName?: string): string {
  if (pageType === "package" && packageName) {
    return `Assalamualaikum, I am interested in the ${packageName} with Al-Gafur Tours. Please share departure details, pricing, and hotel information.`;
  }
  if (pageType === "booking") {
    return `Assalamualaikum, I am completing a booking on Al-Gafur website and need assistance with pilgrim details.`;
  }
  if (pageType === "contact") {
    return `Assalamualaikum, I want to inquire about upcoming Hajj and Umrah packages with Al-Gafur International Tours.`;
  }
  return `Assalamualaikum, I want information about Al-Gafur Hajj & Umrah packages.`;
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export interface WhatsAppSendResult {
  success: boolean;
  configured: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage({
  toPhone,
  templateKey,
  variables,
}: {
  toPhone: string;
  templateKey: string;
  variables: Record<string, string>;
}): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return {
      success: false,
      configured: false,
      error: "WhatsApp Cloud API integration not configured. Please add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Settings or .env.",
    };
  }

  try {
    const template = await prisma.whatsAppTemplate.findUnique({
      where: { templateKey },
    });

    let messageBody = template?.body || "Notification from Al-Gafur Tours";
    for (const [key, val] of Object.entries(variables)) {
      messageBody = messageBody.replaceAll(`{{${key}}}`, val);
    }

    const cleanPhone = toPhone.replace(/[^0-9]/g, "");
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: { body: messageBody },
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json();
      return {
        success: false,
        configured: true,
        error: errorJson?.error?.message || "WhatsApp API dispatch failed.",
      };
    }

    const resJson = await response.json();
    return {
      success: true,
      configured: true,
      messageId: resJson.messages?.[0]?.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error contacting WhatsApp API";
    return {
      success: false,
      configured: true,
      error: errorMsg,
    };
  }
}

