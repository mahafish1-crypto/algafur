import prisma from "@/lib/db";

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
  errorCode?: "RATE_LIMIT" | "AUTH_ERROR" | "QUOTA_EXCEEDED" | "MODEL_UNAVAILABLE" | "NETWORK_ERROR" | "PARSE_ERROR";
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

async function getEffectiveGeminiConfig(): Promise<{ apiKey: string | null; modelName: string }> {
  let apiKey = process.env.GEMINI_API_KEY || null;
  let modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const dbSettings = await prisma.siteSetting.findMany({
      where: {
        key: { in: ["ai_gemini_api_key", "ai_model_name"] },
      },
    });

    for (const s of dbSettings) {
      if (s.key === "ai_gemini_api_key" && s.value && !apiKey) {
        apiKey = s.value;
      }
      if (s.key === "ai_model_name" && s.value) {
        modelName = s.value;
      }
    }
  } catch (err) {
    console.warn("Could not load AI settings from database, using env fallback:", err);
  }

  return { apiKey, modelName };
}

async function callGeminiApiWithRetry(
  prompt: string,
  apiKey: string,
  modelName: string,
  retries = 2
): Promise<{ text?: string; error?: string; errorCode?: GeneratedContentResult["errorCode"] }> {
  const modelsToTry = [modelName, "gemini-1.5-flash"];
  // remove duplicates
  const uniqueModels = Array.from(new Set(modelsToTry));

  for (const currentModel of uniqueModels) {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return { text: rawText };
          }
        }

        if (response.status === 429) {
          if (attempt < retries) {
            // Exponential backoff: 1s, 2s
            await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
            attempt++;
            continue;
          }
          return {
            error: "Gemini API rate limit reached or quota exhausted. Please try again shortly.",
            errorCode: "RATE_LIMIT",
          };
        }

        if (response.status === 401 || response.status === 403) {
          return {
            error: "Invalid Gemini API Key or permission denied.",
            errorCode: "AUTH_ERROR",
          };
        }

        if (response.status === 404) {
          // Model not found, try next model in loop
          break;
        }

        const errBody = await response.text().catch(() => "");
        console.warn(`Gemini API error (Status ${response.status}):`, errBody);
      } catch (err) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempt++;
          continue;
        }
        return {
          error: err instanceof Error ? err.message : "Network failure calling Gemini",
          errorCode: "NETWORK_ERROR",
        };
      }
      attempt++;
    }
  }

  return {
    error: "All Gemini models failed or returned non-200 status.",
    errorCode: "MODEL_UNAVAILABLE",
  };
}

export async function generateMarketingContent(
  options: ContentGenerationOptions
): Promise<GeneratedContentResult> {
  const { apiKey: geminiApiKey, modelName } = await getEffectiveGeminiConfig();

  let apiError: string | undefined;
  let apiErrorCode: GeneratedContentResult["errorCode"] | undefined;

  if (geminiApiKey) {
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

    const result = await callGeminiApiWithRetry(prompt, geminiApiKey, modelName);

    if (result.text) {
      try {
        const parsed = JSON.parse(result.text);
        return {
          success: true,
          configured: true,
          provider: "Gemini",
          data: parsed,
        };
      } catch {
        apiError = "AI returned invalid JSON formatting";
        apiErrorCode = "PARSE_ERROR";
      }
    } else {
      apiError = result.error;
      apiErrorCode = result.errorCode;
    }
  }

  // High-fidelity multilingual fallback marketing copy engine
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
    provider: "Local-Studio-Engine",
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
    error: apiError,
    errorCode: apiErrorCode,
  };
}
