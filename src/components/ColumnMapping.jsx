import { useState, useMemo, useRef, useEffect } from 'react'
import {
  SHOPIFY_FIELDS,
  SHOPIFY_CSV_HEADERS,
  FIELD_TO_SHOPIFY_HEADER,
  detectShopifyField,
  detectMappingForSampleHeaders,
} from '../lib/shopifyColumns'
import { getAllColumnOptions, getSampleValue, mergeSheetsBySku } from '../lib/merge'
import { detectCategory } from '../lib/categoryMapper'
import styles from './ColumnMapping.module.css'

function MapSelect({ value, options, onChange, className, styles }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('click', onOutside)
    return () => document.removeEventListener('click', onOutside)
  }, [open])

  const selected = options.find(o => o.id === value)
  return (
    <div ref={ref} className={styles.selectWrap}>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(o => !o)}
      >
        {selected ? (
          <>
            <span className={styles.optColName}>{selected.columnName}</span>
            <span className={styles.optFileName}> [{selected.sheetName}]</span>
          </>
        ) : (
          '— Not mapped —'
        )}
      </button>
      {open && (
        <ul className={styles.selectDropdown}>
          <li>
            <button type="button" onClick={() => { onChange(null); setOpen(false) }}>
              — Not mapped —
            </button>
          </li>
          {options.map(opt => (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => { onChange(opt.id); setOpen(false) }}
                className={value === opt.id ? styles.optSelected : undefined}
              >
                <span className={styles.optColName}>{opt.columnName}</span>
                <span className={styles.optFileName}> [{opt.sheetName}]</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function isProductCategoryField(field) {
  const k = (field?.key || '').toLowerCase().replace(/[\s_-]+/g, ' ')
  return k === 'productcategory' || k === 'product category' || k === 'category'
}

export function ColumnMapping({
  sheets,
  sampleSheet,
  mapping,
  onMappingChange,
  autoDetectCategories = true,
  onAutoDetectCategoriesChange,
}) {
  const options = useMemo(() => getAllColumnOptions(sheets), [sheets])

  const headerToField = useMemo(() => {
    return Object.fromEntries(
      Object.entries(FIELD_TO_SHOPIFY_HEADER).map(([k, v]) => [v, k])
    )
  }, [])

  const targetFields = useMemo(() => {
    if (sampleSheet && sampleSheet.headers?.length) {
      return sampleSheet.headers.map(h => ({ key: h, label: h }))
    }
    const fields = SHOPIFY_CSV_HEADERS.filter(h => headerToField[h]).map(header => ({
      key: headerToField[header],
      label: header,
    }))
    fields.push({ key: 'shipType', label: 'Ship type (for price formula)' })
    return fields
  }, [sampleSheet, headerToField])

  const handleSelect = (fieldKey, columnId) => {
    onMappingChange({ ...mapping, [fieldKey]: columnId || undefined })
  }

  const autoDetect = () => {
    if (sampleSheet && sampleSheet.headers?.length) {
      onMappingChange(detectMappingForSampleHeaders(sampleSheet.headers, options))
    } else {
      const next = { ...mapping }
      options.forEach(opt => {
        const key = detectShopifyField(opt.columnName, opt.sheetName)
        if (key && !next[key]) next[key] = opt.id
      })
      onMappingChange(next)
    }
  }

  const merged = useMemo(() => {
    if (!sheets.length) return []
    return mergeSheetsBySku(sheets, mapping)
  }, [sheets, mapping])

  const detectedCategoryPreview = useMemo(() => {
    if (!autoDetectCategories || merged.length === 0) return ''
    return detectCategory(merged[0])
  }, [autoDetectCategories, merged])

  return (
    <div className={styles.wrap}>
      {onAutoDetectCategoriesChange != null && (
        <label className={styles.autoDetectToggle}>
          <input
            type="checkbox"
            checked={autoDetectCategories}
            onChange={e => onAutoDetectCategoriesChange(e.target.checked)}
          />
          <span>Auto-detect Product Categories</span>
        </label>
      )}
      <div className={styles.toolbar}>
        <button type="button" className={styles.autoDetect} onClick={autoDetect}>
          Auto-detect again
        </button>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{sampleSheet ? 'Output column (from sample)' : 'Shopify field'}</th>
              <th>Your column</th>
              <th>Sample value</th>
            </tr>
          </thead>
          <tbody>
            {targetFields.map(field => (
              <tr key={field.key}>
                <td className={styles.fieldLabel}>{field.label}</td>
                <td>
                  <MapSelect
                    value={mapping[field.key] || ''}
                    options={options}
                    onChange={columnId => handleSelect(field.key, columnId || null)}
                    className={styles.select}
                    styles={styles}
                  />
                </td>
                <td className={styles.sample}>
                  {mapping[field.key]
                    ? getSampleValue(sheets, mapping[field.key])
                    : '—'}
                  {autoDetectCategories &&
                    isProductCategoryField(field) &&
                    detectedCategoryPreview && (
                      <span className={styles.categoryPreview} title="Auto-detected from title & type">
                        {' '}
                        → {detectedCategoryPreview}
                      </span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
