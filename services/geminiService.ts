
import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

// Function to get or initialize the AI client
const getAiClient = (): GoogleGenAI => {
    // Return existing client if already initialized
    if (ai) {
        return ai;
    }
    
    // The hosting environment must provide process.env.API_KEY.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
        // This provides a clear error message to the developer in the console
        // and in the UI via the catch block in the calling component.
        throw new Error("Gemini API key is not configured. Please ensure the API_KEY environment variable is set.");
    }

    // Initialize the client
    ai = new GoogleGenAI({ apiKey });
    return ai;
};


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
        const client = getAiClient(); // This will throw if the key is missing.

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

        const response = await client.models.generateContent({
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
        // Re-throw the error so the UI component can catch it and display a specific message.
        throw error;
    }
};
