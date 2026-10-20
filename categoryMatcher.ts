import { EXPENSE_CATEGORIES } from './constants';

export const STANDARD_EXPENSE_CATEGORIES: string[] = EXPENSE_CATEGORIES;

// Mapping of high-confidence keywords and synonyms to standard categories
const CATEGORY_KEYWORD_MAP: Record<string, string[]> = {
  Food: [
    'food', 'groceries', 'grocery', 'dining', 'restaurant', 'cafe', 'café', 'coffee',
    'supermarket', 'mart', 'bakery', 'snack', 'meal', 'bar & grill', 'pub', 'bistro',
    'takeout', 'takeaway', 'eatery', 'swiggy', 'zomato', 'doordash', 'ubereats', 'uber eats',
    'fast food', 'drinks', 'beverages', 'market', 'bread', 'milk', 'produce', 'fruits',
    'vegetables', 'meat', 'chicken', 'pizza', 'burger', 'starbucks', 'mcdonalds', "mcdonald's",
    'kfc', 'subway', 'dominos', "domino's", 'chipotle', 'dunkin', 'whole foods', 'trader joe',
    'trader joes', 'kroger', 'safeway', 'aldi', 'costco', 'walmart grocery', 'instacart',
    'foodstuff', 'lunch', 'dinner', 'breakfast', 'brunch', 'food and dining'
  ],
  Transport: [
    'transport', 'transportation', 'travel', 'flight', 'airline', 'airways', 'cab', 'taxi',
    'uber', 'lyft', 'ola', 'grab', 'gas', 'fuel', 'petrol', 'diesel', 'parking', 'toll',
    'fastag', 'ezpass', 'subway', 'metro', 'bus', 'train', 'railway', 'commute', 'commuter',
    'car rental', 'auto repair', 'oil change', 'jiffy lube', 'shell', 'chevron', 'bp',
    'exxon', 'speedway', 'delta', 'united', 'southwest', 'emirates', 'indigo', 'transit',
    'fare', 'ride', 'vehicle', 'ev charging', 'tesla supercharger'
  ],
  Healthcare: [
    'healthcare', 'health', 'medical', 'pharmacy', 'chemist', 'medicine', 'medication',
    'doctor', 'clinic', 'hospital', 'drugs', 'drugstore', 'dental', 'dentist', 'optometry',
    'optical', 'eyecare', 'optician', 'lenscrafters', 'glasses', 'prescription', 'wellness',
    'cvs', 'walgreens', 'rite aid', 'apollo pharmacy', 'medplus', 'boots', 'physician',
    'pediatric', 'pediatrician', 'therapy', 'therapist', 'lab test', 'diagnostic', 'pathology'
  ],
  Utilities: [
    'utilities', 'utility', 'electricity', 'electric', 'power', 'water', 'gas bill',
    'natural gas', 'broadband', 'internet', 'wifi', 'wi-fi', 'phone', 'mobile', 'cell',
    'cellular', 'recharge', 'telecom', 'trash', 'waste', 'sewage', 'sanitation', 'at&t',
    'verizon', 't-mobile', 'comcast', 'xfinity', 'spectrum', 'jio', 'airtel', 'vodafone',
    'electric bill', 'water bill'
  ],
  Entertainment: [
    'entertainment', 'movie', 'cinema', 'theatre', 'theater', 'concert', 'show', 'film',
    'game', 'gaming', 'steam', 'playstation', 'ps5', 'xbox', 'nintendo', 'netflix', 'spotify',
    'hulu', 'disney', 'disney+', 'youtube premium', 'apple tv', 'event', 'amusement park',
    'bowling', 'museum', 'subscription', 'streaming', 'ticketmaster', 'pvr', 'inox', 'amc',
    'nightclub', 'arcade', 'hobby'
  ],
  Clothing: [
    'clothing', 'clothes', 'apparel', 'garment', 'garments', 'footwear', 'shoes', 'sneakers',
    'fashion', 'wear', 'boutique', 'tailor', 'dry cleaning', 'laundry', 'zara', 'h&m',
    'nike', 'adidas', 'uniqlo', 'gap', "levi's", 'levis', 'nordstrom', 'shein', 'shirt',
    'pants', 'jeans', 'dress', 'jacket', 'coat', 'suit', 'outfit'
  ],
  Housing: [
    'housing', 'rent', 'mortgage', 'home', 'house', 'furniture', 'hardware', 'repair',
    'home improvement', 'home depot', "lowe's", 'lowes', 'ikea', 'ace hardware', 'plumbing',
    'locksmith', 'hoa', 'property tax', 'apartment', 'renovation', 'decor'
  ],
  Education: [
    'education', 'tuition', 'school', 'college', 'university', 'course', 'courses',
    'books', 'book', 'stationery', 'training', 'udemy', 'coursera', 'textbook',
    'barnes & noble', 'exam fee', 'tuition fee', 'classes', 'academy'
  ],
  'Debt Repayment': [
    'debt', 'debt repayment', 'loan repayment', 'emi', 'loan installment',
    'credit card payment', 'credit card bill payment', 'card payment'
  ],
  'Liability Payment': [
    'liability', 'liability payment'
  ]
};

/**
 * Intelligent expense category matcher.
 * Matches extracted receipt category and description against available categories
 * (including user-defined categories and standard categories).
 */
export function matchExpenseCategory(
  extractedCategory?: string | null,
  description?: string | null,
  availableCategories: string[] = STANDARD_EXPENSE_CATEGORIES
): string {
  if (!availableCategories || availableCategories.length === 0) {
    return 'Food';
  }

  const cleanExtracted = (extractedCategory || '').trim();
  const cleanDesc = (description || '').trim();

  // 1. Direct exact match in availableCategories
  if (cleanExtracted) {
    const directMatch = availableCategories.find(
      c => c.toLowerCase() === cleanExtracted.toLowerCase()
    );
    if (directMatch) {
      return directMatch;
    }
  }

  const combinedSearchText = `${cleanExtracted} ${cleanDesc}`.toLowerCase();

  // 2. Check user-defined categories first (if any custom categories exist)
  for (const cat of availableCategories) {
    const catLower = cat.toLowerCase();
    // If the category name appears directly in the search text
    if (combinedSearchText.includes(catLower)) {
      return cat;
    }
  }

  // 3. Match against known keyword mappings
  let bestStandardCategory: string | null = null;
  let maxKeywordScore = 0;

  for (const [standardCategory, keywords] of Object.entries(CATEGORY_KEYWORD_MAP)) {
    let score = 0;
    
    // Check extracted category for strong matches
    const extractedLower = cleanExtracted.toLowerCase();
    for (const kw of keywords) {
      if (extractedLower === kw) {
        score += 15;
      } else if (extractedLower.includes(kw)) {
        score += 8;
      }
    }

    // Check description for keyword occurrences
    const descLower = cleanDesc.toLowerCase();
    for (const kw of keywords) {
      if (descLower.includes(kw)) {
        score += 4;
      }
    }

    if (score > maxKeywordScore) {
      maxKeywordScore = score;
      bestStandardCategory = standardCategory;
    }
  }

  // If a high-confidence category was found
  if (bestStandardCategory && maxKeywordScore > 0) {
    // If that standard category exists in availableCategories, return it
    const matchedAvail = availableCategories.find(
      c => c.toLowerCase() === bestStandardCategory!.toLowerCase()
    );
    if (matchedAvail) {
      return matchedAvail;
    }
  }

  // 4. Fallback: check if 'Other' is available
  const otherCat = availableCategories.find(c => c.toLowerCase() === 'other');
  if (otherCat) {
    return otherCat;
  }

  // 5. If 'Other' is not present, prefer 'Food' as most common receipt type if available
  const foodCat = availableCategories.find(c => c.toLowerCase() === 'food');
  if (foodCat) {
    return foodCat;
  }

  // Final fallback: first available category
  return availableCategories[0];
}
