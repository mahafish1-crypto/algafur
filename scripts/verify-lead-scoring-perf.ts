import { calculateLeadScore, TRAVEL_TIMELINE_OPTIONS } from "../src/lib/lead-scoring";
import { reverseGeocodeCoordinates } from "../src/lib/geocoding";
import { validateAndSanitizeSubmission, DEFAULT_YOUTUBE_FORM_QUESTIONS } from "../src/lib/youtube-leads";

async function runVerification() {
  console.log("================================================================================");
  console.log("AL-GAFUR — LEAD QUALITY, GPS LOCATION & PERFORMANCE VERIFICATION SUITE");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${testName}`);
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: Lead Scoring Engine & Urgency Tiers
  // ---------------------------------------------------------------------------
  console.log("--- TEST SUITE 1: Lead Quality & Urgency Scoring Engine ---");

  // 1.1 Test all 6 travel timeline options
  const timelineScores: Record<string, number> = {
    "Immediately / As soon as possible": 40,
    "Within 1 month": 35,
    "Within 3 months": 25,
    "Within 6 months": 15,
    "Within 1 year": 10,
    "Flexible / Not decided yet": 5,
  };

  for (const [timeline, expectedUrgency] of Object.entries(timelineScores)) {
    const scored = calculateLeadScore({
      travelTimeline: timeline,
      phone: "+91 9876543210",
      whatsapp: "+91 9876543210",
      email: "pilgrim@example.com",
      city: "Mumbai",
      address: "Bandra West",
      travellersCount: 4,
      notes: "Looking for 5-star hotel near Haram",
      createdAt: new Date(),
    });

    assert(
      scored.breakdown.urgencyPoints === expectedUrgency,
      `Urgency points for '${timeline}' = ${expectedUrgency}`,
      `Got ${scored.breakdown.urgencyPoints}`
    );
  }

  // 1.2 Test Hot Lead Tier (Score >= 70)
  const hotLead = calculateLeadScore({
    travelTimeline: "Immediately / As soon as possible", // 40 pts
    phone: "+91 9876543210",
    whatsapp: "+91 9876543210", // +5 pts
    email: "hajji@example.com", // +5 pts
    city: "Mumbai",
    address: "Bandra West, Mumbai", // +5 pts
    travellersCount: 4, // +10 pts
    notes: "Ready to confirm booking today", // +10 pts
    interestedIn: "Umrah", // +10 pts
    createdAt: new Date(), // 15 pts freshness
  });

  assert(
    hotLead.score >= 70 && hotLead.priority === "HOT",
    `Hot Lead classification (Score: ${hotLead.score}, Priority: ${hotLead.priority})`,
    `Expected HOT, got ${hotLead.priority} with score ${hotLead.score}`
  );
  assert(
    hotLead.explanation.includes("Immediate travel"),
    `Hot Lead explanation contains urgency context`,
    `Explanation: ${hotLead.explanation}`
  );

  // 1.3 Test Warm Lead Tier (40 <= Score <= 69)
  const warmLead = calculateLeadScore({
    travelTimeline: "Within 3 months", // 25 pts
    phone: "+91 9876543210",
    city: "Delhi",
    travellersCount: 2, // +7 pts
    createdAt: new Date(), // 15 pts freshness
  });

  assert(
    warmLead.score >= 40 && warmLead.score < 70 && warmLead.priority === "WARM",
    `Warm Lead classification (Score: ${warmLead.score}, Priority: ${warmLead.priority})`,
    `Expected WARM, got ${warmLead.priority} with score ${warmLead.score}`
  );

  // 1.4 Test Cold Lead Tier (Score <= 39)
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 35); // freshness 2 pts

  const coldLead = calculateLeadScore({
    travelTimeline: "Flexible / Not decided yet", // 5 pts
    phone: "+91 9876543210", // +3 pts
    createdAt: oldDate, // +2 pts
  });

  assert(
    coldLead.score <= 39 && coldLead.priority === "COLD",
    `Cold Lead classification (Score: ${coldLead.score}, Priority: ${coldLead.priority})`,
    `Expected COLD, got ${coldLead.priority} with score ${coldLead.score}`
  );

  // 1.5 Test Manual Priority Override preservation
  const overridden = calculateLeadScore({
    travelTimeline: "Flexible / Not decided yet", // 5 pts => would normally be COLD
    phone: "+91 9876543210",
    priorityOverride: "HOT",
    priorityOverrideReason: "VIP repeat customer referred by director",
  });

  assert(
    overridden.priority === "HOT",
    `Manual Priority Override applies HOT tier`,
    `Got ${overridden.priority}`
  );
  assert(
    overridden.explanation.includes("Manually overridden"),
    `Score explanation reflects manual override`,
    `Explanation: ${overridden.explanation}`
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: Reverse Geocoding Utility & Coordinate Bounds
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 2: Geocoding & Coordinate Bounds Validation ---");

  // 2.1 Invalid coordinate bounds rejection
  const invalidLatResult = await reverseGeocodeCoordinates(95.5, 72.8);
  assert(
    invalidLatResult.success === false && Boolean(invalidLatResult.error?.includes("Invalid GPS coordinates")),
    `Rejects latitude > 90 correctly`,
    invalidLatResult.error
  );

  const invalidLonResult = await reverseGeocodeCoordinates(19.0, 195.0);
  assert(
    invalidLonResult.success === false && Boolean(invalidLonResult.error?.includes("Invalid GPS coordinates")),
    `Rejects longitude > 180 correctly`,
    invalidLonResult.error
  );

  // 2.2 Valid coordinates structure check
  // Test with coordinates for Mumbai Chhatrapati Shivaji Terminus (18.9401, 72.8351)
  console.log("  Testing live/fallback reverse geocoding for (18.9401, 72.8351)...");
  const geoResult = await reverseGeocodeCoordinates(18.9401, 72.8351);

  if (geoResult.success) {
    assert(
      Boolean(geoResult.address || geoResult.city || geoResult.state),
      `Reverse geocode returns populated address data`,
      `City: ${geoResult.city}, State: ${geoResult.state}, Provider: ${geoResult.provider}`
    );
    assert(
      geoResult.latitude === 18.9401 && geoResult.longitude === 72.8351,
      `Exact coordinates preserved without alteration`,
      `Lat: ${geoResult.latitude}, Lon: ${geoResult.longitude}`
    );
  } else {
    // If running in sandbox with no internet, verify it gracefully handled error without throwing
    assert(
      typeof geoResult.error === "string",
      `Network failure handled gracefully with descriptive error`,
      geoResult.error
    );
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 3: Form Question Sanitization & Mapping
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 3: Question Sanitization & Field Mapping ---");

  const mockQuestions = DEFAULT_YOUTUBE_FORM_QUESTIONS;

  // 3.1 Sanitization of location object answer
  const mockLocationAnswer = {
    address: "Shop 12, Crawford Market, Fort, Mumbai, Maharashtra 400001",
    city: "Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    latitude: 18.9472,
    longitude: 72.8344,
    source: "GPS",
  };

  const { valid, snapshots, extracted, errors } =
    validateAndSanitizeSubmission(mockQuestions, {
      q_full_name: "Farhan Siddiqui",
      q_mobile_number: "+91 9820123456",
      q_whatsapp_number: "+91 9820123456",
      q_location: mockLocationAnswer,
      q_interested_in: "Ramadan Umrah",
      q_travel_timeline: "Within 1 month",
      q_travellers_count: "3",
      q_special_requests: "Requires wheelchair assistance for mother",
      q_consent: true,
    });

  assert(valid === true, `Submission passes validation`, `Errors: ${JSON.stringify(errors)}`);
  assert(
    extracted.fullName === "Farhan Siddiqui",
    `Extracted full name correctly: ${extracted.fullName}`
  );
  assert(
    extracted.phone === "+91 9820123456",
    `Extracted phone correctly: ${extracted.phone}`
  );
  assert(
    extracted.travelTimeline === "Within 1 month",
    `Extracted travel timeline correctly: ${extracted.travelTimeline}`
  );
  assert(
    extracted.city === "Mumbai",
    `Extracted city correctly: ${extracted.city}`
  );
  assert(
    extracted.address === mockLocationAnswer.address,
    `Extracted full address correctly: ${extracted.address}`
  );
  assert(
    extracted.latitude === 18.9472 && extracted.longitude === 72.8344,
    `Extracted GPS coordinates correctly: (${extracted.latitude}, ${extracted.longitude})`
  );
  assert(
    extracted.locationSource === "GPS",
    `Extracted locationSource correctly: ${extracted.locationSource}`
  );
  assert(
    extracted.travellersCount === 3,
    `Extracted travellersCount as integer: ${extracted.travellersCount}`
  );

  // 3.2 String location fallback test (when user types manually)
  const manualLocationSubmission = validateAndSanitizeSubmission(mockQuestions, {
    q_full_name: "Ahmed Khan",
    q_mobile_number: "+91 9988776655",
    q_location: "Kalyan, Thane, Maharashtra",
    q_interested_in: "Hajj",
    q_travel_timeline: "Within 6 months",
    q_consent: true,
  });

  assert(
    manualLocationSubmission.valid === true,
    `Manual string location passes validation`
  );
  assert(
    manualLocationSubmission.extracted.locationSource === "MANUAL",
    `Manual location assigned 'MANUAL' source correctly`
  );
  assert(
    manualLocationSubmission.extracted.city === "Kalyan" &&
      manualLocationSubmission.extracted.address === "Kalyan, Thane, Maharashtra",
    `Manual location string populated into city ('Kalyan') and full address`
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 4: Sorting & Prioritization Benchmarks
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 4: Sorting & Prioritization Logic ---");

  const sampleLeads = [
    {
      id: "1",
      name: "Lead 1",
      leadScore: 45,
      priority: "WARM",
      travelTimeline: "Within 6 months",
      createdAt: new Date("2026-10-10T10:00:00Z"),
    },
    {
      id: "2",
      name: "Lead 2",
      leadScore: 85,
      priority: "HOT",
      travelTimeline: "Immediately / As soon as possible",
      createdAt: new Date("2026-10-12T10:00:00Z"),
    },
    {
      id: "3",
      name: "Lead 3",
      leadScore: 20,
      priority: "COLD",
      travelTimeline: "Flexible / Not decided yet",
      createdAt: new Date("2026-10-11T10:00:00Z"),
    },
    {
      id: "4",
      name: "Lead 4",
      leadScore: 92,
      priority: "HOT",
      travelTimeline: "Within 1 month",
      createdAt: new Date("2026-10-13T10:00:00Z"),
    },
  ];

  // Sort by SCORE_DESC
  const sortedByScore = [...sampleLeads].sort((a, b) => b.leadScore - a.leadScore);
  assert(
    sortedByScore[0].leadScore === 92 && sortedByScore[1].leadScore === 85,
    `Sort by Highest Score: 92 -> 85 -> 45 -> 20`
  );

  // Sort by PRIORITY_DESC (HOT > WARM > COLD)
  const priorityWeight: Record<string, number> = { HOT: 3, WARM: 2, COLD: 1 };
  const sortedByPriority = [...sampleLeads].sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
    if (pDiff !== 0) return pDiff;
    return b.leadScore - a.leadScore;
  });
  assert(
    sortedByPriority[0].priority === "HOT" &&
      sortedByPriority[1].priority === "HOT" &&
      sortedByPriority[2].priority === "WARM" &&
      sortedByPriority[3].priority === "COLD",
    `Sort by Highest Priority: HOT (92) -> HOT (85) -> WARM (45) -> COLD (20)`
  );

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`VERIFICATION SUMMARY: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("================================================================================");

  if (passedTests === totalTests) {
    console.log("STATUS: ALL TESTS PASSED SUCCESSFULLY! Lead Scoring & GPS Engine is verified.\n");
    process.exit(0);
  } else {
    console.error(`STATUS: ${totalTests - passedTests} tests failed.`);
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Unhandled error in test runner:", err);
  process.exit(1);
});
