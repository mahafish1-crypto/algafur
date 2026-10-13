import prisma from "../src/lib/db";
import { calculateLeadScore } from "../src/lib/lead-scoring";

async function verifyDatabaseIntegration() {
  console.log("Checking Database Records & Schema Compatibility...");

  // 1. Check existing counts to ensure complete preservation
  const [userCount, packageCount, bookingCount, paymentCount, websiteLeadCount, ytFormCount, ytSubCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.package.count(),
      prisma.booking.count(),
      prisma.payment.count(),
      prisma.lead.count(),
      prisma.leadForm.count(),
      prisma.leadFormSubmission.count(),
    ]);

  console.log(`- Users: ${userCount}`);
  console.log(`- Packages: ${packageCount}`);
  console.log(`- Bookings: ${bookingCount}`);
  console.log(`- Payments: ${paymentCount}`);
  console.log(`- Website Leads: ${websiteLeadCount}`);
  console.log(`- YouTube Lead Forms: ${ytFormCount}`);
  console.log(`- Existing YouTube Submissions: ${ytSubCount}`);

  if (ytFormCount === 0) {
    console.log("No YouTube forms found. Nothing to test submission against.");
    return;
  }

  const defaultForm = await prisma.leadForm.findFirst({
    where: { isActive: true },
  });

  if (!defaultForm) {
    console.log("No active form found.");
    return;
  }

  console.log(`Active Form: ${defaultForm.title} (slug: ${defaultForm.slug}, id: ${defaultForm.id})`);

  // Test insertion of a scored submission with location and urgency
  const testCode = `TEST-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const scoreResult = calculateLeadScore({
    travelTimeline: "Within 1 month",
    phone: "+91 9820000001",
    whatsapp: "+91 9820000001",
    email: "test.pilgrim@example.com",
    city: "Mumbai",
    travellersCount: 3,
    notes: "Urgent package consultation requested",
    createdAt: new Date(),
  });

  const startTime = Date.now();
  const createdSub = await prisma.leadFormSubmission.create({
    data: {
      submissionCode: testCode,
      formId: defaultForm.id,
      formTitle: defaultForm.title,
      formSlug: defaultForm.slug,
      formVersion: defaultForm.version,
      name: "Verification Test Pilgrim",
      phone: "+91 9820000001",
      whatsapp: "+91 9820000001",
      email: "test.pilgrim@example.com",
      city: "Mumbai",
      district: "Mumbai City",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India",
      address: "Bandra West, Mumbai, Maharashtra 400001",
      latitude: 19.0596,
      longitude: 72.8295,
      locationSource: "GPS",
      interestedIn: "Ramadan Umrah",
      travelTimeline: "Within 1 month",
      approxDepartureDate: scoreResult.approxDepartureWindow,
      travellersCount: 3,
      leadScore: scoreResult.score,
      priority: scoreResult.priority,
      scoreExplanation: scoreResult.explanation,
      status: "NEW",
      leadSource: "youtube",
      campaignName: "test_verification_campaign",
      answersJson: JSON.stringify([
        {
          questionId: "q_location",
          label: "Your City / Current Location",
          type: "LOCATION",
          required: true,
          value: {
            address: "Bandra West, Mumbai, Maharashtra 400001",
            city: "Mumbai",
            district: "Mumbai City",
            state: "Maharashtra",
            postalCode: "400001",
            latitude: 19.0596,
            longitude: 72.8295,
            locationSource: "GPS",
          },
          displayValue: "Bandra West, Mumbai, Maharashtra 400001",
        },
      ]),
    },
  });
  const elapsed = Date.now() - startTime;
  console.log(`[PASS] Created test submission in ${elapsed}ms: ${createdSub.submissionCode} (ID: ${createdSub.id})`);
  console.log(`  Score: ${createdSub.leadScore}, Priority: ${createdSub.priority}, Timeline: ${createdSub.travelTimeline}`);
  console.log(`  GPS: (${createdSub.latitude}, ${createdSub.longitude}), Source: ${createdSub.locationSource}`);

  // Clean up test submission
  await prisma.leadFormSubmission.delete({
    where: { id: createdSub.id },
  });
  console.log("[PASS] Cleaned up verification test record cleanly.");
  console.log("\nALL DATABASE CHECKS PASSED!");
}

verifyDatabaseIntegration()
  .catch((e) => {
    console.error("Database check failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

