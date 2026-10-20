
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

// Client-side regex fallback for bill extraction in case of offline or server issue
export function parseBillDetailsLocally(text: string): ExtractedBill[] {
  const bills: ExtractedBill[] = [];
  const banks = ["HDFC", "SBI", "ICICI", "Axis", "Kotak", "Amex", "American Express", "Citi", "Citibank", "IndusInd", "RBL", "Standard Chartered", "Yes Bank", "HSBC", "Bank of Baroda", "PNB"];
  
  let detectedBank = "Credit Card";
  for (const bank of banks) {
    if (new RegExp(`\\b${bank}\\b`, 'i').test(text)) {
      detectedBank = bank;
      break;
    }
  }

  // Amount regex patterns
  const amountMatch = text.match(/(?:total\s+amount\s+due|amt\s+due|amount\s+due|total\s+due|bill\s+amount|due\s+amount|due\s+of)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/i)
    || text.match(/(?:rs\.?|inr|₹)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/i);

  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  // Due date regex patterns
  let dueDate: string | null = null;
  const dueMatch = text.match(/(?:payment\s+due\s+date|due\s+date|due\s+on|due\s+by|pay\s+by)\s*[:=-]?\s*([0-9]{1,4}[-/][0-9]{1,2}[-/][0-9]{1,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{2,4})/i);
  if (dueMatch) {
    const parsedDate = new Date(dueMatch[1]);
    if (!isNaN(parsedDate.getTime())) {
      dueDate = parsedDate.toISOString().split('T')[0];
    }
  }

  // Card last 4 digits
  let last4Digits = "";
  const cardMatch = text.match(/(?:ending\s+in|ending\s+with|card\s+no\.?|card\s+ending|[xX]{2,4})\s*[:#]?\s*([0-9]{4})/i);
  if (cardMatch) {
    last4Digits = cardMatch[1];
  }

  if (amount !== null && !isNaN(amount) && amount > 0) {
    bills.push({
      bankName: detectedBank,
      amount: amount,
      billDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      last4Digits: last4Digits,
      minimumDue: undefined
    });
  }

  return bills;
}

async function parseJsonResponse<T>(response: Response, fallbackErrorMessage: string): Promise<T> {
  const text = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    // If not valid JSON, it might be an HTML error page from proxy/Cloud Run
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("AI service endpoint not found (404). Please ensure the backend server is running.");
      }
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
    console.warn("Backend Gemini extraction failed, trying local extraction:", error);
    const localFallback = parseBillDetailsLocally(text);
    if (localFallback.length > 0) {
      return localFallback;
    }
    throw new Error(error.message || "Failed to extract bill details");
  }
};

export const extractExpenseFromReceipt = async (
  base64Image: string,
  mimeType: string,
  availableCategories?: string[]
): Promise<ExtractedExpense | null> => {
  try {
    const response = await fetch("/api/gemini/extract-expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image, mimeType, availableCategories }),
    });
    
    return await parseJsonResponse<ExtractedExpense>(response, "Failed to extract expense details");
  } catch (error: any) {
    console.error("Gemini expense extraction error:", error);
    throw new Error(error.message || "Failed to extract expense details");
  }
};
