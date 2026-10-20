import { GoogleGenAI } from "@google/genai";
console.log("API KEY is:", process.env.GEMINI_API_KEY?.substring(0, 5) + "...");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: "Hello"
}).then(res => console.log(res.text)).catch(err => console.error(err.message));
