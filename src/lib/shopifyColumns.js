// Official Shopify product CSV columns (in order) – all included in export even if empty
export const SHOPIFY_CSV_HEADERS = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Product Category',
  'Type',
  'Tags',
  'Published',
  'Status',
  'SKU',
  'Barcode',
  'Option1 Name',
  'Option1 Value',
  'Option1 Linked To',
  'Option2 Name',
  'Option2 Value',
  'Option2 Linked To',
  'Option3 Name',
  'Option3 Value',
  'Option3 Linked To',
  'Variant Price',
  'Compare at Price',
  'Variant Cost',
  'Variant Taxable',
  'Tax Code',
  'Variant Inventory Tracker',
  'Variant Inventory Qty',
  'Variant Inventory Policy',
  'Variant Weight',
  'Variant Weight Unit',
  'Variant Requires Shipping',
  'Variant Fulfillment Service',
  'Image Src',
  'Image Position',
  'Image Alt Text',
  'Variant Image',
  'Gift Card',
  'SEO Title',
  'SEO Description',
  'Google Shopping / Google Product Category',
  'Google Shopping / Gender',
  'Google Shopping / Age Group',
  'Google Shopping / MPN',
  'Google Shopping / AdWords Grouping',
  'Google Shopping / AdWords Labels',
  'Google Shopping / Condition',
  'Google Shopping / Custom Product',
  'Google Shopping / Custom Label 0',
  'Google Shopping / Custom Label 1',
  'Google Shopping / Custom Label 2',
  'Google Shopping / Custom Label 3',
  'Google Shopping / Custom Label 4',
]

// Map our internal field keys to Shopify CSV header names
export const FIELD_TO_SHOPIFY_HEADER = {
  handle: 'Handle',
  title: 'Title',
  description: 'Body (HTML)',
  vendor: 'Vendor',
  productCategory: 'Product Category',
  type: 'Type',
  tags: 'Tags',
  published: 'Published',
  status: 'Status',
  sku: 'SKU',
  barcode: 'Barcode',
  option1Name: 'Option1 Name',
  option1Value: 'Option1 Value',
  option2Name: 'Option2 Name',
  option2Value: 'Option2 Value',
  option3Name: 'Option3 Name',
  option3Value: 'Option3 Value',
  price: 'Variant Price',
  compareAtPrice: 'Compare at Price',
  costPerItem: 'Variant Cost',
  chargeTax: 'Variant Taxable',
  taxCode: 'Tax Code',
  inventoryTracker: 'Variant Inventory Tracker',
  inventoryQuantity: 'Variant Inventory Qty',
  continueSellingWhenOutOfStock: 'Variant Inventory Policy',
  weightValue: 'Variant Weight',
  weightUnit: 'Variant Weight Unit',
  requiresShipping: 'Variant Requires Shipping',
  fulfillmentService: 'Variant Fulfillment Service',
  imageUrl: 'Image Src',
  imagePosition: 'Image Position',
  imageAltText: 'Image Alt Text',
  variantImageUrl: 'Variant Image',
  giftCard: 'Gift Card',
  seoTitle: 'SEO Title',
  seoDescription: 'SEO Description',
  googleProductCategory: 'Google Shopping / Google Product Category',
  googleGender: 'Google Shopping / Gender',
  googleAgeGroup: 'Google Shopping / Age Group',
  googleCondition: 'Google Shopping / Condition',
}

// Shopify fields we support mapping from user columns (productCategory has high priority via keywords)
export const SHOPIFY_FIELDS = [
  { key: 'title', label: 'Title', keywords: ['title', 'name', 'product name', 'item name', 'product title'] },
  { key: 'sku', label: 'SKU', keywords: ['sku', 'item code', 'product code', 'code'] },
  { key: 'productCategory', label: 'Product category', keywords: ['product category', 'category', 'product_category', 'catalog_category_attribute.category', 'google category', 'fb category'] },
  { key: 'price', label: 'Price', keywords: ['price', 'selling price', 'retail price', 'catalog_product_tier_price', 'catalog_product_tier_price.price', 'catalog_product_tier_price.catalog_product_tier_price.price'] },
  { key: 'inventoryQuantity', label: 'Inventory quantity', keywords: ['inventory', 'quantity', 'qty', 'stock', 'la_qty'] },
  { key: 'imageUrl', label: 'Product image URL', keywords: ['image', 'image url', 'photo', 'picture', 'img', 'images', 'media_gallery', 'media gallery'] },
  { key: 'description', label: 'Description', keywords: ['description', 'desc', 'details', 'body'] },
  { key: 'vendor', label: 'Vendor', keywords: ['vendor', 'brand', 'supplier'] },
  { key: 'tags', label: 'Tags', keywords: ['tags', 'tag', 'keywords'] },
  { key: 'barcode', label: 'Barcode', keywords: ['barcode', 'upc', 'ean'] },
  { key: 'compareAtPrice', label: 'Compare-at price', keywords: ['compare', 'mrp', 'was price', 'original price', 'compare at'] },
  { key: 'weightValue', label: 'Weight', keywords: ['weight', 'grams', 'kg'] },
  { key: 'type', label: 'Type', keywords: ['type', 'product type', 'package_type', 'package type'] },
  { key: 'status', label: 'Status', keywords: ['status', 'published', 'active', 'catalog_product_attribute.status'] },
  { key: 'seoTitle', label: 'SEO title', keywords: ['seo title', 'meta title'] },
  { key: 'seoDescription', label: 'SEO description', keywords: ['seo description', 'meta description'] },
  { key: 'option1Name', label: 'Option1 name', keywords: ['option1 name', 'option 1 name'] },
  { key: 'option1Value', label: 'Option1 value', keywords: ['color', 'material', 'variant', 'option1 value', 'option 1 value'] },
  { key: 'option2Name', label: 'Option2 name', keywords: ['option2 name', 'option 2 name'] },
  { key: 'option2Value', label: 'Option2 value', keywords: ['size', 'dimension', 'option2 value', 'option 2 value'] },
  { key: 'option3Name', label: 'Option3 name', keywords: ['option3 name'] },
  { key: 'option3Value', label: 'Option3 value', keywords: ['option3 value'] },
  { key: 'published', label: 'Published on online store', keywords: ['published', 'published on online store'] },
  { key: 'costPerItem', label: 'Cost per item', keywords: ['cost', 'cost per item'] },
  { key: 'imageAltText', label: 'Image alt text', keywords: ['image alt', 'alt text'] },
  { key: 'variantImageUrl', label: 'Variant image URL', keywords: ['variant image', 'variant image url'] },
  { key: 'googleProductCategory', label: 'Google product category', keywords: ['google product category', 'google category'] },
  { key: 'googleGender', label: 'Google Shopping Gender', keywords: ['gender', 'google gender'] },
  { key: 'googleAgeGroup', label: 'Google Shopping Age group', keywords: ['age group', 'google age'] },
  { key: 'googleCondition', label: 'Google Shopping Condition', keywords: ['condition', 'google condition'] },
  { key: 'shipType', label: 'Ship type (for price formula)', keywords: ['ship type', 'ship_type', 'shipping type', 'shipping', 'freight type', 'catalog_product_attribute.ship_type'] },
]

function normalize(s) {
  return (s || '').toLowerCase().replace(/[\s_-]+/g, ' ').trim()
}

function normalizeForColumn(s) {
  return (s || '').toLowerCase().replace(/[\s_.-]+/g, '').trim()
}

// Sample headers that should match the same columns as Title (product name)
const TITLE_ALIASES = ['url handle', 'handle', 'title', 'name', 'product name']

// Sample headers that should match catalog_category_attribute.category (Type, Tags, Product category)
const CATEGORY_ALIASES = ['product category', 'type', 'tags', 'category', 'product_category']

/**
 * Match a sample header to a data column. Returns true if they likely match.
 */
export function headerMatchesColumn(sampleHeader, columnName) {
  const a = normalize(sampleHeader)
  const b = normalize(columnName)
  const bCompact = normalizeForColumn(columnName)
  if (!a || !b) return false
  if (a === b) return true

  // Title/URL handle/Handle: match catalog_product_attribute.name only (check before generic)
  if (TITLE_ALIASES.includes(a)) {
    if (b.includes('name') || bCompact.includes('name')) return true
    return false
  }
  // Type/Tags/Product category: match catalog_category_attribute.category only (not package_type)
  if (CATEGORY_ALIASES.includes(a)) {
    if (b.includes('category') || bCompact.includes('category')) return true
    return false
  }
  // Price: match .price but NOT .price group (reject columns that are price group)
  if (a === 'price' || a === 'variant price') {
    if (bCompact.includes('pricegroup') || bCompact.endsWith('group')) return false
  }

  if (a.includes(b) || b.includes(a)) return true
  const fieldKey = detectShopifyField(columnName)
  if (!fieldKey) return false
  const field = SHOPIFY_FIELDS.find(f => f.key === fieldKey)
  const officialHeader = FIELD_TO_SHOPIFY_HEADER[fieldKey]
  return (
    (field && normalize(field.label) === a) ||
    (field && field.key === a) ||
    (officialHeader && normalize(officialHeader) === a)
  )
}

/**
 * Auto-detect mapping when using sample sheet: map each sample header to best matching data column.
 */
export function detectMappingForSampleHeaders(sampleHeaders, options) {
  const mapping = {}
  sampleHeaders.forEach(header => {
    for (const opt of options) {
      if (headerMatchesColumn(header, opt.columnName)) {
        mapping[header] = opt.id
        break
      }
    }
  })
  return mapping
}

/**
 * For a given column name and sheet name, find the best matching Shopify field key
 */
export function detectShopifyField(columnName, _sheetName) {
  const n = normalize(columnName)
  if (!n) return null
  let best = null
  let bestScore = 0
  for (const field of SHOPIFY_FIELDS) {
    for (const kw of field.keywords) {
      if (n === normalize(kw) || n.includes(normalize(kw))) {
        const score = n.length - normalize(kw).length
        if (score > bestScore) {
          bestScore = score
          best = field.key
        }
      }
    }
  }
  return best
}
