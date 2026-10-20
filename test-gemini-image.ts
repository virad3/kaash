import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: {
    parts: [
      {
        inlineData: {
          data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          mimeType: "image/png"
        }
      },
      { text: "Analyze this receipt or bill. Extract the total amount paid, a short description (merchant name or items), a suggested expense category (e.g. Food, Groceries, Utilities, Shopping, Travel, Entertainment, Health, Other), and the date of the transaction. Return a JSON object with amount (number), description (string), category (string), and date (YYYY-MM-DD string)." }
    ]
  },
  config: { responseMimeType: "application/json" }
}).then(res => console.log(res.text)).catch(err => console.error(err));
