import Papa from 'papaparse'
import { SHOPIFY_CSV_HEADERS } from './shopifyColumns'
import { detectCategory, isTaxonomyFormat } from './categoryMapper'
import { calculateVariantPrice } from './priceCalculator'

/**
 * Find mapping key that represents ship type (when using sample headers or shopify keys).
 */
function getShipTypeMappingKey(mapping) {
  if (mapping.shipType) return 'shipType'
  return Object.keys(mapping || {}).find(k =>
    (k || '').toLowerCase().includes('ship_type') || (k || '').toLowerCase().includes('shiptype')
  ) || null
}

/**
 * Find mapping key that represents base price (for formula).
 */
export function getBasePriceMappingKey(mapping) {
  if (mapping.price) return 'price'
  return Object.keys(mapping || {}).find(k => {
    const n = (k || '').toLowerCase().replace(/[\s_-]+/g, '')
    return (n.includes('tierprice') && n.includes('price')) || n === 'variantprice' || n === 'price'
  }) || null
}

/**
 * Get ship type value for price formula. Handles both Shopify keys (shipType) and sample headers (catalog_product_attribute.ship_type).
 */
export function getShipTypeForRow(row, mapping) {
  const key = getShipTypeMappingKey(mapping)
  if (!key) return 'parcel'
  const v = (row[key] ?? row.shipType ?? row['catalog_product_attribute.ship_type'] ?? '').toString().trim()
  return v || 'parcel'
}

function slugify(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function normalizeStatus(value) {
  const v = (value || '').toString().trim().toLowerCase()
  if (['disabled', '0', 'false', 'no', 'off', 'inactive', 'unpublished'].includes(v)) return 'draft'
  if (['draft'].includes(v)) return 'draft'
  if (['enabled', '1', 'true', 'yes', 'on', 'active', 'published'].includes(v) || v === '') return 'active'
  return 'active'
}

/**
 * Get raw status value from a row. Handles both Shopify keys and sample headers (e.g. catalog_product_attribute.status).
 */
function getRawStatusFromRow(row, sampleHeaders) {
  let v = row.status ?? row['catalog_product_attribute.status'] ?? row['Status']
  if (v !== undefined && v !== null && v !== '') return String(v).trim()
  const statusHeader = (sampleHeaders || []).find(h =>
    (h || '').toLowerCase().replace(/[\s._-]+/g, '').includes('status')
  )
  if (statusHeader && row[statusHeader] != null) return String(row[statusHeader]).trim()
  return ''
}

/**
 * Returns true if the row should be treated as disabled (moved to separate disabled sheet).
 */
export function isRowDisabled(row, sampleHeaders = null) {
  const v = getRawStatusFromRow(row, sampleHeaders).toLowerCase()
  return ['disabled', '0', 'false', 'no', 'off', 'inactive', 'unpublished', 'draft'].includes(v)
}

function downloadCsv(csv, filename) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Convert merged rows (with our internal keys) to Shopify CSV format and download.
 * Main file = active products only. Disabled products go to a separate file when requested.
 * @param {Array} mergedRows - Merged product rows
 * @param {Object} mapping - Column mapping
 * @param {boolean} [autoDetectCategories=true] - When true, auto-fill Product Category when empty
 * @param {Object} [pricingConfig] - Pricing formula config (misc%, LTL/parcel cost, etc.)
 * @param {{ exportType?: 'active' | 'disabled' | 'both' }} [options] - 'active' = main file only (default), 'disabled' = disabled file only, 'both' = both files
 */
export function exportShopifyCSV(mergedRows, mapping, autoDetectCategories = true, pricingConfig = {}, options = {}) {
  const { exportType = 'active' } = options
  const enabledRows = mergedRows.filter(row => !isRowDisabled(row, null))
  const disabledRows = mergedRows.filter(row => isRowDisabled(row, null))

  const toShopifyRow = (row) => {
    const out = {}
    SHOPIFY_CSV_HEADERS.forEach((header) => {
      out[header] = ''
    })

    const title = row.title || ''
    out['Handle'] = row.handle || slugify(title)
    out['Title'] = title
    out['Body (HTML)'] = row.description || ''
    out['Vendor'] = row.vendor || ''

    let productCategory = (row.productCategory || '').trim()
    if (!isTaxonomyFormat(productCategory)) {
      if (autoDetectCategories) {
        const detected = detectCategory(row)
        productCategory = detected || ''
      } else {
        productCategory = ''
      }
    }
    out['Product Category'] = productCategory
    out['Type'] = row.type || ''
    out['Tags'] = row.tags || ''
    out['Published'] = row.published !== undefined && row.published !== '' ? row.published : 'true'
    const statusVal = row.status ?? row['catalog_product_attribute.status'] ?? row['Status'] ?? ''
    out['Status'] = normalizeStatus(statusVal)
    out['SKU'] = row.sku || ''
    out['Barcode'] = row.barcode || ''
    out['Option1 Name'] = row.option1Name || ''
    out['Option1 Value'] = row.option1Value || ''
    out['Option1 Linked To'] = ''
    out['Option2 Name'] = row.option2Name || ''
    out['Option2 Value'] = row.option2Value || ''
    out['Option2 Linked To'] = ''
    out['Option3 Name'] = row.option3Name || ''
    out['Option3 Value'] = row.option3Value || ''
    out['Option3 Linked To'] = ''
    let variantPrice = row.price || ''
    if (mapping.price) {
      const shipType = getShipTypeForRow(row, mapping)
      const calc = calculateVariantPrice(row.price, shipType, pricingConfig)
      if (calc != null) variantPrice = String(calc)
    }
    out['Variant Price'] = variantPrice
    out['Compare at Price'] = row.compareAtPrice || ''
    out['Variant Cost'] = row.costPerItem || ''
    out['Variant Taxable'] = row.chargeTax !== undefined && row.chargeTax !== '' ? row.chargeTax : 'true'
    out['Tax Code'] = row.taxCode || ''
    out['Variant Inventory Tracker'] = row.inventoryTracker || ''
    out['Variant Inventory Qty'] = row.inventoryQuantity !== undefined && row.inventoryQuantity !== '' ? row.inventoryQuantity : '0'
    out['Variant Inventory Policy'] = row.continueSellingWhenOutOfStock || 'deny'
    out['Variant Weight'] = row.weightValue || '0'
    out['Variant Weight Unit'] = row.weightUnit || 'kg'
    out['Variant Requires Shipping'] = row.requiresShipping !== undefined && row.requiresShipping !== '' ? row.requiresShipping : 'true'
    out['Variant Fulfillment Service'] = row.fulfillmentService || 'manual'
    out['Image Src'] = row.imageUrl || ''
    out['Image Position'] = row.imagePosition !== undefined && row.imagePosition !== '' ? row.imagePosition : '1'
    out['Image Alt Text'] = row.imageAltText || ''
    out['Variant Image'] = row.variantImageUrl || ''
    out['Gift Card'] = row.giftCard || 'false'
    out['SEO Title'] = row.seoTitle || ''
    out['SEO Description'] = row.seoDescription || ''
    out['Google Shopping / Google Product Category'] = row.googleProductCategory || ''
    out['Google Shopping / Gender'] = row.googleGender || ''
    out['Google Shopping / Age Group'] = row.googleAgeGroup || ''
    out['Google Shopping / MPN'] = ''
    out['Google Shopping / AdWords Grouping'] = ''
    out['Google Shopping / AdWords Labels'] = ''
    out['Google Shopping / Condition'] = row.googleCondition || ''
    out['Google Shopping / Custom Product'] = ''
    out['Google Shopping / Custom Label 0'] = ''
    out['Google Shopping / Custom Label 1'] = ''
    out['Google Shopping / Custom Label 2'] = ''
    out['Google Shopping / Custom Label 3'] = ''
    out['Google Shopping / Custom Label 4'] = ''

    return out
  }

  if (exportType === 'active' || exportType === 'both') {
    const mainRows = enabledRows.map(toShopifyRow)
    const mainCsv = Papa.unparse(mainRows, { columns: SHOPIFY_CSV_HEADERS })
    downloadCsv(mainCsv, 'shopify_products.csv')
  }

  if ((exportType === 'disabled' || exportType === 'both') && disabledRows.length > 0) {
    const doDisabled = () => {
      const disabledMainRows = disabledRows.map(toShopifyRow)
      const disabledCsv = Papa.unparse(disabledMainRows, { columns: SHOPIFY_CSV_HEADERS })
      downloadCsv(disabledCsv, 'shopify_products_disabled.csv')
    }
    if (exportType === 'both') setTimeout(doDisabled, 150)
    else doDisabled()
  }
}

function isProductCategoryHeader(header) {
  const n = (header || '').toLowerCase().replace(/[\s_-]+/g, ' ')
  return n === 'product category' || n === 'product_category' || n === 'category'
}

function isStatusHeader(header) {
  const n = (header || '').toLowerCase().replace(/[\s._-]+/g, '')
  return n === 'status' || n.includes('status')
}

/**
 * Export merged rows using sample sheet headers. Output format matches the user's sample file.
 * Main file = active products only. Disabled products go to a separate file when requested.
 * @param {Array} mergedRows - Merged product rows
 * @param {string[]} sampleHeaders - Column headers from sample file
 * @param {string} [sampleFileName] - Sample file name for download
 * @param {boolean} [autoDetectCategories=true] - When true, auto-fill Product Category when empty
 * @param {Object} [mapping] - Column mapping (for price formula)
 * @param {Object} [pricingConfig] - Pricing formula config
 * @param {{ exportType?: 'active' | 'disabled' | 'both' }} [options] - 'active' = main file only (default), 'disabled' = disabled file only, 'both' = both files
 */
export function exportToSampleFormat(mergedRows, sampleHeaders, sampleFileName, autoDetectCategories = true, mapping = {}, pricingConfig = {}, options = {}) {
  if (!sampleHeaders || sampleHeaders.length === 0) return
  const { exportType = 'active' } = options
  const productCategoryHeader = sampleHeaders.find(h => isProductCategoryHeader(h))
  const basePriceKey = getBasePriceMappingKey(mapping)
  const shipTypeKey = getShipTypeMappingKey(mapping)
  const hasFormula = basePriceKey && (shipTypeKey || true)

  const enabledRows = mergedRows.filter(row => !isRowDisabled(row, sampleHeaders))
  const disabledRows = mergedRows.filter(row => isRowDisabled(row, sampleHeaders))

  const toSampleRow = (row) => {
    const out = {}
    sampleHeaders.forEach(h => {
      let val = row[h] != null ? String(row[h]).trim() : ''
      if (productCategoryHeader && h === productCategoryHeader) {
        if (!isTaxonomyFormat(val)) {
          if (autoDetectCategories) {
            const detected = detectCategory(row)
            val = detected || ''
          } else {
            val = ''
          }
        }
      }
      if (hasFormula && basePriceKey && h === basePriceKey) {
        const basePrice = row[basePriceKey] ?? row.price
        const shipType = getShipTypeForRow(row, mapping)
        const calc = calculateVariantPrice(basePrice, shipType, pricingConfig)
        if (calc != null) val = String(calc)
      }
      if (isStatusHeader(h)) {
        val = normalizeStatus(val)
      }
      out[h] = val
    })
    return out
  }

  const base = (sampleFileName || 'sample').replace(/\.(csv|xlsx|xls)$/i, '')

  if (exportType === 'active' || exportType === 'both') {
    const mainRows = enabledRows.map(toSampleRow)
    const mainCsv = Papa.unparse(mainRows, { columns: sampleHeaders })
    downloadCsv(mainCsv, `${base}_merged.csv`)
  }

  if ((exportType === 'disabled' || exportType === 'both') && disabledRows.length > 0) {
    const doDisabled = () => {
      const disabledOutRows = disabledRows.map(toSampleRow)
      const disabledCsv = Papa.unparse(disabledOutRows, { columns: sampleHeaders })
      downloadCsv(disabledCsv, `${base}_merged_disabled.csv`)
    }
    if (exportType === 'both') setTimeout(doDisabled, 150)
    else doDisabled()
  }
}
