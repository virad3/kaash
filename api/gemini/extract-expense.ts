import { GoogleGenAI, Type } from "@google/genai";

// Standard categories fallback
const STANDARD_EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Clothing', 'Housing', 'Education', 'Other'
];

const CATEGORY_KEYWORD_MAP: Record<string, string[]> = {
  Food: [
    'food', 'groceries', 'grocery', 'dining', 'restaurant', 'cafe', 'café', 'coffee',
    'supermarket', 'mart', 'bakery', 'snack', 'meal', 'bar & grill', 'pub', 'bistro',
    'takeout', 'takeaway', 'eatery', 'swiggy', 'zomato', 'doordash', 'ubereats', 'uber eats',
    'fast food', 'drinks', 'beverages', 'market', 'bread', 'milk', 'produce', 'fruits',
    'vegetables', 'meat', 'chicken', 'pizza', 'burger', 'starbucks', 'mcdonalds', "mcdonald's",
    'kfc', 'subway', 'dominos', "domino's", 'chipotle', 'dunkin', 'whole foods', 'trader joe',
    'trader joes', 'kroger', 'safeway', 'aldi', 'costco', 'walmart grocery', 'instacart',
    'foodstuff', 'lunch', 'dinner', 'breakfast', 'brunch', 'food and dining'
  ],
  Transport: [
    'transport', 'transportation', 'travel', 'flight', 'airline', 'airways', 'cab', 'taxi',
    'uber', 'lyft', 'ola', 'grab', 'gas', 'fuel', 'petrol', 'diesel', 'parking', 'toll',
    'fastag', 'ezpass', 'subway', 'metro', 'bus', 'train', 'railway', 'commute', 'commuter',
    'car rental', 'auto repair', 'oil change', 'jiffy lube', 'shell', 'chevron', 'bp',
    'exxon', 'speedway', 'delta', 'united', 'southwest', 'emirates', 'indigo', 'transit',
    'fare', 'ride', 'vehicle', 'ev charging', 'tesla supercharger'
  ],
  Healthcare: [
    'healthcare', 'health', 'medical', 'pharmacy', 'chemist', 'medicine', 'medication',
    'doctor', 'clinic', 'hospital', 'drugs', 'drugstore', 'dental', 'dentist', 'optometry',
    'optical', 'eyecare', 'optician', 'lenscrafters', 'glasses', 'prescription', 'wellness',
    'cvs', 'walgreens', 'rite aid', 'apollo pharmacy', 'medplus', 'boots', 'physician',
    'pediatric', 'pediatrician', 'therapy', 'therapist', 'lab test', 'diagnostic', 'pathology'
  ],
  Utilities: [
    'utilities', 'utility', 'electricity', 'electric', 'power', 'water', 'gas bill',
    'natural gas', 'broadband', 'internet', 'wifi', 'wi-fi', 'phone', 'mobile', 'cell',
    'cellular', 'recharge', 'telecom', 'trash', 'waste', 'sewage', 'sanitation', 'at&t',
    'verizon', 't-mobile', 'comcast', 'xfinity', 'spectrum', 'jio', 'airtel', 'vodafone',
    'electric bill', 'water bill'
  ],
  Entertainment: [
    'entertainment', 'movie', 'cinema', 'theatre', 'theater', 'concert', 'show', 'film',
    'game', 'gaming', 'steam', 'playstation', 'ps5', 'xbox', 'nintendo', 'netflix', 'spotify',
    'hulu', 'disney', 'disney+', 'youtube premium', 'apple tv', 'event', 'amusement park',
    'bowling', 'museum', 'subscription', 'streaming', 'ticketmaster', 'pvr', 'inox', 'amc',
    'nightclub', 'arcade', 'hobby'
  ],
  Clothing: [
    'clothing', 'clothes', 'apparel', 'garment', 'garments', 'footwear', 'shoes', 'sneakers',
    'fashion', 'wear', 'boutique', 'tailor', 'dry cleaning', 'laundry', 'zara', 'h&m',
    'nike', 'adidas', 'uniqlo', 'gap', "levi's", 'levis', 'nordstrom', 'shein', 'shirt',
    'pants', 'jeans', 'dress', 'jacket', 'coat', 'suit', 'outfit'
  ],
  Housing: [
    'housing', 'rent', 'mortgage', 'home', 'house', 'furniture', 'hardware', 'repair',
    'home improvement', 'home depot', "lowe's", 'lowes', 'ikea', 'ace hardware', 'plumbing',
    'locksmith', 'hoa', 'property tax', 'apartment', 'renovation', 'decor'
  ],
  Education: [
    'education', 'tuition', 'school', 'college', 'university', 'course', 'courses',
    'books', 'book', 'stationery', 'training', 'udemy', 'coursera', 'textbook',
    'barnes & noble', 'exam fee', 'tuition fee', 'classes', 'academy'
  ]
};

function matchCategory(extractedCategory?: string | null, description?: string | null, availableCategories: string[] = STANDARD_EXPENSE_CATEGORIES): string {
  if (!availableCategories || availableCategories.length === 0) return 'Food';
  const cleanExtracted = (extractedCategory || '').trim();
  const cleanDesc = (description || '').trim();

  if (cleanExtracted) {
    const directMatch = availableCategories.find(c => c.toLowerCase() === cleanExtracted.toLowerCase());
    if (directMatch) return directMatch;
  }

  const combinedSearchText = `${cleanExtracted} ${cleanDesc}`.toLowerCase();
  for (const cat of availableCategories) {
    if (combinedSearchText.includes(cat.toLowerCase())) {
      return cat;
    }
  }

  let bestCat: string | null = null;
  let maxScore = 0;
  for (const [standardCategory, keywords] of Object.entries(CATEGORY_KEYWORD_MAP)) {
    let score = 0;
    const extractedLower = cleanExtracted.toLowerCase();
    for (const kw of keywords) {
      if (extractedLower === kw) score += 15;
      else if (extractedLower.includes(kw)) score += 8;
    }
    const descLower = cleanDesc.toLowerCase();
    for (const kw of keywords) {
      if (descLower.includes(kw)) score += 4;
    }
    if (score > maxScore) {
      maxScore = score;
      bestCat = standardCategory;
    }
  }

  if (bestCat && maxScore > 0) {
    const matched = availableCategories.find(c => c.toLowerCase() === bestCat!.toLowerCase());
    if (matched) return matched;
  }

  const otherCat = availableCategories.find(c => c.toLowerCase() === 'other');
  if (otherCat) return otherCat;
  const foodCat = availableCategories.find(c => c.toLowerCase() === 'food');
  if (foodCat) return foodCat;
  return availableCategories[0];
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY. Please set GEMINI_API_KEY in your Vercel Project Settings > Environment Variables, then redeploy."
      });
    }

    // Safely parse body if sent as raw string
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: "Invalid JSON request body" });
      }
    }

    const { base64Image, mimeType, availableCategories } = body || {};
    if (!base64Image || !mimeType) {
      return res.status(400).json({ error: "Missing image data (base64Image and mimeType are required)" });
    }

    const validCategories: string[] = (Array.isArray(availableCategories) && availableCategories.length > 0)
      ? availableCategories
      : STANDARD_EXPENSE_CATEGORIES;

    const dynamicAi = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const promptText = `Analyze this receipt, bill, or invoice image carefully.
Extract the following transaction details:
1. amount: The final total amount paid as a positive number.
2. description: Merchant, restaurant, or store name, optionally with a short summary of purchased items (e.g., "Starbucks - Coffee", "Whole Foods - Groceries", "Shell - Fuel", "CVS - Medicine", "Zara - Shirt").
3. date: Date of the transaction formatted as YYYY-MM-DD.
4. category: Choose the single most accurate category strictly from this list of allowed categories:
[${validCategories.join(', ')}]

Category Guidelines:
- "Food": Groceries, supermarkets, restaurants, cafes, fast food, coffee shops, bakeries, snacks, food delivery (e.g., Walmart groceries, Trader Joe's, McDonald's, Uber Eats).
- "Transport": Fuel/gas stations, petrol, diesel, rideshares (Uber, Lyft), taxis, parking, tolls, public transit, flights, auto maintenance.
- "Housing": Home improvement, hardware (Home Depot, Lowe's), furniture, rent, repairs, home decor.
- "Utilities": Electricity, water, natural gas, internet, mobile phone bills, waste.
- "Entertainment": Movies, streaming, gaming, concerts, events, hobbies, night clubs.
- "Healthcare": Pharmacies, prescription medicines, doctor visits, dental, clinics, hospital bills, optical/glasses.
- "Clothing": Clothes, shoes, fashion apparel, accessories, laundry, dry cleaning.
- "Education": Books, textbooks, stationery, school supplies, tuition, courses.
- "Other": Use only if it does not belong to any other category.

You MUST return a JSON object with amount (number), description (string), category (string from allowed list), and date (YYYY-MM-DD string).`;

    const response = await dynamicAi.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
          },
          required: ["amount", "description", "category", "date"]
        }
      }
    });

    let jsonText = (response.text || "").trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    const result = JSON.parse(jsonText || "{}");
    
    // Normalize and validate category
    result.category = matchCategory(result.category, result.description, validCategories);

    if (result.date) {
      result.date = result.date.split('T')[0];
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Gemini receipt extraction error:", error);
    let message = error.message || "Failed to process receipt image with AI";
    try {
      const parsed = JSON.parse(message);
      if (parsed?.error?.message) {
        message = parsed.error.message;
      }
    } catch {}
    return res.status(500).json({ error: message });
  }
}
