
export interface ExtractedExpense {
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface ExtractedBill {
  bankName: string;
  amount: number;
  billDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  last4Digits: string;
  minimumDue?: number;
}

export const extractBillDetails = async (text: string): Promise<ExtractedBill[]> => {
  try {
    const response = await fetch("/api/gemini/extract-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to extract bill details");
    }
    
    return await response.json() as ExtractedBill[];
  } catch (error) {
    console.error("Gemini extraction error:", error);
    return [];
  }
};

export const extractExpenseFromReceipt = async (base64Image: string, mimeType: string): Promise<ExtractedExpense | null> => {
  try {
    const response = await fetch("/api/gemini/extract-expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image, mimeType }),
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to extract expense details");
    }
    
    return await response.json() as ExtractedExpense;
  } catch (error) {
    console.error("Gemini expense extraction error:", error);
    return null;
  }
};
