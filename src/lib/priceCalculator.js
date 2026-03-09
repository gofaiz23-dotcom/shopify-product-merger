/**
 * Default pricing formula configuration.
 * User can override these values in the UI.
 */
export const DEFAULT_PRICING_CONFIG = {
  miscPercent: 10,
  ltlCost: 400,
  parcelCost: 100,
  commissionPercent: 15,
  profitPercent: 15,
  ltlKeywords: 'ltl,freight',
  parcelKeywords: 'parcel,ground',
}

/**
 * Check if ship type matches LTL (default: $400)
 */
function isLTL(shipType, ltlKeywords) {
  if (!shipType || !ltlKeywords) return false
  const v = String(shipType).trim().toLowerCase()
  const keywords = ltlKeywords.split(/[,;\s]+/).map(k => k.trim().toLowerCase()).filter(Boolean)
  return keywords.some(kw => v.includes(kw) || v === kw)
}

/**
 * Check if ship type matches Parcel/Ground (default: $100)
 */
function isParcel(shipType, parcelKeywords) {
  if (!shipType || !parcelKeywords) return false
  const v = String(shipType).trim().toLowerCase()
  const keywords = parcelKeywords.split(/[,;\s]+/).map(k => k.trim().toLowerCase()).filter(Boolean)
  return keywords.some(kw => v.includes(kw) || v === kw)
}

/**
 * Calculate Variant Price from merchant base price and ship type.
 *
 * Formula:
 * 1. Base + 10% misc
 * 2. + Shipping (LTL: $400, Parcel: $100)
 * 3. + 15% marketplace commission of (1+2)
 * 4. + 15% profit margin of subtotal
 * 5. Grand total = Variant Price
 *
 * @param {number} basePrice - Merchant price
 * @param {string} shipType - e.g. "LTL", "Parcel", "Ground"
 * @param {Object} config - Pricing config (miscPercent, ltlCost, parcelCost, etc.)
 * @returns {number|null} Calculated price or null if invalid
 */
export function calculateVariantPrice(basePrice, shipType, config = {}) {
  const c = { ...DEFAULT_PRICING_CONFIG, ...config }
  const base = parseFloat(String(basePrice).replace(/[^0-9.-]/g, ''))
  if (isNaN(base) || base <= 0) return null

  const miscPercent = parseFloat(c.miscPercent) || 0
  const commissionPercent = parseFloat(c.commissionPercent) || 0
  const profitPercent = parseFloat(c.profitPercent) || 0
  const ltlCost = parseFloat(c.ltlCost) || 0
  const parcelCost = parseFloat(c.parcelCost) || 0

  const miscAmount = base * (miscPercent / 100)
  const withMisc = base + miscAmount

  let shippingCost = parcelCost
  if (isLTL(shipType, c.ltlKeywords)) {
    shippingCost = ltlCost
  } else if (isParcel(shipType, c.parcelKeywords)) {
    shippingCost = parcelCost
  }

  const afterShipping = withMisc + shippingCost
  const commissionAmount = afterShipping * (commissionPercent / 100)
  const subtotal = afterShipping + commissionAmount
  const profitAmount = subtotal * (profitPercent / 100)
  const grandTotal = subtotal + profitAmount

  return Math.round(grandTotal * 100) / 100
}

/**
 * Get the step-by-step breakdown for display in the info modal.
 * Uses first row data if provided, otherwise shows generic formula with example.
 */
export function getPriceBreakdown(basePrice, shipType, config = {}) {
  const c = { ...DEFAULT_PRICING_CONFIG, ...config }
  const base = parseFloat(String(basePrice || 100).replace(/[^0-9.-]/g, ''))
  if (isNaN(base) || base <= 0) return null

  const miscPercent = parseFloat(c.miscPercent) || 0
  const commissionPercent = parseFloat(c.commissionPercent) || 0
  const profitPercent = parseFloat(c.profitPercent) || 0
  const ltlCost = parseFloat(c.ltlCost) || 0
  const parcelCost = parseFloat(c.parcelCost) || 0

  const miscAmount = base * (miscPercent / 100)
  const withMisc = base + miscAmount

  let shippingCost = parcelCost
  const v = String(shipType || '').trim().toLowerCase()
  let shippingLabel
  if (isLTL(shipType, c.ltlKeywords)) {
    shippingCost = ltlCost
    shippingLabel = `LTL ($${ltlCost})`
  } else if (v.includes('ground')) {
    shippingLabel = `Ground ($${parcelCost})`
  } else if (isParcel(shipType, c.parcelKeywords)) {
    shippingLabel = `Parcel ($${parcelCost})`
  } else {
    shippingLabel = `Parcel ($${parcelCost})`
  }

  const afterShipping = withMisc + shippingCost
  const commissionAmount = afterShipping * (commissionPercent / 100)
  const subtotal = afterShipping + commissionAmount
  const profitAmount = subtotal * (profitPercent / 100)
  const grandTotal = subtotal + profitAmount

  return {
    base,
    miscPercent,
    miscAmount,
    withMisc,
    shippingLabel,
    shippingCost,
    afterShipping,
    commissionPercent,
    commissionAmount,
    subtotal,
    profitPercent,
    profitAmount,
    grandTotal: Math.round(grandTotal * 100) / 100,
  }
}
