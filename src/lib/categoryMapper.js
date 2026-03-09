/**
 * Keyword → Shopify taxonomy path mapping (store navigation).
 * Sorted by keyword length descending so longest match wins.
 */
const KEYWORD_MAP = [
  // LIVING ROOM
  ['modular seating', 'Furniture > Sofas > Sectional Sofas'],
  ['sleeper sofa', 'Furniture > Sofas > Sectional Sofas'],
  ['sectional sofa', 'Furniture > Sofas > Sectional Sofas'],
  ['reclining sectional', 'Furniture > Sofas > Sectional Sofas'],
  ['sectional', 'Furniture > Sofas > Sectional Sofas'],
  ['loveseat sofa', 'Furniture > Sofas > Loveseat Sofas'],
  ['reclining loveseat', 'Furniture > Sofas > Loveseat Sofas'],
  ['loveseat', 'Furniture > Sofas > Loveseat Sofas'],
  ['reclining sofa', 'Furniture > Sofas'],
  ['sofa', 'Furniture > Sofas'],
  ['recliner', 'Furniture > Chairs > Armchairs, Recliners & Sleeper Chairs'],
  ['accent chair', 'Furniture > Chairs > Armchairs, Recliners & Sleeper Chairs'],
  ['lounge chair', 'Furniture > Chairs > Armchairs, Recliners & Sleeper Chairs'],
  ['ottoman', 'Furniture > Ottomans'],
  ['pouf', 'Furniture > Ottomans'],
  ['coffee table', 'Furniture > Tables > Accent Tables'],
  ['end table', 'Furniture > Tables > Accent Tables'],
  ['side table', 'Furniture > Tables > Accent Tables'],
  ['console table', 'Furniture > Tables > Accent Tables'],
  ['sofa table', 'Furniture > Tables > Accent Tables'],
  ['accent table', 'Furniture > Tables > Accent Tables'],
  ['tv stand', 'Furniture > Entertainment Centers & TV Stands'],
  ['entertainment center', 'Furniture > Entertainment Centers & TV Stands'],
  ['media cabinet', 'Furniture > Entertainment Centers & TV Stands'],
  ['accent cabinet', 'Furniture > Cabinets & Storage > Storage Cabinets & Lockers'],
  ['bar cart', 'Furniture > Carts & Islands > Carts'],
  ['living room set', 'Furniture > Furniture Sets > Living Room Furniture Sets'],
  ['sofa set', 'Furniture > Furniture Sets > Living Room Furniture Sets'],
  ['coffee table set', 'Furniture > Furniture Sets > Living Room Furniture Sets'],
  // BEDROOM
  ['makeup vanity', 'Furniture > Cabinets & Storage > Vanities'],
  ['vanity bench', 'Furniture > Benches > Vanity Benches'],
  ['nightstand', 'Furniture > Tables > Nightstands'],
  ['mirrored dresser', 'Furniture > Cabinets & Storage > Dressers'],
  ['chest of drawer', 'Furniture > Cabinets & Storage > Dressers'],
  ['dresser', 'Furniture > Cabinets & Storage > Dressers'],
  ['headboard', 'Furniture > Beds & Accessories > Headboards'],
  ['footboard', 'Furniture > Beds & Accessories > Footboards'],
  ['bedroom set', 'Furniture > Furniture Sets > Bedroom Furniture Sets'],
  ['bed frame', 'Furniture > Beds & Accessories > Beds & Bed Frames'],
  ['bunk bed', 'Furniture > Beds & Accessories > Beds & Bed Frames'],
  ['loft bed', 'Furniture > Beds & Accessories > Beds & Bed Frames'],
  ['bed', 'Furniture > Beds & Accessories > Beds & Bed Frames'],
  ['free standing closet', 'Furniture > Cabinets & Storage > Armoires & Wardrobes'],
  ['wardrobe', 'Furniture > Cabinets & Storage > Armoires & Wardrobes'],
  ['armoire', 'Furniture > Cabinets & Storage > Armoires & Wardrobes'],
  ['shoe rack', 'Furniture > Cabinets & Storage > Storage Cabinets & Lockers'],
  ['jewelry organizer', 'Furniture > Cabinets & Storage > Storage Cabinets & Lockers'],
  // BENCHES
  ['dining bench', 'Furniture > Benches > Kitchen & Dining Benches'],
  ['entryway bench', 'Furniture > Benches > Storage & Entryway Benches'],
  ['storage bench', 'Furniture > Benches > Storage & Entryway Benches'],
  ['bench', 'Furniture > Benches > Storage & Entryway Benches'],
  // DINING
  ['kitchen & dining furniture set', 'Furniture > Furniture Sets > Kitchen & Dining Furniture Sets'],
  ['dining room set', 'Furniture > Furniture Sets > Kitchen & Dining Furniture Sets'],
  ['dining set', 'Furniture > Furniture Sets > Kitchen & Dining Furniture Sets'],
  ['extendable dining table', 'Furniture > Tables > Kitchen & Dining Room Tables'],
  ['dining room table', 'Furniture > Tables > Kitchen & Dining Room Tables'],
  ['dining table', 'Furniture > Tables > Kitchen & Dining Room Tables'],
  ['kitchen table', 'Furniture > Tables > Kitchen & Dining Room Tables'],
  ['dining chair', 'Furniture > Chairs > Kitchen & Dining Room Chairs'],
  ['kitchen chair', 'Furniture > Chairs > Kitchen & Dining Room Chairs'],
  ['bar stool', 'Furniture > Chairs > Table & Bar Stools'],
  ['counter stool', 'Furniture > Chairs > Table & Bar Stools'],
  ['dining storage', 'Furniture > Cabinets & Storage > Sideboards'],
  ['sideboard', 'Furniture > Cabinets & Storage > Sideboards'],
  ['buffet', 'Furniture > Cabinets & Storage > Buffets'],
  ['china cabinet', 'Furniture > Cabinets & Storage > China Cabinets & Hutches'],
  ['hutch', 'Furniture > Cabinets & Storage > China Cabinets & Hutches'],
  ['bar furniture', 'Furniture > Cabinets & Storage > Wine & Liquor Cabinets'],
  ['wine rack', 'Furniture > Cabinets & Storage > Wine Racks'],
  ['wine cabinet', 'Furniture > Cabinets & Storage > Wine & Liquor Cabinets'],
  // MATTRESSES
  ['mattress foundation', 'Furniture > Beds & Accessories > Mattress Foundations'],
  ['box spring', 'Furniture > Beds & Accessories > Mattress Foundations'],
  ['adjustable base', 'Furniture > Beds & Accessories > Mattress Foundations'],
  ['adjustable bed base', 'Furniture > Beds & Accessories > Mattress Foundations'],
  ['mattress set', 'Furniture > Beds & Accessories > Mattresses'],
  ['memory foam mattress', 'Furniture > Beds & Accessories > Mattresses'],
  ['hybrid mattress', 'Furniture > Beds & Accessories > Mattresses'],
  ['innerspring mattress', 'Furniture > Beds & Accessories > Mattresses'],
  ['mattress in a box', 'Furniture > Beds & Accessories > Mattresses'],
  ['air mattress', 'Furniture > Beds & Accessories > Mattresses'],
  ['mattress', 'Furniture > Beds & Accessories > Mattresses'],
  // BEDDING
  ['mattress protector', 'Home & Garden > Linens & Bedding > Bedding > Mattress Pads'],
  ['mattress topper', 'Home & Garden > Linens & Bedding > Bedding > Mattress Pads'],
  ['mattress pad', 'Home & Garden > Linens & Bedding > Bedding > Mattress Pads'],
  ['comforter set', 'Home & Garden > Linens & Bedding > Bedding > Comforters & Duvet Inserts'],
  ['comforter', 'Home & Garden > Linens & Bedding > Bedding > Comforters & Duvet Inserts'],
  ['duvet cover', 'Home & Garden > Linens & Bedding > Bedding > Duvet Covers'],
  ['duvet', 'Home & Garden > Linens & Bedding > Bedding > Duvet Covers'],
  ['quilt', 'Home & Garden > Linens & Bedding > Bedding > Quilts & Coverlets'],
  ['coverlet', 'Home & Garden > Linens & Bedding > Bedding > Quilts & Coverlets'],
  ['sheet set', 'Home & Garden > Linens & Bedding > Bedding > Bed Sheets'],
  ['bed sheet', 'Home & Garden > Linens & Bedding > Bedding > Bed Sheets'],
  ['euro sham', 'Home & Garden > Linens & Bedding > Bedding > Pillow Shams'],
  ['pillow sham', 'Home & Garden > Linens & Bedding > Bedding > Pillow Shams'],
  ['decorative pillow', 'Home & Garden > Linens & Bedding > Bedding > Throw Pillows'],
  ['throw pillow', 'Home & Garden > Linens & Bedding > Bedding > Throw Pillows'],
  ['bed pillow', 'Home & Garden > Linens & Bedding > Bedding > Bed Pillows'],
  ['throw blanket', 'Home & Garden > Linens & Bedding > Bedding > Throws'],
  ['blanket', 'Home & Garden > Linens & Bedding > Bedding > Throws'],
  ['curtain', 'Home & Garden > Linens & Bedding'],
  ['drape', 'Home & Garden > Linens & Bedding'],
  ['window scarf', 'Home & Garden > Linens & Bedding'],
  ['valance', 'Home & Garden > Linens & Bedding'],
  // OUTDOOR
  ['outdoor furniture set', 'Furniture > Outdoor Furniture > Outdoor Furniture Sets'],
  ['outdoor conversation set', 'Furniture > Outdoor Furniture > Outdoor Furniture Sets'],
  ['outdoor dining set', 'Furniture > Outdoor Furniture > Outdoor Furniture Sets'],
  ['outdoor chair set', 'Furniture > Outdoor Furniture > Outdoor Furniture Sets'],
  ['outdoor sectional', 'Furniture > Outdoor Furniture > Outdoor Seating'],
  ['outdoor sofa', 'Furniture > Outdoor Furniture > Outdoor Seating'],
  ['outdoor loveseat', 'Furniture > Outdoor Furniture > Outdoor Seating'],
  ['outdoor chair', 'Furniture > Outdoor Furniture > Outdoor Seating'],
  ['outdoor chaise', 'Furniture > Outdoor Furniture > Outdoor Seating'],
  ['outdoor bench', 'Furniture > Outdoor Furniture > Outdoor Seating'],
  ['outdoor dining table', 'Furniture > Outdoor Furniture > Outdoor Tables'],
  ['outdoor coffee table', 'Furniture > Outdoor Furniture > Outdoor Tables'],
  ['outdoor side table', 'Furniture > Outdoor Furniture > Outdoor Tables'],
  ['outdoor table', 'Furniture > Outdoor Furniture > Outdoor Tables'],
  ['outdoor ottoman', 'Furniture > Outdoor Furniture > Outdoor Ottomans'],
  ['outdoor storage', 'Furniture > Outdoor Furniture > Outdoor Storage Boxes'],
  ['outdoor bar stool', 'Furniture > Chairs > Table & Bar Stools'],
  ['outdoor bar table', 'Furniture > Outdoor Furniture > Outdoor Tables'],
  ['outdoor rug', 'Home & Garden > Linens & Bedding > Rugs'],
  ['outdoor lighting', 'Home & Garden > Lighting'],
  ['outdoor pillow', 'Home & Garden > Linens & Bedding > Bedding > Throw Pillows'],
  ['patio umbrella', 'Home & Garden > Lawn & Garden'],
  ['fire pit set', 'Home & Garden > Lawn & Garden'],
  ['fire pit', 'Home & Garden > Lawn & Garden'],
  ['patio heater', 'Home & Garden > Lawn & Garden'],
  // HOME OFFICE
  ['standing desk', 'Furniture > Office Furniture > Desks'],
  ['corner desk', 'Furniture > Office Furniture > Desks'],
  ['gaming desk', 'Furniture > Office Furniture > Desks'],
  ['writing desk', 'Furniture > Office Furniture > Desks'],
  ['desk', 'Furniture > Office Furniture > Desks'],
  ['bookcase', 'Furniture > Shelving > Bookcases & Standing Shelves'],
  ['bookshelf', 'Furniture > Shelving > Bookcases & Standing Shelves'],
  ['file cabinet', 'Furniture > Cabinets & Storage > File Cabinets'],
  ['filing cabinet', 'Furniture > Cabinets & Storage > File Cabinets'],
  ['office chair', 'Furniture > Office Furniture > Office Chairs'],
  ['gaming chair', 'Furniture > Chairs > Gaming Chairs'],
  ['home office set', 'Furniture > Office Furniture > Office Furniture Sets'],
  ['office furniture set', 'Furniture > Office Furniture > Office Furniture Sets'],
  ['home office storage', 'Furniture > Cabinets & Storage > Storage Cabinets & Lockers'],
  ['workspace table', 'Furniture > Office Furniture > Workspace Tables'],
  ['workstation', 'Furniture > Office Furniture > Workstations & Cubicles'],
  // KIDS & NURSERY
  ['nursery furniture set', 'Furniture > Baby & Toddler Furniture > Baby & Toddler Furniture Sets'],
  ['crib mattress', 'Furniture > Beds & Accessories > Mattresses'],
  ['toddler mattress', 'Furniture > Beds & Accessories > Mattresses'],
  ['toddler bed', 'Furniture > Baby & Toddler Furniture > Cribs & Toddler Beds'],
  ['crib', 'Furniture > Baby & Toddler Furniture > Cribs & Toddler Beds'],
  ['bassinet', 'Furniture > Baby & Toddler Furniture > Bassinets & Cradles'],
  ['cradle', 'Furniture > Baby & Toddler Furniture > Bassinets & Cradles'],
  ['changing table', 'Furniture > Baby & Toddler Furniture > Changing Tables'],
  ['high chair', 'Furniture > Baby & Toddler Furniture > High Chairs & Booster Seats'],
  ['booster seat', 'Furniture > Baby & Toddler Furniture > High Chairs & Booster Seats'],
  ['nursery rocking chair', 'Furniture > Chairs > Rocking Chairs'],
  ['play sofa', 'Furniture > Baby & Toddler Furniture > Play Sofas'],
  ['kids bedroom set', 'Furniture > Furniture Sets > Bedroom Furniture Sets'],
  ['kids bed', 'Furniture > Beds & Accessories > Beds & Bed Frames'],
  ['kids headboard', 'Furniture > Beds & Accessories > Headboards'],
  ['kids nightstand', 'Furniture > Tables > Nightstands'],
  ['kids mirrored dresser', 'Furniture > Cabinets & Storage > Dressers'],
  ['kids dresser', 'Furniture > Cabinets & Storage > Dressers'],
  ['kids desk', 'Furniture > Office Furniture > Desks'],
  ['kids storage', 'Furniture > Cabinets & Storage > Storage Cabinets & Lockers'],
  ['kids seating', 'Furniture > Chairs'],
  ['teen bed', 'Furniture > Beds & Accessories > Beds & Bed Frames'],
  ['teen dresser', 'Furniture > Cabinets & Storage > Dressers'],
  ['teen nightstand', 'Furniture > Tables > Nightstands'],
  ['teen desk', 'Furniture > Office Furniture > Desks'],
  // HOME DECOR
  ['decorative bowl', 'Home & Garden > Decor'],
  ['candle holder', 'Home & Garden > Decor'],
  ['sculpture', 'Home & Garden > Decor'],
  ['decorative object', 'Home & Garden > Decor'],
  ['vase', 'Home & Garden > Decor'],
  ['artificial plant', 'Home & Garden > Decor'],
  ['clock', 'Home & Garden > Decor'],
  ['wall mirror', 'Home & Garden > Decor'],
  ['floor mirror', 'Home & Garden > Decor'],
  ['framed art', 'Home & Garden > Decor'],
  ['canvas art', 'Home & Garden > Decor'],
  ['wall art set', 'Home & Garden > Decor'],
  ['wall art', 'Home & Garden > Decor'],
  ['wall shelf', 'Furniture > Shelving > Wall Shelves & Ledges'],
  ['accent wall decor', 'Home & Garden > Decor'],
  ['hall tree', 'Furniture > Cabinets & Storage > Storage Cabinets & Lockers'],
  ['entryway table', 'Furniture > Tables > Accent Tables'],
  ['entryway storage', 'Furniture > Cabinets & Storage > Storage Cabinets & Lockers'],
  ['pet bed', 'Animals & Pet Supplies > Pet Supplies > Pet Beds'],
  // LIGHTING
  ['lamp set', 'Home & Garden > Lighting'],
  ['table lamp', 'Home & Garden > Lighting'],
  ['desk lamp', 'Home & Garden > Lighting'],
  ['floor lamp', 'Home & Garden > Lighting'],
  ['chandelier', 'Home & Garden > Lighting'],
  ['pendant light', 'Home & Garden > Lighting'],
  ['pendant lighting', 'Home & Garden > Lighting'],
  ['wall lighting', 'Home & Garden > Lighting'],
  ['wall light', 'Home & Garden > Lighting'],
  ['ceiling fan', 'Home & Garden > Lighting'],
  // RUGS
  ['runner rug', 'Home & Garden > Linens & Bedding > Rugs'],
  ['accent rug', 'Home & Garden > Linens & Bedding > Rugs'],
  ['washable rug', 'Home & Garden > Linens & Bedding > Rugs'],
  ['area rug', 'Home & Garden > Linens & Bedding > Rugs'],
  ['rug pad', 'Home & Garden > Linens & Bedding > Rugs'],
  ['rug', 'Home & Garden > Linens & Bedding > Rugs'],
]

// Sort by keyword length descending so longest match wins
const SORTED_MAP = [...KEYWORD_MAP].sort((a, b) => b[0].length - a[0].length)

/**
 * Extract searchable text from a product row (all relevant fields).
 * Uses common Shopify field names and sample-sheet header variants.
 */
function getSearchableText(row) {
  if (!row || typeof row !== 'object') return ''
  const fields = [
    row.title,
    row['Title'],
    row.type,
    row['Type'],
    row.productCategory,
    row['Product Category'],
    row.category,
    row['Category'],
    row.description,
    row['Description'],
    row['Body (HTML)'],
    row.tags,
    row['Tags'],
    row.vendor,
    row['Vendor'],
    row['Product Type'],
    row['Attribute Category'],
    row.attributeCategory,
  ]
  return fields
    .filter(v => v != null && String(v).trim() !== '')
    .map(v => String(v).trim())
    .join(' ')
}

/**
 * Check if a value looks like our taxonomy format (e.g. "Furniture > Sofas").
 * Values like "Sofa,All Living Room" are not taxonomy and should trigger auto-detect.
 */
export function isTaxonomyFormat(value) {
  return (value || '').trim().includes(' > ')
}

/**
 * Auto-detect Product Category from product details.
 * Uses title, type, category, description, tags, vendor, and other attributes.
 * Store navigation taxonomy; longest keyword match wins.
 *
 * @param {Object} row - Product row (title, type, description, productCategory, category, tags, vendor, etc.)
 * @returns {string} Matched taxonomy path or ""
 */
export function detectCategory(row) {
  const combined = getSearchableText(row).toLowerCase().trim()
  if (!combined) return ''

  for (const [keyword, taxonomy] of SORTED_MAP) {
    if (combined.includes(keyword)) return taxonomy
  }
  return ''
}
