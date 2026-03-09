/**
 * Build a list of all column options from all sheets: { id, columnName, sheetName, sheetIndex }
 * id is unique per column per sheet so we can have same column name from different files
 */
const COL_ID_SEP = '\u0001'

export function getAllColumnOptions(sheets) {
  const options = []
  sheets.forEach((sheet, sheetIndex) => {
    (sheet.columns || []).forEach(col => {
      options.push({
        id: `${sheetIndex}${COL_ID_SEP}${col}`,
        columnName: col,
        sheetName: sheet.name,
        sheetIndex
      })
    })
  })
  return options
}

function parseColumnId(columnId) {
  const sep = columnId.indexOf(COL_ID_SEP)
  if (sep === -1) return { sheetIndex: 0, columnName: columnId }
  return {
    sheetIndex: parseInt(columnId.slice(0, sep), 10),
    columnName: columnId.slice(sep + COL_ID_SEP.length)
  }
}

/**
 * Get value for a row from a sheet by column id (sheetIndex-columnName)
 */
function getValueForColumnId(rowBySheet, columnId) {
  const { sheetIndex, columnName } = parseColumnId(columnId)
  const sheet = rowBySheet[sheetIndex]
  if (!sheet || !columnName) return ''
  const val = sheet[columnName]
  return val != null ? String(val).trim() : ''
}

/**
 * Merge sheets by SKU. Primary key is SKU (from mapped column).
 * rowBySheet: array of row objects, one per sheet (same SKU)
 * mapping: { shopifyFieldKey: columnId }
 */
export function buildMergedRow(rowBySheet, mapping) {
  const row = {}
  Object.entries(mapping).forEach(([shopifyKey, columnId]) => {
    if (!columnId) return
    const value = getValueForColumnId(rowBySheet, columnId)
    if (value !== '') row[shopifyKey] = value
  })
  return row
}

function getSkuColumnId(mapping) {
  if (mapping.sku) return mapping.sku
  const skuKey = Object.keys(mapping).find(k =>
    (k || '').toLowerCase().replace(/[\s_-]+/g, '') === 'sku'
  )
  return skuKey ? mapping[skuKey] : null
}

/**
 * Get primary SKU column name from mapping (columnId format: "sheetIndex-columnName")
 */
function getPrimarySkuColumnName(mapping) {
  const skuColumnId = getSkuColumnId(mapping)
  if (!skuColumnId) return null
  const { columnName } = parseColumnId(skuColumnId)
  return columnName || null
}

/**
 * Get SKU column name for a sheet: use primary column name if that column exists in this sheet
 */
function getSkuColumnForSheet(sheet, sheetIndex, mapping) {
  const primaryName = getPrimarySkuColumnName(mapping)
  if (!primaryName) return null
  const cols = sheet.columns || []
  if (cols.includes(primaryName)) return primaryName
  const skuColId = getSkuColumnId(mapping)
  const { sheetIndex: mappedSheetIndex, columnName } = parseColumnId(skuColId || '')
  if (mappedSheetIndex === sheetIndex && columnName) return columnName
  return null
}

/**
 * Build merged rows from sheets using SKU as key.
 * sheets: array of { name, columns, rows }
 * mapping: { shopifyFieldKey: columnId } — columnId is "sheetIndex-columnName"
 * If no SKU mapped, align by row index.
 */
export function mergeSheetsBySku(sheets, mapping) {
  const skuColumnId = getSkuColumnId(mapping)
  const bySku = new Map()

  if (skuColumnId && sheets.length > 0) {
    const primarySkuCol = getPrimarySkuColumnName(mapping)
    sheets.forEach((sheet, sheetIndex) => {
      const skuCol = getSkuColumnForSheet(sheet, sheetIndex, mapping) || (sheet.columns && sheet.columns[0])
      if (!skuCol) return
      ;(sheet.rows || []).forEach(row => {
        const sku = (row[skuCol] != null ? String(row[skuCol]) : '').trim()
        if (!sku) return
        if (!bySku.has(sku)) {
          bySku.set(sku, sheets.map(() => ({})))
        }
        const arr = bySku.get(sku)
        arr[sheetIndex] = row
      })
    })
  }

  if (bySku.size === 0) {
    // No SKU mapping or no matches: align by row index (row i from each sheet merged)
    const maxRows = Math.max(...sheets.map(s => (s.rows && s.rows.length) || 0), 0)
    for (let i = 0; i < maxRows; i++) {
      const rowBySheet = sheets.map(s => (s.rows && s.rows[i]) || {})
      bySku.set(`row-${i}`, rowBySheet)
    }
  }

  const merged = []
  bySku.forEach((rowBySheet) => {
    merged.push(buildMergedRow(rowBySheet, mapping))
  })
  return merged
}

/**
 * Get first non-empty value for a column id across sheets for sample display
 */
export function getSampleValue(sheets, columnId) {
  const { sheetIndex, columnName } = parseColumnId(columnId)
  const sheet = sheets[sheetIndex]
  if (!sheet || !sheet.rows || !sheet.rows.length) return ''
  const val = sheet.rows[0][columnName]
  return val != null ? String(val).trim() : ''
}
