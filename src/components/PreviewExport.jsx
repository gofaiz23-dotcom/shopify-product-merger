import { useState, useMemo, useCallback, useEffect } from 'react'
import { mergeSheetsBySku } from '../lib/merge'
import { exportShopifyCSV, exportToSampleFormat, normalizeStatus, getShipTypeForRow, getBasePriceMappingKey } from '../lib/exportShopify'
import { detectCategory, isTaxonomyFormat } from '../lib/categoryMapper'
import { SHOPIFY_CSV_HEADERS, FIELD_TO_SHOPIFY_HEADER } from '../lib/shopifyColumns'
import { ColumnMapping } from './ColumnMapping'
import { PricingConfig } from './PricingConfig'
import { calculateVariantPrice, getPriceBreakdown } from '../lib/priceCalculator'
import styles from './PreviewExport.module.css'

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
)

const HEADER_TO_FIELD = Object.fromEntries(
  Object.entries(FIELD_TO_SHOPIFY_HEADER).map(([k, v]) => [v, k])
)

const PREVIEW_ROWS = 50

function isProductCategoryColumn(key) {
  const n = (key || '').toLowerCase().replace(/[\s_-]+/g, ' ')
  return n === 'productcategory' || n === 'product category' || n === 'category'
}

function isStatusColumn(key) {
  const n = (key || '').toLowerCase().replace(/[\s_-]+/g, ' ')
  return n === 'status'
}

const DEFAULT_COL_WIDTH = 120
const MIN_COL_WIDTH = 60

function isVariantPriceColumn(key, basePriceKey) {
  if (key === basePriceKey) return true
  const n = (key || '').toLowerCase().replace(/[\s_-]+/g, ' ')
  return n === 'variant price' || n === 'variantprice' || n === 'price'
}

function isSkuColumn(header) {
  const n = (header || '').toLowerCase().replace(/[\s_-]+/g, '')
  return n === 'sku' || n.endsWith('.sku')
}

export function PreviewExport({
  sheets,
  sampleSheet,
  mapping,
  onMappingChange,
  autoDetectCategories = true,
  onAutoDetectCategoriesChange,
  pricingConfig = {},
  onPricingConfigChange,
}) {
  const [exporting, setExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [showRemapModal, setShowRemapModal] = useState(false)
  const [showPriceCalcModal, setShowPriceCalcModal] = useState(false)
  const [priceCalcRowIndex, setPriceCalcRowIndex] = useState(null)
  const [colWidths, setColWidths] = useState({})
  const [resizing, setResizing] = useState({ colIndex: null, startX: 0, startWidth: 0 })
  const [skuPrefix, setSkuPrefix] = useState('')
  const [skuPostfix, setSkuPostfix] = useState('')
  const [lastAppliedSkuPrefix, setLastAppliedSkuPrefix] = useState('')
  const [lastAppliedSkuPostfix, setLastAppliedSkuPostfix] = useState('')

  const merged = useMemo(() => {
    if (!sheets.length) return []
    return mergeSheetsBySku(sheets, mapping)
  }, [sheets, mapping])

  const [editedRows, setEditedRows] = useState([])

  useEffect(() => {
    setEditedRows(merged.map(row => ({ ...row })))
    setLastAppliedSkuPrefix('')
    setLastAppliedSkuPostfix('')
  }, [merged])

  const outputHeaders = useMemo(() => {
    if (sampleSheet?.headers?.length) {
      return sampleSheet.headers
    }
    return SHOPIFY_CSV_HEADERS
  }, [sampleSheet])

  const getColWidth = useCallback((index) => {
    return colWidths[index] ?? DEFAULT_COL_WIDTH
  }, [colWidths])

  const handleResizeStart = useCallback((colIndex, e) => {
    e.preventDefault()
    setResizing({
      colIndex,
      startX: e.clientX,
      startWidth: colWidths[colIndex] ?? DEFAULT_COL_WIDTH,
    })
  }, [colWidths])

  useEffect(() => {
    if (resizing.colIndex == null) return
    const onMove = (e) => {
      const delta = e.clientX - resizing.startX
      const newWidth = Math.max(MIN_COL_WIDTH, resizing.startWidth + delta)
      setColWidths(prev => ({ ...prev, [resizing.colIndex]: newWidth }))
    }
    const onUp = () => setResizing({ colIndex: null, startX: 0, startWidth: 0 })
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizing])

  const downloadFileName = sampleSheet?.fileName
    ? (sampleSheet.fileName.replace(/\.(csv|xlsx|xls)$/i, '') + '_merged.csv')
    : 'shopify_products.csv'
  const previewRows = editedRows.slice(0, PREVIEW_ROWS)
  const basePriceKey = useMemo(() => getBasePriceMappingKey(mapping), [mapping])
  const hasPriceFormula = basePriceKey != null
  const skuHeader = useMemo(() => outputHeaders.find(h => isSkuColumn(h)) ?? null, [outputHeaders])

  const applySkuPrefixPostfix = useCallback(() => {
    if (!skuHeader || (!skuPrefix && !skuPostfix)) return
    const key = sampleSheet?.headers?.length ? skuHeader : (HEADER_TO_FIELD[skuHeader] ?? skuHeader)
    setEditedRows(prev => prev.map(row => {
      let base = (row[key] ?? '').toString().trim()
      if (lastAppliedSkuPrefix && base.startsWith(lastAppliedSkuPrefix)) base = base.slice(lastAppliedSkuPrefix.length)
      if (lastAppliedSkuPostfix && base.endsWith(lastAppliedSkuPostfix)) base = base.slice(0, -lastAppliedSkuPostfix.length)
      const updated = (skuPrefix || '') + base + (skuPostfix || '')
      return { ...row, [key]: updated }
    }))
    setLastAppliedSkuPrefix(skuPrefix)
    setLastAppliedSkuPostfix(skuPostfix)
  }, [skuHeader, skuPrefix, skuPostfix, sampleSheet, lastAppliedSkuPrefix, lastAppliedSkuPostfix])

  const handleCellChange = useCallback((rowIndex, header, value) => {
    const key = sampleSheet?.headers?.length ? header : (HEADER_TO_FIELD[header] ?? header)
    setEditedRows(prev => {
      const next = prev.map((r, i) =>
        i === rowIndex ? { ...r, [key]: value } : r
      )
      return next
    })
  }, [sampleSheet])

  const handleExport = () => {
    setExporting(true)
    setExportDone(false)
    try {
      if (sampleSheet?.headers?.length) {
        exportToSampleFormat(editedRows, sampleSheet.headers, sampleSheet.fileName, autoDetectCategories, mapping, pricingConfig)
      } else {
        exportShopifyCSV(editedRows, mapping, autoDetectCategories, pricingConfig)
      }
      setExportDone(true)
    } finally {
      setExporting(false)
    }
  }

  const getCellKey = (header) => {
    if (sampleSheet?.headers?.length) return header
    return HEADER_TO_FIELD[header] ?? header
  }

  const getProductCategoryValue = (row, header) => {
    const key = getCellKey(header)
    const rawValue = (row[key] ?? '').trim()
    const hasValidTaxonomy = rawValue && isTaxonomyFormat(rawValue)
    if (hasValidTaxonomy) return rawValue
    if (autoDetectCategories) {
      const detected = detectCategory(row)
      return detected || ''
    }
    return rawValue || ''
  }

  const getProductCategorySource = (row, header) => {
    const key = getCellKey(header)
    const rawValue = (row[key] ?? '').trim()
    const hasValidTaxonomy = rawValue && isTaxonomyFormat(rawValue)
    if (hasValidTaxonomy) return 'manual'
    if (autoDetectCategories) return 'auto'
    return null
  }

  return (
    <div className={styles.wrap}>
      {hasPriceFormula && onPricingConfigChange && (
        <PricingConfig config={pricingConfig} onChange={onPricingConfigChange} />
      )}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{merged.length}</span>
          <span className={styles.statLabel}>Total products</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{outputHeaders.length}</span>
          <span className={styles.statLabel}>Columns</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{sheets.length}</span>
          <span className={styles.statLabel}>Sheets merged</span>
        </div>
      </div>

      {skuHeader && (
        <div className={styles.skuBulkWrap}>
          <span className={styles.skuBulkLabel}>SKU bulk edit:</span>
          <input
            type="text"
            className={styles.skuBulkInput}
            placeholder="Prefix"
            value={skuPrefix}
            onChange={e => setSkuPrefix(e.target.value)}
            aria-label="SKU prefix"
          />
          <input
            type="text"
            className={styles.skuBulkInput}
            placeholder="Postfix"
            value={skuPostfix}
            onChange={e => setSkuPostfix(e.target.value)}
            aria-label="SKU postfix"
          />
          <button
            type="button"
            className={styles.skuBulkBtn}
            onClick={applySkuPrefixPostfix}
            disabled={!skuPrefix && !skuPostfix}
          >
            Apply to all SKUs
          </button>
        </div>
      )}

      <div className={styles.previewWrap}>
        <h3 className={styles.previewTitle}>
          Preview (first {PREVIEW_ROWS} rows) — Edit values directly, then export
          <span className={styles.resizeHint}> · Drag column borders to resize</span>
          {onMappingChange && (
            <button
              type="button"
              className={styles.remapBtn}
              onClick={() => setShowRemapModal(true)}
              title="Remap columns"
              aria-label="Remap columns"
            >
              <EditIcon />
            </button>
          )}
        </h3>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <colgroup>
              {outputHeaders.map((_, i) => (
                <col key={i} style={{ width: getColWidth(i) }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {outputHeaders.map((key, i) => (
                  <th key={key} style={{ width: getColWidth(i) }}>
                    <span className={styles.thContent}>{key}</span>
                    <span
                      className={styles.resizeHandle}
                      onMouseDown={(e) => handleResizeStart(i, e)}
                      title="Drag to resize column"
                      aria-hidden
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {outputHeaders.map(header => {
                    const cellKey = getCellKey(header)
                    let displayValue = isProductCategoryColumn(header)
                      ? getProductCategoryValue(row, header)
                      : (row[cellKey] ?? '')
                    if (isStatusColumn(header)) {
                      displayValue = normalizeStatus(displayValue)
                    }
                    const isPriceCell = hasPriceFormula && isVariantPriceColumn(cellKey, basePriceKey)
                    let basePrice, shipType, calc
                    if (isPriceCell) {
                      basePrice = row[basePriceKey] ?? row.price
                      shipType = getShipTypeForRow(row, mapping)
                      calc = calculateVariantPrice(basePrice, shipType, pricingConfig)
                      if (calc != null) displayValue = String(calc)
                    }
                    return (
                      <td key={header}>
                        <div className={styles.cellInputWrap}>
                          <input
                            type="text"
                            className={styles.cellInput}
                            value={displayValue}
                            onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                            title="Edit value"
                            aria-label={`Edit ${header}`}
                          />
                          {isPriceCell && (
                            <button
                              type="button"
                              className={styles.priceInfoBtn}
                              onClick={(e) => { e.stopPropagation(); setPriceCalcRowIndex(rowIndex); setShowPriceCalcModal(true) }}
                              title="Show calculation for this row"
                              aria-label="Show price calculation"
                            >
                              <InfoIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPriceCalcModal && hasPriceFormula && (() => {
        const rowIdx = priceCalcRowIndex != null && previewRows[priceCalcRowIndex] ? priceCalcRowIndex : 0
        const targetRow = previewRows[rowIdx] || previewRows[0]
        const base = (targetRow ? (targetRow[basePriceKey] ?? targetRow.price) : null) ?? 100
        const shipType = getShipTypeForRow(targetRow || {}, mapping)
        const b = getPriceBreakdown(base, shipType, pricingConfig)
        if (!b) return null
        return (
          <div className={styles.modalOverlay} onClick={() => { setShowPriceCalcModal(false); setPriceCalcRowIndex(null) }}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Variant Price calculation</h3>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => { setShowPriceCalcModal(false); setPriceCalcRowIndex(null) }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <p className={styles.calcNote}>
                  {targetRow ? `Calculation for row ${rowIdx + 1}:` : 'Generic formula:'}
                </p>
                <ol className={styles.calcSteps}>
                  <li>Base price: <strong>${b.base.toFixed(2)}</strong></li>
                  <li>+ {b.miscPercent}% miscellaneous: <strong>${b.miscAmount.toFixed(2)}</strong> → ${b.withMisc.toFixed(2)}</li>
                  <li>+ Shipping ({b.shippingLabel}): <strong>${b.shippingCost.toFixed(2)}</strong> → ${b.afterShipping.toFixed(2)}</li>
                  <li>+ {b.commissionPercent}% marketplace commission: <strong>${b.commissionAmount.toFixed(2)}</strong> → ${b.subtotal.toFixed(2)}</li>
                  <li>+ {b.profitPercent}% profit margin: <strong>${b.profitAmount.toFixed(2)}</strong></li>
                  <li><strong>Grand total (Variant Price): ${b.grandTotal.toFixed(2)}</strong></li>
                </ol>
              </div>
            </div>
          </div>
        )
      })()}

      {showRemapModal && onMappingChange && (
        <div className={styles.modalOverlay} onClick={() => setShowRemapModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Remap columns</h3>
              <div className={styles.modalHeaderActions}>
                <button
                  type="button"
                  className={styles.modalDoneBtn}
                  onClick={() => setShowRemapModal(false)}
                >
                  Done
                </button>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setShowRemapModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <ColumnMapping
                sheets={sheets}
                sampleSheet={sampleSheet}
                mapping={mapping}
                onMappingChange={onMappingChange}
                autoDetectCategories={autoDetectCategories}
                onAutoDetectCategoriesChange={onAutoDetectCategoriesChange}
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.exportSection}>
        <button
          type="button"
          className={styles.exportBtn}
          onClick={handleExport}
          disabled={exporting || merged.length === 0}
        >
          {exporting ? 'Exporting…' : `Download ${downloadFileName}`}
        </button>
        {exportDone && (
          <p className={styles.success}>Download started. Check your downloads folder.</p>
        )}
      </div>
    </div>
  )
}
