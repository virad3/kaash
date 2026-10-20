import express, { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { matchExpenseCategory } from "../categoryMatcher";

const app = express();
app.use(express.json({ limit: "50mb" }));

// Helper function for regex-based fallback bill extraction
function extractBillFallback(text: string) {
  const bills: any[] = [];
  const banks = ["HDFC", "SBI", "ICICI", "Axis", "Kotak", "Amex", "American Express", "Citi", "Citibank", "IndusInd", "RBL", "Standard Chartered", "Yes Bank", "HSBC", "Bank of Baroda", "PNB"];
  
  let detectedBank = "Credit Card";
  for (const bank of banks) {
    if (new RegExp(`\\b${bank}\\b`, 'i').test(text)) {
      detectedBank = bank;
      break;
    }
  }

  const amountMatch = text.match(/(?:total\s+amount\s+due|amt\s+due|amount\s+due|total\s+due|bill\s+amount|due\s+amount|due\s+of)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/i)
    || text.match(/(?:rs\.?|inr|₹)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/i);

  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  let dueDate: string | null = null;
  const dueMatch = text.match(/(?:payment\s+due\s+date|due\s+date|due\s+on|due\s+by|pay\s+by)\s*[:=-]?\s*([0-9]{1,4}[-/][0-9]{1,2}[-/][0-9]{1,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{2,4})/i);
  if (dueMatch) {
    const parsedDate = new Date(dueMatch[1]);
    if (!isNaN(parsedDate.getTime())) {
      dueDate = parsedDate.toISOString().split('T')[0];
    }
  }

  let last4Digits = "";
  const cardMatch = text.match(/(?:ending\s+in|ending\s+with|card\s+no\.?|card\s+ending|[xX]{2,4})\s*[:#]?\s*([0-9]{4})/i);
  if (cardMatch) {
    last4Digits = cardMatch[1];
  }

  if (amount !== null && !isNaN(amount) && amount > 0) {
    bills.push({
      bankName: detectedBank,
      amount: amount,
      billDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      last4Digits: last4Digits,
      minimumDue: undefined
    });
  }

  return bills;
}

// Health check handler
const handleHealth = (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
};

// Extract expense handler
const handleExtractExpense = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing API Key. Please configure GEMINI_API_KEY in your environment variables.");
    }
    
    const dynamicAi = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    
    const { base64Image, mimeType, availableCategories } = req.body;
    if (!base64Image || !mimeType) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const validCategories: string[] = (Array.isArray(availableCategories) && availableCategories.length > 0)
      ? availableCategories
      : ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Clothing', 'Other'];

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
    
    // Normalize and validate category against allowed categories
    result.category = matchExpenseCategory(result.category, result.description, validCategories);

    if (result.date) {
      result.date = result.date.split('T')[0];
    }

    res.json(result);
  } catch (error: any) {
    console.error("Gemini extraction error:", error);
    let message = error.message || "Failed to process image with AI";
    try {
      const parsed = JSON.parse(message);
      if (parsed?.error?.message) {
        message = parsed.error.message;
      }
    } catch {}
    res.status(500).json({ error: message });
  }
};

// Extract bill handler
const handleExtractBill = async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = extractBillFallback(text);
      return res.json(fallback);
    }
    
    const dynamicAi = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await dynamicAi.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Analyze the following text (which may contain email snippets, SMS messages, or OCR text) and extract credit card bill details.
    
    Focus on extracting:
    - Bank Name (e.g., HDFC, SBI, ICICI, Amex)
    - Total Amount Due
    - Bill/Statement Date
    - Payment Due Date
    - Last 4 digits of the card number (often appearing as XX1234 or ending in 1234)

    Text to analyze: "${text}"
    
    Return a JSON array of objects. If a field is missing, omit it or use null.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              bankName: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              billDate: { type: Type.STRING, description: "Format YYYY-MM-DD" },
              dueDate: { type: Type.STRING, description: "Format YYYY-MM-DD" },
              last4Digits: { type: Type.STRING, description: "Last 4 digits of the card number" },
              minimumDue: { type: Type.NUMBER }
            },
            required: ["amount", "bankName"]
          }
        }
      }
    });

    let jsonText = (response.text || "").trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    const result = JSON.parse(jsonText || "[]");
    if (Array.isArray(result) && result.length > 0) {
      return res.json(result);
    }
    const fallback = extractBillFallback(text);
    res.json(fallback.length > 0 ? fallback : result);
  } catch (error: any) {
    console.warn("Gemini bill extraction warning, attempting fallback:", error?.message);
    const fallback = extractBillFallback(text);
    if (fallback.length > 0) {
      return res.json(fallback);
    }
    let message = error.message || "Failed to process text with AI";
    try {
      const parsed = JSON.parse(message);
      if (parsed?.error?.message) {
        message = parsed.error.message;
      }
    } catch {}
    res.status(500).json({ error: message });
  }
};

// Register routes supporting both /api prefix and root (for serverless rewriting)
app.get("/api/health", handleHealth);
app.get("/health", handleHealth);

app.post("/api/gemini/extract-expense", handleExtractExpense);
app.post("/gemini/extract-expense", handleExtractExpense);

app.post("/api/gemini/extract-bill", handleExtractBill);
app.post("/gemini/extract-bill", handleExtractBill);

export default app;
