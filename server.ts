import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware with increased limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  // API Route for Gemini receipt extraction
  app.post("/api/gemini/extract-expense", async (req, res) => {
    try {
      const { base64Image, mimeType } = req.body;
      if (!base64Image || !mimeType) {
        return res.status(400).json({ error: "Missing image data" });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType
              }
            },
            {
              text: "Analyze this receipt or bill. Extract the total amount paid, a short description (merchant name or items), a suggested expense category (e.g. Food, Groceries, Utilities, Shopping, Travel, Entertainment, Health, Other), and the date of the transaction. Return a JSON object with amount (number), description (string), category (string), and date (YYYY-MM-DD string)."
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

      const jsonText = response.text || "{}";
      const result = JSON.parse(jsonText);
      res.json(result);
    } catch (error: any) {
      console.error("Server-side Gemini extraction error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Gemini bill extraction (text)
  app.post("/api/gemini/extract-bill", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing text" });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
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
      res.json(result);
    } catch (error: any) {
      console.error("Server-side Gemini bill extraction error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
