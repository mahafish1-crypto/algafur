const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Al-Gafur Production Database ---');

  // Password for demo accounts: Admin@123456
  const passwordHash = await bcrypt.hash('Admin@123456', 10);

  // 1. Create Core Users
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@algafurtours.com' },
    update: { passwordHash },
    create: {
      name: 'Dr. Mudassir Sayyad (Super Admin)',
      email: 'admin@algafurtours.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      phone: '+91 8793939393',
      status: 'ACTIVE',
    },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@algafurtours.com' },
    update: { passwordHash },
    create: {
      name: 'Zahir Ali Pathan (Sales Head)',
      email: 'sales@algafurtours.com',
      passwordHash,
      role: 'SALES_EXECUTIVE',
      phone: '+91 9764444044',
      status: 'ACTIVE',
    },
  });

  const accountsUser = await prisma.user.upsert({
    where: { email: 'accounts@algafurtours.com' },
    update: { passwordHash },
    create: {
      name: 'Farhan Shaikh (Accounts)',
      email: 'accounts@algafurtours.com',
      passwordHash,
      role: 'ACCOUNTS',
      phone: '+91 9890708013',
      status: 'ACTIVE',
    },
  });

  const visaUser = await prisma.user.upsert({
    where: { email: 'visa@algafurtours.com' },
    update: { passwordHash },
    create: {
      name: 'Mohammad Tariq (Visa Specialist)',
      email: 'visa@algafurtours.com',
      passwordHash,
      role: 'VISA_TEAM',
      phone: '+91 9822114455',
      status: 'ACTIVE',
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@algafurtours.com' },
    update: { passwordHash },
    create: {
      name: 'Imran Qureshi (Pune Partner)',
      email: 'agent@algafurtours.com',
      passwordHash,
      role: 'AGENT',
      phone: '+91 9422032786',
      status: 'ACTIVE',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@algafurtours.com' },
    update: { passwordHash },
    create: {
      name: 'Haji Nizam Tamboli',
      email: 'customer@algafurtours.com',
      passwordHash,
      role: 'CUSTOMER',
      phone: '+91 8888890830',
      status: 'ACTIVE',
    },
  });

  // Agent profile
  await prisma.agent.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      agentCode: 'ALA-2026-001',
      agencyName: 'Al-Madinah Travels Pune',
      contactPerson: 'Imran Qureshi',
      phone: '+91 9422032786',
      email: 'agent@algafurtours.com',
      commissionRate: 5.0,
      totalCommissionEarned: 24000,
      pendingCommission: 12000,
      bankDetails: 'HDFC Bank, A/C 50200012345678, IFSC HDFC0001234',
    },
  });

  // 2. Hotels
  const hotelMakkah1 = await prisma.hotel.upsert({
    where: { id: 'hotel-diyafa-jamal' },
    update: {},
    create: {
      id: 'hotel-diyafa-jamal',
      name: 'Diyafa Jamal',
      city: 'MAKKAH',
      starRating: 4,
      distanceFromHaram: '500m',
      walkingTime: '6 mins walk',
      roomTypes: 'Quad, Triple, Double, Sharing',
      amenities: 'High-speed Wi-Fi, 24/7 Room Service, Lift, Indian Buffet Restaurant, Laundry Service',
      address: 'Ibrahim Al Khalil Road, Makkah Al Mukarramah',
      description: 'Comfortable and clean 4-star category hotel with direct walking route to King Abdulaziz Gate of Masjid Al-Haram.',
      pricePerNight: 4500,
      isAvailable: true,
    },
  });

  const hotelMadinah1 = await prisma.hotel.upsert({
    where: { id: 'hotel-ilaf-kuba' },
    update: {},
    create: {
      id: 'hotel-ilaf-kuba',
      name: 'Ilaf Kuba / Dar Al Taqwa',
      city: 'MADINAH',
      starRating: 4,
      distanceFromHaram: '400m',
      walkingTime: '5 mins walk',
      roomTypes: 'Quad, Triple, Double, Sharing',
      amenities: 'Free Wi-Fi, Spacious AC Rooms, Wheelchair Access, 24-hr Front Desk, Tea/Coffee maker',
      address: 'Central Northern Area, Near Masjid An-Nabawi, Madinah Munawwarah',
      description: 'Prime location hotel giving effortless access to ladies and gents gates of the Prophet’s Mosque.',
      pricePerNight: 4200,
      isAvailable: true,
    },
  });

  // 3. Flights
  const flightBOM_JED = await prisma.flight.upsert({
    where: { id: 'flight-sv-bom-jed' },
    update: {},
    create: {
      id: 'flight-sv-bom-jed',
      airline: 'Saudia / Direct Charter',
      flightNumber: 'SV-771',
      pnr: 'ALG9872',
      departureAirport: 'BOM (Mumbai Chhatrapati Shivaji Maharaj Intl)',
      arrivalAirport: 'MED (Prince Mohammad Bin Abdulaziz Intl, Madinah)',
      departureDate: '31 October 2026',
      departureTime: '06:30 AM',
      arrivalDate: '31 October 2026',
      arrivalTime: '09:45 AM',
      baggage: '2 x 23 kg check-in + 7 kg cabin + 5L Zamzam',
      cabin: 'Economy Class Direct',
      notes: 'Direct Flight from Mumbai to Madinah',
    },
  });

  // 4. Packages (Including the initial Platinum package from Reference Poster!)
  const platinumPackage = await prisma.package.upsert({
    where: { slug: 'umrah-platinum-package-2026' },
    update: {},
    create: {
      slug: 'umrah-platinum-package-2026',
      name: 'Umrah Platinum Package (20 Days)',
      type: 'UMRAH',
      year: '2026 / 1448 Hijri',
      durationDays: 20,
      makkahNights: 12,
      madinahNights: 7,
      basePrice: 120000,
      priceQuad: 120000,
      priceTriple: 132000,
      priceDouble: 148000,
      priceSingle: 185000,
      departureDate: '31 October 2026',
      returnDate: '19 November 2026',
      departureCity: 'Mumbai',
      makkahHotelId: hotelMakkah1.id,
      madinahHotelId: hotelMadinah1.id,
      makkahHotelName: 'Diyafa Jamal or similar',
      madinahHotelName: 'Ilaf Kuba or similar',
      makkahDistance: '500m walking distance',
      madinahDistance: '400m walking distance',
      totalSeats: 45,
      bookedSeats: 28,
      status: 'PUBLISHED',
      isFeatured: true,
      isPopular: true,
      badge: 'PLATINUM',
      featuredImage: '/brand/poster.jpg',
      overview: 'Experience a transformative, deeply spiritual 20-day Umrah journey with Al-Gafur International Tours And Travels. Featuring 5 Umrah pilgrimages, direct return flights from Mumbai, 12 blessed nights in Makkah Mukarrama, 7 peaceful nights in Madinah Munawwara, 3 times Indian buffet meals, full historic Ziyarat, guidance by respected scholars Hafiz Asrar Sahab & Hafiz Sameer Madani, and complete luggage kits.',
      travelRequirements: 'Valid Indian Passport with minimum 6 months validity from departure date. 2 Passport size photos with white background. Original Aadhaar Card copy. Confirmed vaccination certificates as per KSA rules.',
      termsAndConditions: '₹25,000 advance per pilgrim at the time of booking. Balance to be settled 15 days before departure. Flight tickets and visa once processed are subject to airline and KSA ministry policies.',
    },
  });

  // Add Package Inclusions & Exclusions for Platinum
  const inclusions = [
    { title: 'Air Ticket (Direct Flight)', description: 'Return direct flight Mumbai to Madinah and Jeddah to Mumbai', isIncluded: true, icon: 'Plane' },
    { title: 'Umrah Visa & Tourist Insurance', description: 'Complete official Umrah visa endorsement with comprehensive KSA health insurance', isIncluded: true, icon: 'ShieldCheck' },
    { title: '12 Nights Makkah Stay', description: 'Comfortable stay at Diyafa Jamal or similar hotel, within walking distance', isIncluded: true, icon: 'Building' },
    { title: '7 Nights Madinah Stay', description: 'Peaceful stay at Ilaf Kuba or similar hotel close to Masjid An-Nabawi', isIncluded: true, icon: 'Building' },
    { title: 'Religious Guidance & Bayan', description: 'Complete guidance by Hafiz Asrar Sahab and Hafiz Sameer Madani with educational lectures', isIncluded: true, icon: 'BookOpen' },
    { title: '5 Umrah Guided Pilgrimages', description: 'India arrival, Masjid Jorana, Masjid Ayesha (Tan’eem), Sulh Hudaibiya, and Taif', isIncluded: true, icon: 'Compass' },
    { title: '3 Times Indian Buffet Meals', description: 'Indian-style Breakfast, Lunch, and Dinner prepared by experienced Indian chefs', isIncluded: true, icon: 'Utensils' },
    { title: 'Full Ziyarat in Makkah & Madinah', description: 'Air-conditioned luxury coach tours to Cave of Hira, Thawr, Badr, Uhud, Wadi-e-Jinn, Bir-e-Usman', isIncluded: true, icon: 'MapPin' },
    { title: 'Free 5 Litre Zamzam Can', description: 'Complimentary 5L blessed Zamzam provided at airport upon return', isIncluded: true, icon: 'Droplets' },
    { title: 'Complete Pilgrim Travel Kit', description: 'High quality passport bag, cabin bag, trolley luggage bag, shoe bag, tasbeeh, and Ihram cloth', isIncluded: true, icon: 'Briefcase' },
    { title: 'Unlimited Laundry Service', description: 'Free clean laundry service during stays in Makkah and Madinah', isIncluded: true, icon: 'Sparkles' },
    { title: 'Room Service & Personal Expenses', description: 'Personal shopping, room service orders, and private individual taxis outside group schedule', isIncluded: false, icon: 'X' },
    { title: 'Excess Baggage Fees', description: 'Baggage beyond the 2x23kg airline quota', isIncluded: false, icon: 'X' },
  ];

  for (const inc of inclusions) {
    await prisma.packageInclusion.create({
      data: {
        packageId: platinumPackage.id,
        title: inc.title,
        description: inc.description,
        isIncluded: inc.isIncluded,
        icon: inc.icon,
      },
    });
  }

  // Itinerary for Platinum Package (20 Days)
  const itineraryDays = [
    { dayNumber: 1, title: 'Departure from Mumbai & Arrival in Madinah', location: 'Madinah', hotel: 'Ilaf Kuba', activities: 'Depart from Mumbai International Airport via direct flight. Arrive at Madinah Munawwarah, group check-in at hotel, initial Salaam at Masjid An-Nabawi with scholars.' },
    { dayNumber: 2, title: 'Peaceful Ibadah & Riaz-ul-Jannah Visit', location: 'Madinah', hotel: 'Ilaf Kuba', activities: 'Guided assistance for men and women slots in Riaz-ul-Jannah. Spiritual bayan after Maghrib by Hafiz Asrar Sahab.' },
    { dayNumber: 3, title: 'Madinah Historic Ziyarat', location: 'Madinah', hotel: 'Ilaf Kuba', activities: 'Tour to Masjid Quba (first mosque of Islam), Mount Uhud & Shuhada cemetery, Masjid Qiblatain, and Seven Mosques (Khandaq).' },
    { dayNumber: 4, title: 'Deep Heritage Ziyarat of Madinah', location: 'Madinah', hotel: 'Ilaf Kuba', activities: 'Visits to Bir Ali, Bir al-Gharas, garden of Hazrat Salman Farsi (r.a.), home of Hazrat Abdur Rahman bin Auf (r.a.), and Old Hejaz Railway.' },
    { dayNumber: 5, title: 'Spiritual Bayan & Quran Study', location: 'Madinah', hotel: 'Ilaf Kuba', activities: 'Special session on Sunnah and history of Madinah Munawwarah.' },
    { dayNumber: 6, title: 'Jummah Prayers in Masjid An-Nabawi', location: 'Madinah', hotel: 'Ilaf Kuba', activities: 'Perform Friday congregational prayers with millions of believers.' },
    { dayNumber: 7, title: 'Wadi-e-Aqiq & Free Day for Worship', location: 'Madinah', hotel: 'Ilaf Kuba', activities: 'Visit Wadi-e-Aqiq and Bir-e-Usman. Personal ibadah and preparation for Ihram.' },
    { dayNumber: 8, title: 'Ihram at Meeqat & Journey to Makkah (1st Umrah)', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Wear Ihram at hotel, stop at Meeqat Dhul Hulayfah for Niyyah. High-speed Haramain train/AC luxury coach to Makkah. Perform First Umrah with guides.' },
    { dayNumber: 9, title: 'Rest & Tahajjud in Masjid Al-Haram', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Perform Tawaf-e-Nafila and prayer in the holy sanctuary.' },
    { dayNumber: 10, title: 'Makkah Holy Ziyarat', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Visit Jabal al-Noor (Cave of Hira), Cave of Thawr, Mina, Muzdalifah, and Plains of Arafat (Jabal al-Rahmah).' },
    { dayNumber: 11, title: '2nd Umrah from Masjid Jorana', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Group excursion to historic Meeqat of Jorana where Prophet Muhammad (PBUH) put on Ihram. Perform second Umrah.' },
    { dayNumber: 12, title: 'Makkah Museum & Historic Sites', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Guided tour to Haram expansion exhibition, birthplace of Prophet (PBUH) library, and Masjid al-Ijaba.' },
    { dayNumber: 13, title: '3rd Umrah from Masjid Ayesha (Tan’eem)', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Short excursion to Tan’eem for Ihram and completion of third Umrah.' },
    { dayNumber: 14, title: 'Spiritual Lecture & Family Session', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Lecture on maintaining virtues after pilgrimage by Hafiz Sameer Madani.' },
    { dayNumber: 15, title: '4th Umrah from Sulh Hudaibiya', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Historic visit to Hudaibiya treaty well and museum. Ihram and fourth Umrah.' },
    { dayNumber: 16, title: 'Day Trip to Taif & 5th Umrah', location: 'Taif & Makkah', hotel: 'Diyafa Jamal', activities: 'Picturesque mountain drive to Taif. Visit Masjid Abdullah Ibn Abbas, perfumery, Addas garden. Return via Qarn al-Manazil for 5th Umrah.' },
    { dayNumber: 17, title: 'Congregational Tawaf & Zamzam', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Special dua session and group collection of blessed Zamzam supplies.' },
    { dayNumber: 18, title: 'Free Day for Souvenirs & Worship', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Free time for dates and gifts shopping at Souq Al Khalil and Safwah.' },
    { dayNumber: 19, title: 'Tawaf-e-Wida (Farewell Tawaf)', location: 'Makkah', hotel: 'Diyafa Jamal', activities: 'Perform emotional farewell Tawaf at Kaaba with sincere prayers for acceptance.' },
    { dayNumber: 20, title: 'Transfer to Jeddah Airport & Return to Mumbai', location: 'Transit', hotel: 'Transit', activities: 'Departure by luxury coach to King Abdulaziz Airport Jeddah. Return flight to Mumbai with sweet memories.' },
  ];

  for (const day of itineraryDays) {
    await prisma.packageItinerary.create({
      data: {
        packageId: platinumPackage.id,
        dayNumber: day.dayNumber,
        title: day.title,
        location: day.location,
        hotel: day.hotel,
        activities: day.activities,
        meals: 'Indian Breakfast, Lunch & Dinner Buffet',
        transport: 'AC Luxury Coach / Haramain Express',
        sortOrder: day.dayNumber,
      },
    });
  }

  // Add 2 other popular packages
  const economyPackage = await prisma.package.upsert({
    where: { slug: 'umrah-classic-economy-15-days' },
    update: {},
    create: {
      slug: 'umrah-classic-economy-15-days',
      name: 'Umrah Classic Economy (15 Days)',
      type: 'UMRAH',
      year: '2026 / 1448 Hijri',
      durationDays: 15,
      makkahNights: 8,
      madinahNights: 6,
      basePrice: 88000,
      priceQuad: 88000,
      priceTriple: 98000,
      priceDouble: 112000,
      departureDate: '15 November 2026',
      returnDate: '30 November 2026',
      departureCity: 'Mumbai',
      makkahHotelName: 'Rawabi Al Sham or similar',
      madinahHotelName: 'Safwat Al Madinah or similar',
      makkahDistance: '800m with 24/7 shuttle',
      madinahDistance: '600m walking',
      totalSeats: 50,
      bookedSeats: 35,
      status: 'PUBLISHED',
      isFeatured: true,
      isPopular: false,
      badge: 'BEST VALUE',
      featuredImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1200&auto=format&fit=crop',
      overview: 'Ideal for budget-conscious families seeking complete peace of mind, reliable transport, 3 daily Indian meals, and full Umrah visa assistance.',
    },
  });

  const ramadanPackage = await prisma.package.upsert({
    where: { slug: 'ramadan-blessed-last-15-days' },
    update: {},
    create: {
      slug: 'ramadan-blessed-last-15-days',
      name: 'Ramadan Blessed Last 15 Days & Eid-ul-Fitr',
      type: 'RAMADAN_UMRAH',
      year: '2027 / 1448 Hijri',
      durationDays: 15,
      makkahNights: 10,
      madinahNights: 5,
      basePrice: 165000,
      priceQuad: 165000,
      priceTriple: 185000,
      priceDouble: 215000,
      departureDate: '18 March 2027',
      returnDate: '02 April 2027',
      departureCity: 'Mumbai',
      makkahHotelName: 'Clock Tower / Swissotel or similar',
      madinahHotelName: 'Pullman Zamzam or similar',
      makkahDistance: 'Direct courtyard access',
      madinahDistance: '150m from ladies gate',
      totalSeats: 30,
      bookedSeats: 22,
      status: 'PUBLISHED',
      isFeatured: true,
      isPopular: true,
      badge: 'PREMIUM',
      featuredImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
      overview: 'Spend Laylatul Qadr in the Holy Haram of Makkah with complete suhoor and iftar buffet, 5-star hospitality, and celebrate Eid in Madinah Munawwara.',
    },
  });

  // 5. Departure Group
  const depGroup = await prisma.departureGroup.upsert({
    where: { id: 'dep-group-oct-2026' },
    update: {},
    create: {
      id: 'dep-group-oct-2026',
      groupName: 'Umrah Platinum Group — 31 October 2026',
      packageId: platinumPackage.id,
      departureDate: '31 October 2026',
      returnDate: '19 November 2026',
      totalCapacity: 45,
      confirmedTravellers: 28,
      flightId: flightBOM_JED.id,
      status: 'OPEN',
      notes: 'Main departure for Maharashtra pilgrims. Bus shuttle scheduled from Pune & Aurangabad to Mumbai Airport.',
    },
  });

  // 6. Customers & Leads
  const customer1 = await prisma.customer.upsert({
    where: { customerCode: 'ALC-2026-0001' },
    update: {},
    create: {
      customerCode: 'ALC-2026-0001',
      name: 'Haji Nizam Tamboli',
      email: 'customer@algafurtours.com',
      phone: '+91 8888890830',
      whatsapp: '+91 8888890830',
      address: '183, M.G. Road, 15 August Chowk, Khadda Market, Camp',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      passportNumber: 'Z1892345',
      nationality: 'Indian',
      notes: 'Travelling with family. Requires Quad room.',
    },
  });

  // Customer family members
  await prisma.customerFamilyMember.createMany({
    data: [
      { customerId: customer1.id, name: 'Zainab Nizam Tamboli', relationship: 'SPOUSE', passportNumber: 'Z1892346' },
      { customerId: customer1.id, name: 'Faizan Nizam Tamboli', relationship: 'CHILD', passportNumber: 'Z1892347' },
      { customerId: customer1.id, name: 'Ayesha Nizam Tamboli', relationship: 'CHILD', passportNumber: 'Z1892348' },
    ],
  });

  // 7. Booking
  const booking1 = await prisma.booking.upsert({
    where: { bookingNumber: 'ALG-2026-00001' },
    update: {},
    create: {
      bookingNumber: 'ALG-2026-00001',
      customerId: customer1.id,
      packageId: platinumPackage.id,
      departureGroupId: depGroup.id,
      journeyType: 'UMRAH',
      adults: 3,
      children: 1,
      roomType: 'QUAD',
      totalAmount: 480000,
      advanceAmount: 100000,
      paidAmount: 200000,
      outstandingAmount: 280000,
      paymentStatus: 'PARTIALLY_PAID',
      bookingStatus: 'CONFIRMED',
      specialRequests: 'Elderly assistance during Tawaf wheelchairs.',
      bookedById: salesUser.id,
    },
  });

  // Travellers for booking
  await prisma.bookingTraveller.createMany({
    data: [
      { bookingId: booking1.id, fullName: 'Haji Nizam Tamboli', passportNumber: 'Z1892345', roomType: 'QUAD', visaStatus: 'APPROVED' },
      { bookingId: booking1.id, fullName: 'Zainab Nizam Tamboli', passportNumber: 'Z1892346', roomType: 'QUAD', visaStatus: 'APPROVED' },
      { bookingId: booking1.id, fullName: 'Faizan Nizam Tamboli', passportNumber: 'Z1892347', roomType: 'QUAD', visaStatus: 'PROCESSING' },
      { bookingId: booking1.id, fullName: 'Ayesha Nizam Tamboli', passportNumber: 'Z1892348', roomType: 'QUAD', visaStatus: 'PROCESSING' },
    ],
  });

  // Payment 1
  await prisma.payment.upsert({
    where: { receiptNumber: 'ALR-2026-00001' },
    update: {},
    create: {
      receiptNumber: 'ALR-2026-00001',
      bookingId: booking1.id,
      customerId: customer1.id,
      amount: 100000,
      paymentMethod: 'BANK_TRANSFER',
      transactionId: 'NEFT2026100192847',
      status: 'PAID',
      notes: 'Initial booking token advance for 4 pax',
      createdById: accountsUser.id,
    },
  });

  // Payment 2
  await prisma.payment.upsert({
    where: { receiptNumber: 'ALR-2026-00002' },
    update: {},
    create: {
      receiptNumber: 'ALR-2026-00002',
      bookingId: booking1.id,
      customerId: customer1.id,
      amount: 100000,
      paymentMethod: 'UPI',
      transactionId: 'UPI/2026100588231',
      status: 'PAID',
      notes: 'First installment received',
      createdById: accountsUser.id,
    },
  });

  // Invoice
  await prisma.invoice.upsert({
    where: { invoiceNumber: 'ALI-2026-00001' },
    update: {},
    create: {
      invoiceNumber: 'ALI-2026-00001',
      bookingId: booking1.id,
      customerId: customer1.id,
      subtotal: 480000,
      discount: 0,
      tax: 0,
      total: 480000,
      paidAmount: 200000,
      balanceDue: 280000,
      dueDate: new Date('2026-10-15'),
      status: 'ISSUED',
      terms: 'Balance due 15 days before group departure.',
    },
  });

  // Quotation
  await prisma.quotation.upsert({
    where: { quotationNumber: 'ALQ-2026-00001' },
    update: {},
    create: {
      quotationNumber: 'ALQ-2026-00001',
      customerId: customer1.id,
      packageId: platinumPackage.id,
      travellersCount: 4,
      roomType: 'QUAD',
      subtotal: 480000,
      discount: 0,
      tax: 0,
      total: 480000,
      advanceRequired: 100000,
      balanceAmount: 380000,
      terms: 'Quotation valid for 7 days. Subject to airline seat availability.',
      status: 'ACCEPTED',
      createdById: salesUser.id,
    },
  });

  // Documents
  await prisma.document.createMany({
    data: [
      {
        customerId: customer1.id,
        bookingId: booking1.id,
        type: 'PASSPORT',
        fileName: 'Passport_Haji_Nizam.pdf',
        fileUrl: '/uploads/sample-passport.pdf',
        fileSize: 1024 * 350,
        status: 'VERIFIED',
        verifiedById: visaUser.id,
      },
      {
        customerId: customer1.id,
        bookingId: booking1.id,
        type: 'AADHAAR',
        fileName: 'Aadhaar_Haji_Nizam.pdf',
        fileUrl: '/uploads/sample-aadhaar.pdf',
        fileSize: 1024 * 210,
        status: 'VERIFIED',
        verifiedById: visaUser.id,
      },
      {
        customerId: customer1.id,
        bookingId: booking1.id,
        type: 'PASSPORT_PHOTO',
        fileName: 'Photo_White_Background.jpg',
        fileUrl: '/brand/img2.jpeg',
        fileSize: 1024 * 180,
        mimeType: 'image/jpeg',
        status: 'VERIFIED',
        verifiedById: visaUser.id,
      },
    ],
  });

  // Visa application
  await prisma.visaApplication.create({
    data: {
      customerId: customer1.id,
      bookingId: booking1.id,
      passportNumber: 'Z1892345',
      applicationNumber: 'KSA-VISA-982318',
      visaNumber: 'EV-2026-98124',
      status: 'APPROVED',
      submissionDate: new Date('2026-10-02'),
      approvalDate: new Date('2026-10-04'),
      expiryDate: new Date('2026-11-25'),
      notes: 'Tourist Umrah Multi-entry visa issued successfully.',
      assignedToId: visaUser.id,
    },
  });

  // 8. CRM Leads
  const sampleLeads = [
    {
      leadNumber: 'ALL-2026-0001',
      name: 'Rizwan Ahmed Merchant',
      mobile: '+91 9820198201',
      whatsapp: '+91 9820198201',
      email: 'rizwan.merchant@gmail.com',
      city: 'Mumbai',
      journeyType: 'UMRAH',
      packageInterest: 'Umrah Platinum Package (20 Days)',
      travelDate: 'October 2026',
      adults: 2,
      children: 0,
      budget: '₹2,50,000',
      source: 'Website',
      status: 'NEW',
      notes: 'Interested in Double sharing room with Haram view.',
      assignedToId: salesUser.id,
    },
    {
      leadNumber: 'ALL-2026-0002',
      name: 'Dr. Shahabuddin Ansari',
      mobile: '+91 9890123456',
      whatsapp: '+91 9890123456',
      email: 'dr.ansari@apollo.com',
      city: 'Aurangabad',
      journeyType: 'RAMADAN_UMRAH',
      packageInterest: 'Ramadan Blessed Last 15 Days',
      travelDate: 'March 2027',
      adults: 4,
      children: 1,
      budget: '₹7,00,000',
      source: 'WhatsApp',
      status: 'QUALIFIED',
      notes: 'Family booking for entire Ramadan last ashra.',
      assignedToId: salesUser.id,
    },
    {
      leadNumber: 'ALL-2026-0003',
      name: 'Maulana Abdul Qadir',
      mobile: '+91 9422119988',
      whatsapp: '+91 9422119988',
      email: 'abdulqadir@darululoom.in',
      city: 'Pune',
      journeyType: 'HAJJ',
      packageInterest: 'Executive Hajj 2027',
      travelDate: 'Hajj 2027',
      adults: 2,
      children: 0,
      budget: '₹9,50,000',
      source: 'Referral',
      status: 'PACKAGE_DISCUSSION',
      notes: 'Inquiring about Shifting vs Non-Shifting packages in Azizia.',
      assignedToId: salesUser.id,
    },
    {
      leadNumber: 'ALL-2026-0004',
      name: 'Suhail Khan',
      mobile: '+91 9823445566',
      whatsapp: '+91 9823445566',
      email: 'suhail.k@tcs.com',
      city: 'Nashik',
      journeyType: 'UMRAH',
      packageInterest: 'Umrah Classic Economy (15 Days)',
      travelDate: 'November 2026',
      adults: 3,
      children: 0,
      budget: '₹2,70,000',
      source: 'Meta Ads',
      status: 'QUOTATION_SENT',
      notes: 'Quotation sent on WhatsApp. Waiting for family decision.',
      assignedToId: salesUser.id,
    },
  ];

  for (const l of sampleLeads) {
    const lead = await prisma.lead.upsert({
      where: { leadNumber: l.leadNumber },
      update: {},
      create: l,
    });

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: salesUser.id,
        type: 'NOTE',
        description: `Lead registered via ${l.source}. Assigned to ${salesUser.name}.`,
      },
    });

    await prisma.followUp.create({
      data: {
        leadId: lead.id,
        userId: salesUser.id,
        date: new Date().toISOString().split('T')[0],
        time: '11:00',
        type: 'CALL',
        priority: 'HIGH',
        notes: `Call ${l.name} to discuss package inclusions and seat reservation.`,
        status: 'PENDING',
      },
    });
  }

  // 9. Testimonials
  const sampleTestimonials = [
    {
      customerName: 'Haji Nizam Tamboli',
      photo: '/brand/img2.jpeg',
      city: 'Pune, Maharashtra',
      packageTitle: 'Umrah Platinum Group 2026',
      rating: 5,
      reviewText: 'Alhamdulillah! Travelling with Al-Gafur was a life changing experience. The hotels in Makkah and Madinah were very close to the Haram, Indian food was fresh, and scholars guided every step of our 5 Umrahs with deep humility.',
      isFeatured: true,
      status: 'PUBLISHED',
    },
    {
      customerName: 'Adv. Farooq Baig',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      city: 'Mumbai',
      packageTitle: 'Ramadan Umrah Special',
      rating: 5,
      reviewText: 'From direct flight arrangements to flawless visa processing, Al-Gafur team handled everything like family. Highly recommended for elders and first-time pilgrims.',
      isFeatured: true,
      status: 'PUBLISHED',
    },
    {
      customerName: 'Haji Aslam Inamdar',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
      city: 'Ahmednagar',
      packageTitle: 'Umrah Deluxe Group',
      rating: 5,
      reviewText: 'The Taif tour and Ziyarat to Badr and Uhud were explained so beautifully by Hafiz Asrar Sahab. Everything promised on their poster was delivered 100%. May Allah reward them.',
      isFeatured: true,
      status: 'PUBLISHED',
    },
  ];

  for (const t of sampleTestimonials) {
    await prisma.testimonial.create({ data: t });
  }

  // 10. FAQs
  const sampleFaqs = [
    {
      question: 'What is included in the Al-Gafur Umrah Platinum Package?',
      answer: 'Our Platinum Package covers direct return flights from Mumbai, official Umrah visa with medical insurance, 12 nights in Makkah Mukarrama (Diyafa Jamal or similar), 7 nights in Madinah Munawwara (Ilaf Kuba or similar), 3 times Indian buffet meals, 5 guided Umrahs, comprehensive Ziyarat in Makkah & Madinah, free 5L Zamzam, and a complete luggage & Ihram kit.',
      category: 'UMRAH',
      sortOrder: 1,
    },
    {
      question: 'How many Umrahs are conducted during the 20-day tour?',
      answer: 'We conduct 5 blessed Umrahs with full scholar guidance: 1. Initial Umrah upon arrival, 2. From Masjid Jorana, 3. From Masjid Ayesha (Tan’eem), 4. From historic Sulh Hudaibiya, and 5. From Taif (Meeqat Qarn al-Manazil).',
      category: 'UMRAH',
      sortOrder: 2,
    },
    {
      question: 'What documents are required to apply for an Umrah Visa?',
      answer: 'Original Passport valid for at least 6 months, 2 passport size photographs with white background, and a copy of your Aadhaar card. Our visa team handles all portal submissions.',
      category: 'VISA',
      sortOrder: 3,
    },
    {
      question: 'How far are the hotels from Masjid Al-Haram and Masjid An-Nabawi?',
      answer: 'Our Makkah hotel (Diyafa Jamal) is approximately 500 meters walking distance, and our Madinah hotel (Ilaf Kuba) is approximately 400 meters walking distance from the sacred courtyards.',
      category: 'HOTELS',
      sortOrder: 4,
    },
    {
      question: 'Can I pay the package amount in installments?',
      answer: 'Yes! You can reserve your seat with an advance booking token of ₹25,000 per pilgrim. The remaining amount can be paid in convenient installments before departure.',
      category: 'PAYMENT',
      sortOrder: 5,
    },
  ];

  for (const f of sampleFaqs) {
    await prisma.fAQ.create({ data: f });
  }

  // 11. Blog Posts
  await prisma.blogPost.upsert({
    where: { slug: 'complete-umrah-guide-for-first-time-pilgrims' },
    update: {},
    create: {
      slug: 'complete-umrah-guide-for-first-time-pilgrims',
      title: 'Complete Umrah Step-by-Step Guide for First-Time Pilgrims',
      featuredImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'Learn the sacred rites of Umrah from wearing Ihram and entering the Meeqat to performing Tawaf, Sa’i, and Tahallul according to the Sunnah.',
      content: 'Umrah is one of the greatest spiritual blessings for a believer. In this comprehensive guide prepared by Al-Gafur International Tours And Travels, we explain the four primary pillars of Umrah: 1. Ihram with Niyyah at the Meeqat, 2. Tawaf of the Holy Kaaba (7 circuits), 3. Sa’i between Safa and Marwah (7 laps), and 4. Halq (shaving) or Taqsir (trimming) to exit the state of Ihram.',
      category: 'Umrah Guide',
      tags: 'Umrah, Guide, Makkah, Madinah, Pilgrimage',
      status: 'PUBLISHED',
    },
  });

  // 12. WhatsApp Templates
  const templates = [
    {
      templateKey: 'NEW_LEAD',
      name: 'New Lead Welcome Message',
      body: 'Assalamualaikum {{name}}! Thank you for inquiring with Al-Gafur International Tours And Travels for {{package}}. Our senior advisor will assist you with hotel details, flight schedule, and special offers. You can also reach us at +91 9890708013.',
      variables: JSON.stringify(['name', 'package']),
    },
    {
      templateKey: 'BOOKING_CONFIRMED',
      name: 'Booking Confirmation',
      body: 'Assalamualaikum {{name}}, congratulations! Your booking {{bookingNumber}} for {{package}} is confirmed. Departure date: {{departureDate}}. Download your receipt and portal access here: {{portalUrl}}.',
      variables: JSON.stringify(['name', 'bookingNumber', 'package', 'departureDate', 'portalUrl']),
    },
    {
      templateKey: 'PAYMENT_RECEIPT',
      name: 'Payment Receipt Notification',
      body: 'Assalamualaikum {{name}}, we have received your payment of ₹{{amount}} for Booking {{bookingNumber}}. Receipt No: {{receiptNumber}}. Outstanding balance: ₹{{outstanding}}.',
      variables: JSON.stringify(['name', 'amount', 'bookingNumber', 'receiptNumber', 'outstanding']),
    },
    {
      templateKey: 'VISA_APPROVED',
      name: 'Visa Approved Notification',
      body: 'Mubarak ho {{name}}! Your Umrah visa for Passport {{passportNumber}} has been APPROVED by the Ministry of Hajj & Umrah KSA. You can view your e-Visa on your Al-Gafur portal.',
      variables: JSON.stringify(['name', 'passportNumber']),
    },
  ];

  for (const tmpl of templates) {
    await prisma.whatsAppTemplate.upsert({
      where: { templateKey: tmpl.templateKey },
      update: {},
      create: tmpl,
    });
  }

  // 13. Site Settings
  const defaultSettings = [
    { key: 'COMPANY_NAME', value: 'Al-Gafur International Tours And Travels', category: 'BRAND' },
    { key: 'COMPANY_TAGLINE', value: 'Your Sacred Journey, Handled With Care.', category: 'BRAND' },
    { key: 'COMPANY_SUBTAGLINE', value: 'एक सफर जिंदगी में तब्दीली लानेवाला... इन्शाअल्लाह', category: 'BRAND' },
    { key: 'PHONE_PRIMARY', value: '+91 8793939393', category: 'CONTACT' },
    { key: 'PHONE_SECONDARY', value: '+91 9890708013', category: 'CONTACT' },
    { key: 'PHONE_TERTIARY', value: '+91 9764444044', category: 'CONTACT' },
    { key: 'WHATSAPP_NUMBER', value: '919890708013', category: 'WHATSAPP' },
    { key: 'EMAIL_PRIMARY', value: 'contact@algafurtours.com', category: 'CONTACT' },
    { key: 'HEAD_OFFICE', value: '183, M.G. Road, 15 August Chowk, Khadda Market, Camp, Pune - 411001, Maharashtra, India', category: 'CONTACT' },
    { key: 'CURRENCY', value: 'INR', category: 'GENERAL' },
    { key: 'HERO_HEADLINE', value: 'Your Sacred Journey, Handled With Care.', category: 'CMS' },
    { key: 'HERO_SUBTITLE', value: 'Premium Hajj & Umrah journeys with trusted guidance, comfortable stays and complete travel support.', category: 'CMS' },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('--- Database Seeded Successfully! ---');
  console.log('Super Admin: admin@algafurtours.com / Admin@123456');
  console.log('Sales Executive: sales@algafurtours.com / Admin@123456');
  console.log('Customer Portal: customer@algafurtours.com / Admin@123456');
  console.log('Agent Portal: agent@algafurtours.com / Admin@123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

