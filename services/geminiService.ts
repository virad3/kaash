
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Transaction, Liability } from '../types'; 

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Chat functionality will be impaired.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const modelName = "gemini-2.5-flash-preview-04-17";

export const askKaash = async (userQuery: string, transactions: Transaction[], liabilities: Liability[]): Promise<string> => { 
  if (!API_KEY) {
    return "I'm sorry, but my connection to the AI brain is not configured. Please contact support (API Key missing).";
  }
  
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

  const systemInstruction = `You are Kaash, an intelligent financial assistant.
Your role is to answer questions about the user's income, expenses, savings, and liabilities based ONLY on the data provided below.
Income, expenses, and savings are all recorded as 'transactions' with different types ('INCOME', 'EXPENSE', 'SAVING').
All transaction types (Income, Expense, Saving) and Liabilities now have a mandatory 'category' field.
For transactions, the 'description' field is optional. If missing, use its 'category' to refer to it.
For liabilities, the 'name' field is optional. If missing, use its 'category' to refer to it. Liabilities no longer have a 'notes' field.
Liabilities may have an optional 'loanTermInMonths' field indicating the total duration of the loan.
Do not make up information if it's not present in the data. Be concise and helpful.
If a question is vague, ask for clarification. If a question is outside the scope of analyzing the provided financial data, politely state that you can only answer questions about their finances.
Today's date is ${today}.

Analyze the provided data carefully. When amounts are mentioned, use currency symbols (e.g., ₹).
Data format: JSON arrays of transactions and liabilities.
An empty array means no data of that type.
Dates are in YYYY-MM-DD format.
'Liability Payment' is a specific expense category.

For liabilities:
- 'initialAmount' is the original loan/debt amount.
- 'amountRepaid' tracks the total PRINCIPAL that has been paid off. When a payment (EMI) is made, only the principal portion of that payment increases 'amountRepaid'.
- 'interestRate' is the annual interest rate.
- 'nextDueDate' is when the next payment is expected.
- The current outstanding principal (remaining liability) is calculated as 'initialAmount' - 'amountRepaid'.

'Saving' type transactions represent money set aside as savings.
---
FINANCIAL DATA:
All Transactions (Income, Expense, Savings):
${JSON.stringify(transactions, null, 2)}

Liabilities:
${JSON.stringify(liabilities, null, 2)}
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
