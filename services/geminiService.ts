import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const billSchema = {
    type: Type.OBJECT,
    properties: {
        amount: {
            type: Type.NUMBER,
            description: "The total numerical amount of the bill."
        }
    }
};

export const extractAmountFromBill = async (base64Image: string): Promise<number | null> => {
    try {
        console.log("Starting bill extraction with Gemini...");
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const textPart = {
            text: `Analyze the attached image of a receipt or bill. 
                   Find the single, final, total amount. This is often labeled 'Total', 'Grand Total', or 'Amount Due'. 
                   Ignore sub-totals, taxes, or tips if a final total is present. 
                   Return only this numeric value.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: billSchema,
            },
        });

        const jsonString = response.text.trim();
        if (!jsonString) {
            console.log("Gemini response was empty.");
            return null;
        }
        
        console.log("Received response from Gemini:", jsonString);
        const result = JSON.parse(jsonString);

        if (result && typeof result.amount === 'number' && result.amount > 0) {
            console.log("Successfully extracted amount:", result.amount);
            return result.amount;
        } else {
             console.warn("Parsed JSON from Gemini but 'amount' was missing, not a number, or not positive.", result);
             return null;
        }

    } catch (error) {
        console.error("Error processing bill with Gemini API:", error);
        // It's good practice to re-throw or handle the error appropriately
        // For this app, returning null and letting the UI handle it is fine.
        return null;
    }
};
