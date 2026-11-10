export interface DefaultItineraryItem {
  dayNumber: number;
  title: string;
  location: "Makkah" | "Madinah" | "Transit" | "Taif" | "Jeddah";
  activities: string;
  meals: string;
  transport: string;
  hotel?: string;
}

export const STANDARD_15_DAY_ITINERARY: DefaultItineraryItem[] = [
  {
    dayNumber: 1,
    title: "Departure from Mumbai & Arrival in Madinah Munawwarah",
    location: "Transit",
    activities:
      "Assemble at Chhatrapati Shivaji Maharaj International Airport (BOM), Mumbai. Meet AL GAFUR group coordinator for baggage tagging and boarding pass assistance. Board direct flight to Madinah (MED). Upon arrival, meet our Saudi ground team and board air-conditioned luxury coach to hotel. Check-in, freshen up, and first group Salam at Masjid an-Nabawi.",
    meals: "Dinner",
    transport: "Direct Flight & Luxury Coach",
  },
  {
    dayNumber: 2,
    title: "First Tahajjud & Prayers in Riyadh-ul-Jannah",
    location: "Madinah",
    activities:
      "Perform Tahajjud and Fajr in Masjid an-Nabawi. Scheduled appointment for visiting Rawdah Rasool (Riyadh-ul-Jannah) for brothers and sisters under guided coordination with Nusuk permits. Group bayan on the virtues of the Prophet's City.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 3,
    title: "Historical Holy Ziyarat of Madinah Munawwarah",
    location: "Madinah",
    activities:
      "Guided AC coach tour of Madinah's sacred heritage: Masjid Quba (perform two voluntary rak'ahs with Umrah reward), Mount Uhud and Shuhada Uhud cemetery, Masjid al-Qiblatain (two-Qiblah mosque), and Saba Masajid (The Seven Mosques / Battle of the Trench).",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Luxury AC Coach",
  },
  {
    dayNumber: 4,
    title: "Spiritual Bayan & Personal Worship in Masjid an-Nabawi",
    location: "Madinah",
    activities:
      "Morning lecture on the Sunnah of Rasulullah ﷺ and etiquettes of sending Durood. Free afternoon and evening for personal reflection, Quran completion, and continuous Ibadah within the Prophet's Mosque.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 5,
    title: "Visit to Central Date Market & Souq Al-Tumoor",
    location: "Madinah",
    activities:
      "Visit the renowned Madinah Date Market (Souq Al-Tumoor) to purchase authentic Ajwa, Safawi, and Mabroom dates. Evening briefing and preparations for departure to Makkah.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Luxury AC Coach",
  },
  {
    dayNumber: 6,
    title: "Departure from Madinah & Entering Ihram at Miqat",
    location: "Transit",
    activities:
      "Check-out from Madinah hotel. Stop at Miqat (Masjid Dhul Hulaifah / Abyar Ali) to wear Ihram, offer two rak'ahs, make Umrah Niyyah, and recite Talbiyah under scholar leadership. Travel to Makkah Al-Mukarramah by luxury air-conditioned coach.",
    meals: "Breakfast, Dinner",
    transport: "Luxury AC Coach",
  },
  {
    dayNumber: 7,
    title: "Arrival in Makkah & Performance of 1st Umrah",
    location: "Makkah",
    activities:
      "Check-in to Makkah hotel, take a brief rest, and assemble in hotel lobby. Proceed together to Masjid Al-Haram. Perform Tawaf around the Holy Kaaba, Sa'i between Safa and Marwah, and Halq/Taqseer (shaving/trimming) under scholar guidance to successfully complete the first Umrah.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 8,
    title: "Day of Rest, Gratitude & Congregational Prayers at Kaaba",
    location: "Makkah",
    activities:
      "Rest and physical recovery following Umrah. Attend all five daily prayers in the Haram courtyard and upper decks. Group lecture on the history and spiritual secrets of the Holy Kaaba.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 9,
    title: "Comprehensive Makkah Historical Ziyarat",
    location: "Makkah",
    activities:
      "Guided tour of historical landmarks: Jabal al-Noor (Cave of Hira / Ghar Hira), Jabal Thawr (Cave of Thawr), Plains of Arafat and Jabal ar-Rahmah, Muzdalifah grounds, Mina tent valley, and Jamarat pillars.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Luxury AC Coach",
  },
  {
    dayNumber: 10,
    title: "2nd Guided Umrah from Masjid Aisha (Tan'eem)",
    location: "Makkah",
    activities:
      "Organized coach trip to Miqat Masjid Aisha (Tan'eem) for pilgrims wishing to perform a second Umrah on behalf of parents, family members, or deceased loved ones under full scholar guidance.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Luxury AC Coach",
  },
  {
    dayNumber: 11,
    title: "Free Day for Personal Ibadah & Tawaf-e-Nafilah",
    location: "Makkah",
    activities:
      "Free day dedicated to personal worship: multiple voluntary Tawafs around the Kaaba, sincere Duas at the Multazam and Hateem, and individual Quran recitation.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 12,
    title: "Optional Mountain Excursion to Taif Al-Mukarramah",
    location: "Taif",
    activities:
      "Scenic mountain coach drive to Taif. Visit Masjid Addas, Masjid Abdullah Ibn Abbas, historical rose water and perfume distilleries, and the scenic fruit market.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Luxury AC Coach",
  },
  {
    dayNumber: 13,
    title: "3rd Umrah Opportunity & Local Souvenir Shopping",
    location: "Makkah",
    activities:
      "Optional 3rd Umrah from Miqat Ji'ranah or Hudaybiyyah for enthusiastic pilgrims. Afternoon shopping in Clock Tower malls and Souq Al-Khalil for abayas, prayer mats, and Islamic books.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Luxury AC Coach",
  },
  {
    dayNumber: 14,
    title: "Tawaf-al-Wida (Farewell Tawaf) & Luggage Preparation",
    location: "Makkah",
    activities:
      "Gather in hotel lobby for scholar briefing on the etiquettes of Tawaf-al-Wida. Perform the emotional farewell Tawaf at Masjid Al-Haram. Evening baggage packing, weight check, and luggage tagging.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 15,
    title: "Jeddah Airport Transfer & Return Flight to Mumbai",
    location: "Transit",
    activities:
      "Final breakfast in Makkah. Luxury coach transfer to King Abdulaziz International Airport (JED), Jeddah. Receive guaranteed 5-litre sealed Zamzam bottles at the airport terminal. Board direct flight back to Mumbai (BOM) with memorable lifelong blessings.",
    meals: "Breakfast",
    transport: "Luxury Coach & Flight",
  },
];

export const STANDARD_20_DAY_ITINERARY: DefaultItineraryItem[] = [
  ...STANDARD_15_DAY_ITINERARY.slice(0, 13),
  {
    dayNumber: 14,
    title: "Spiritual Gathering & Dua-e-Khatm-ul-Quran",
    location: "Makkah",
    activities:
      "Full day devoted to Ibadah at Masjid Al-Haram. Special after-Isha gathering in hotel conference hall for group Dua-e-Khatm-ul-Quran and scholar reflections.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 15,
    title: "4th Guided Umrah from Hudaybiyyah Treaty Site",
    location: "Makkah",
    activities:
      "Visit the historic site of Sulh al-Hudaybiyyah (Treaty of Hudaybiyyah) and perform Niyyah from Miqat al-Hudaybiyyah for 4th Umrah.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Luxury AC Coach",
  },
  {
    dayNumber: 16,
    title: "Visit to Holy Kaaba Kiswa Factory & Islamic Museums",
    location: "Makkah",
    activities:
      "Educational excursion to the Holy Kaaba Kiswa Exhibition and Architecture Museum of the Two Holy Mosques, exploring the craftsmanship of Kaaba covers and ancient relics.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Luxury AC Coach",
  },
  {
    dayNumber: 17,
    title: "Deep Worship & Tahajjud at the Kaaba",
    location: "Makkah",
    activities:
      "Night worship program under scholar guidance at the Mataf floor. Opportunity for peaceful Duas under the golden spout (Mizab ar-Rahmah).",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 18,
    title: "Final Shopping & Souvenirs in Makkah",
    location: "Makkah",
    activities:
      "Leisure day for last-minute souvenir purchases: prayer rugs, attar perfumes, dates, and gifts for family back home.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 19,
    title: "Tawaf-al-Wida (Farewell Tawaf) & Baggage Weigh-In",
    location: "Makkah",
    activities:
      "Group assembly for Tawaf-al-Wida (Farewell Circumambulation). Group Dua at Hateem. Final packing and digital baggage weigh-in at hotel lobby.",
    meals: "Breakfast, Lunch, Dinner",
    transport: "Walking Distance",
  },
  {
    dayNumber: 20,
    title: "Jeddah Airport Departure & Return Flight to Mumbai",
    location: "Transit",
    activities:
      "Depart Makkah hotel by air-conditioned luxury coach to Jeddah Airport (JED). Receive complimentary sealed 5L Zamzam bottle. Board return flight to Mumbai (BOM) with accepted Umrah insha'Allah.",
    meals: "Breakfast",
    transport: "Luxury Coach & Flight",
  },
];

export function getStandardUmrahItinerary(durationDays: number = 15): DefaultItineraryItem[] {
  if (durationDays >= 20) {
    return STANDARD_20_DAY_ITINERARY;
  }
  return STANDARD_15_DAY_ITINERARY;
}
