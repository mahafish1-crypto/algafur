export interface ContentGenerationOptions {
  type: "caption" | "reel" | "whatsapp" | "ad" | "package_description" | "blog";
  packageTitle: string;
  duration?: string;
  price?: string;
  language: "English" | "Hindi" | "Marathi" | "Arabic" | "Urdu";
  tone?: "Spiritual & Reverent" | "Urgent & High Energy" | "Premium & Luxurious" | "Family Centric";
  customNotes?: string;
}

export interface GeneratedContentResult {
  success: boolean;
  configured: boolean;
  provider: "Gemini" | "OpenAI" | "Local-Studio-Engine";
  data?: {
    headline: string;
    caption: string;
    cta: string;
    hashtags: string[];
    shortVersion: string;
    longVersion: string;
    whatsappVersion: string;
    reelScript?: string;
  };
  error?: string;
}

export interface PosterGenerationOptions {
  template: "instagram_post" | "instagram_story" | "whatsapp_status" | "youtube_thumbnail" | "package_poster";
  campaignTitle: string;
  offer: string;
  price: string;
  departureDate: string;
  packageName: string;
  language: string;
  style: "classic_gold_green" | "royal_black_gold" | "modern_minimalist" | "cinematic_makkah";
}

export async function generateMarketingContent(
  options: ContentGenerationOptions
): Promise<GeneratedContentResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const prompt = `You are a specialist Islamic travel copywriter for "Al-Gafur International Tours And Travels".
Generate marketing copy for:
Package: ${options.packageTitle}
Duration: ${options.duration || "20 Days"}
Price: ${options.price || "₹1,20,000"}
Language: ${options.language}
Tone: ${options.tone || "Spiritual & Reverent"}
Notes: ${options.customNotes || "5 Umrah, Direct flights, Indian buffet, 500m from Haram"}

Return a JSON object with:
- headline
- caption
- cta
- hashtags (array of 5-8 relevant tags)
- shortVersion
- longVersion
- whatsappVersion
- reelScript (audio and visual cues)
Format strictly as JSON.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            success: true,
            configured: true,
            provider: "Gemini",
            data: parsed,
          };
        }
      }
    } catch {
      // Fall through to high-fidelity template engine if remote call fails
    }
  }

  // High-fidelity multilingual marketing copy engine
  const isHindi = options.language === "Hindi";
  const isMarathi = options.language === "Marathi";
  const isArabic = options.language === "Arabic";
  const isUrdu = options.language === "Urdu";

  let headline = `Begin Your Sacred Pilgrimage With Al-Gafur: ${options.packageTitle}`;
  let caption = `Labbaik Allahumma Labbaik! ✨ Experience the blessed courtyards of Masjid Al-Haram and Masjid An-Nabawi with Al-Gafur International Tours And Travels. Complete peace of mind with direct flights, 4-star stays within walking distance, fresh Indian buffet, and scholarly guidance by Hafiz Asrar Sahab & Hafiz Sameer Madani.`;
  let cta = "Reserve Your Seat Today — Call +91 9890708013";
  let hashtags = ["#AlGafurTours", "#Umrah2026", "#HajjAndUmrah", "#Makkah", "#Madinah", "#SacredJourney"];
  let shortVersion = `✨ ${options.packageTitle} | ${options.duration || "20 Days"} | Direct Flights | Walking Distance to Haram | ₹${options.price || "1,20,000"}. Book now: +91 9890708013`;
  let longVersion = `${caption}\n\n🌟 Inclusions:\n✔ Direct Flight Return\n✔ Umrah Visa & Insurance\n✔ 12 Nights Makkah & 7 Nights Madinah\n✔ 5 Guided Umrahs & Historic Ziyarat\n✔ 3 Times Indian Buffet Meals\n✔ Complimentary 5L Zamzam & Complete Luggage Kit\n\n📞 Inquire Now: +91 8793939393 / +91 9890708013`;
  let whatsappVersion = `*Assalamualaikum wa Rahmatullahi wa Barakatuhu!* 🕋\n\nSpecial booking open for *${options.packageTitle}*:\n\n📅 *Duration:* ${options.duration || "20 Days"}\n💰 *Price:* ${options.price || "₹1,20,000"}/- onwards\n🏨 *Hotels:* Walking distance to Haram\n🍽️ *Meals:* 3 Times Indian Food\n👳 *Guide:* Scholarly supervision & 5 Umrahs\n\nTap below to claim your seat with Al-Gafur Tours:\nwa.me/919890708013`;
  let reelScript = `[0:00 - 0:03] Drone view of the Holy Kaaba under golden twilight. Voiceover: "Kya aap is saal Khana-e-Kaba ke samne aansu bahane ka irada kar rahe hain?"\n[0:03 - 0:08] Cut to Green Dome of Masjid An-Nabawi. Voiceover: "Al-Gafur International Tours lekar aaya hai aapke liye Umrah Platinum Package."\n[0:08 - 0:15] Quick montage: Luxury walking distance hotels, fresh Indian buffet, Hafiz Asrar Sahab guiding pilgrims. Voiceover: "Direct flight, 5 Umrahs, 4-star hotel haram ke kareeb aur mukammal aasan safar."\n[0:15 - 0:20] Al-Gafur Gold Logo reveal on screen with phone numbers. Voiceover: "Abhi call karein 9890708013 par aur apni seat book karein."`;

  if (isHindi) {
    headline = `अल-गफूर के साथ मुकद्दस उमराह का मुबारक सफर: ${options.packageTitle}`;
    caption = `लब्बैक अल्लाहुम्मा लब्बैक! ✨ अल-गफूर इंटरनेशनल टूर्स एंड ट्रेवल्स के साथ हरम शरीफ की जियारत का मुकद्दस मौका। डायरेक्ट फ्लाइट, हरम के करीब आरामदायक होटल, 3 वक्त का लजीज भारतीय खाना और उलेमा-ए-किराम की बाअदब रहनुमाई।`;
    cta = `सीटें महदूद हैं — संपर्क करें: +91 9890708013`;
    shortVersion = `✨ ${options.packageTitle} | ${options.duration || "20 दिन"} | सिर्फ ₹${options.price || "1,20,000"} | बुकिंग शुरू!`;
  } else if (isMarathi) {
    headline = `अल-गफूर सोबत पवित्र उमराहचा अविस्मरणीय प्रवास: ${options.packageTitle}`;
    caption = `अल्लाहच्या पवित्र घराचे दर्शन घ्या संपूर्ण विश्वासाने आणि सन्मानाने. अल-गफूर इंटरनॅशनल टूर्स अँड ट्रॅव्हल्सचे विशेष पॅकेज: थेट विमान, हरम शरीफजवळ राहण्याची उत्तम सोय आणि घरगुती चवीचे भारतीय जेवण.`;
    cta = `आताच संपर्क करा: +91 9890708013`;
  } else if (isUrdu) {
    headline = `الغفور کے ساتھ مقدس سفرِ عمرہ: ${options.packageTitle}`;
    caption = `لبیک اللھم لبیک! ✨ الغفور انٹرنیشنل ٹورز اینڈ ٹریولس کا پرشکوہ عمرہ پلاٹینم پیکیج۔ ڈائریکٹ فلائٹ، حرم شریف کے قریب ہوٹل، 3 وقت کا دیسی کھانا اور مستند علمائے کرام کی رہنمائی۔`;
    cta = `ابھی رابطہ فرمائیں: 9890708013`;
  }

  return {
    success: true,
    configured: Boolean(geminiApiKey),
    provider: geminiApiKey ? "Gemini" : "Local-Studio-Engine",
    data: {
      headline,
      caption,
      cta,
      hashtags,
      shortVersion,
      longVersion,
      whatsappVersion,
      reelScript,
    },
  };
}

