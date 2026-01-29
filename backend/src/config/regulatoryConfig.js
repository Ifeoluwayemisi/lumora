/**
 * Regulatory Configuration - Maps product categories to regulatory authorities
 * Used for sending alerts to appropriate agencies based on manufacturer's product type
 */

export const PRODUCT_CATEGORIES = {
  DRUGS: "drugs",
  FOOD: "food",
  COSMETICS: "cosmetics",
  OTHER: "other",
};

export const PRODUCT_CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.DRUGS]: "Drugs/Pharmaceuticals",
  [PRODUCT_CATEGORIES.FOOD]: "Food & Beverages",
  [PRODUCT_CATEGORIES.COSMETICS]: "Cosmetics & Personal Care",
  [PRODUCT_CATEGORIES.OTHER]: "Other",
};

/**
 * Regulatory bodies and their contact information
 * Maps each product category to the appropriate regulatory authority
 */
export const REGULATORY_MAPPING = {
  [PRODUCT_CATEGORIES.DRUGS]: {
    name: "NAFDAC",
    fullName: "National Agency for Food and Drug Administration and Control",
    email: process.env.NAFDAC_EMAIL || "alert@nafdac.gov.ng",
    website: "https://www.nafdac.gov.ng",
    description: "Pharmaceuticals and Medical Products",
  },
  [PRODUCT_CATEGORIES.FOOD]: {
    name: "FIRS Food Safety",
    fullName: "Federal Inspectorate Service - Food Safety Division",
    email: process.env.FIRS_FOOD_EMAIL || "food@firs.gov.ng",
    website: "https://www.firs.gov.ng",
    description: "Food and Beverage Products",
  },
  [PRODUCT_CATEGORIES.COSMETICS]: {
    name: "NAFDAC Cosmetics",
    fullName: "NAFDAC - Cosmetics Division",
    email: process.env.NAFDAC_COSMETICS_EMAIL || "cosmetics@nafdac.gov.ng",
    website: "https://www.nafdac.gov.ng",
    description: "Cosmetics and Personal Care Products",
  },
  [PRODUCT_CATEGORIES.OTHER]: {
    name: "Generic Regulatory",
    fullName: "Regulatory Authority",
    email: process.env.REGULATORY_ALERT_EMAIL || "alerts@regulatory.ng",
    website: "https://www.regulatory.ng",
    description: "Other Products",
  },
};

/**
 * Get regulatory body for a product category
 * @param {string} category - Product category
 * @returns {object} Regulatory body details
 */
export function getRegulatoryBody(category) {
  return (
    REGULATORY_MAPPING[category] || REGULATORY_MAPPING[PRODUCT_CATEGORIES.OTHER]
  );
}

/**
 * Validate product category
 * @param {string} category - Product category to validate
 * @returns {boolean} True if valid category
 */
export function isValidCategory(category) {
  return Object.values(PRODUCT_CATEGORIES).includes(category);
}

/**
 * Get all product categories with labels
 * @returns {array} Array of {value, label} pairs
 */
export function getAllCategories() {
  return Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
}
