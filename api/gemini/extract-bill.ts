import { GoogleGenAI, Type } from "@google/genai";

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

export default async function handler(req: any, res: any) {
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

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON request body" });
    }
  }

  const { text } = body || {};
  if (!text) {
    return res.status(400).json({ error: "Missing text to analyze" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback gracefully to regex heuristic extraction if key not yet added
      const fallback = extractBillFallback(text);
      return res.status(200).json(fallback);
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
      return res.status(200).json(result);
    }
    const fallback = extractBillFallback(text);
    return res.status(200).json(fallback.length > 0 ? fallback : result);
  } catch (error: any) {
    console.warn("Gemini bill extraction warning, attempting fallback:", error?.message);
    const fallback = extractBillFallback(text);
    if (fallback.length > 0) {
      return res.status(200).json(fallback);
    }
    let message = error.message || "Failed to process text with AI";
    try {
      const parsed = JSON.parse(message);
      if (parsed?.error?.message) {
        message = parsed.error.message;
      }
    } catch {}
    return res.status(500).json({ error: message });
  }
}
