
import { GoogleGenAI, Type } from "@google/genai";

// Ensure your API Key is correctly configured in your environment
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export interface ExtractedBill {
  bankName: string;
  amount: number;
  billDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  last4Digits: string;
  minimumDue?: number;
}

export const extractBillDetails = async (text: string): Promise<ExtractedBill[]> => {
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set process.env.API_KEY");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

    const jsonText = response.text || "[]";
    const result = JSON.parse(jsonText);
    return result as ExtractedBill[];
  } catch (error) {
    console.error("Gemini extraction error:", error);
    return [];
  }
};
