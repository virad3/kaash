
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

async function parseJsonResponse<T>(response: Response, fallbackErrorMessage: string): Promise<T> {
  const text = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    // If not valid JSON, it might be an HTML error page from proxy/Cloud Run
    if (!response.ok) {
      throw new Error(`Server returned error (${response.status})`);
    }
    throw new Error(fallbackErrorMessage);
  }

  if (!response.ok) {
    throw new Error(data?.error || fallbackErrorMessage);
  }

  return data as T;
}

export const extractBillDetails = async (text: string): Promise<ExtractedBill[]> => {
  try {
    const response = await fetch("/api/gemini/extract-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    
    return await parseJsonResponse<ExtractedBill[]>(response, "Failed to extract bill details");
  } catch (error: any) {
    console.error("Gemini extraction error:", error);
    throw new Error(error.message || "Failed to extract bill details");
  }
};

export const extractExpenseFromReceipt = async (base64Image: string, mimeType: string): Promise<ExtractedExpense | null> => {
  try {
    const response = await fetch("/api/gemini/extract-expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image, mimeType }),
    });
    
    return await parseJsonResponse<ExtractedExpense>(response, "Failed to extract expense details");
  } catch (error: any) {
    console.error("Gemini expense extraction error:", error);
    throw new Error(error.message || "Failed to extract expense details");
  }
};
