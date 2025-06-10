
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Transaction, Liability, SavingsGoal } from '../types'; 

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Chat functionality will be impaired.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const modelName = "gemini-2.5-flash-preview-04-17";

export const askKaash = async (userQuery: string, transactions: Transaction[], liabilities: Liability[], savingsGoals: SavingsGoal[]): Promise<string> => {
  if (!API_KEY) {
    return "I'm sorry, but my connection to the AI brain is not configured. Please contact support (API Key missing).";
  }
  
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

  const systemInstruction = `You are Kaash, an intelligent financial assistant.
Your role is to answer questions about the user's income, expenses, liabilities, and savings goals based ONLY on the data provided below.
Do not make up information if it's not present in the data. Be concise and helpful.
If a question is vague, ask for clarification. If a question is outside the scope of analyzing the provided financial data, politely state that you can only answer questions about their finances.
Today's date is ${today}.

Analyze the provided data carefully. When amounts are mentioned, use currency symbols (e.g., ₹).
Data format: JSON arrays of income transactions, expense transactions, liabilities, and savings goals.
An empty array means no data of that type.
Dates are in YYYY-MM-DD format.
Expense categories help in summarizing spending. 'Liability Payment' and 'Savings Goal Contribution' are specific expense categories.
For liabilities, 'initialAmount' is the original loan/debt, 'amountRepaid' is how much principal has been paid, and 'nextDueDate' is when the next payment is expected. The remaining amount for a liability is 'initialAmount' - 'amountRepaid'.
For savings goals, 'targetAmount' is the desired amount to save, and 'currentAmount' is how much has been saved so far.
---
FINANCIAL DATA:
Income Transactions:
${JSON.stringify(transactions.filter(t => t.type === 'INCOME'), null, 2)}

Expense Transactions:
${JSON.stringify(transactions.filter(t => t.type === 'EXPENSE'), null, 2)}

Liabilities:
${JSON.stringify(liabilities, null, 2)}

Savings Goals:
${JSON.stringify(savingsGoals, null, 2)}
---
User Question:`;

  const fullPrompt = `${systemInstruction} ${userQuery}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: fullPrompt,
    });
    
    const textResponse = response.text;
    if (!textResponse) {
        return "I received an empty response. Could you try rephrasing your question?";
    }
    return textResponse;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return "There seems to be an issue with the API configuration. Please contact support (Invalid API Key).";
    }
    return "I'm having trouble processing your request right now. Please try again later.";
  }
};
