import { useCallback, useState } from 'react'
import { parseFileHeadersOnly } from '../lib/parsers'
import styles from './SampleSheetUpload.module.css'

export function SampleSheetUpload({ sampleSheet, onSampleSheetChange, onError }) {
  const [parsing, setParsing] = useState(false)
  const [dragging, setDragging] = useState(false)

  const processFile = useCallback(async (file) => {
    if (!file || (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls'))) {
      onError?.('Please upload a .csv or .xlsx file.')
      return
    }
    setParsing(true)
    try {
      const { headers, fileName } = await parseFileHeadersOnly(file)
      if (!headers || headers.length === 0) {
        onError?.('No headers found in the file.')
        return
      }
      onSampleSheetChange({ headers, fileName })
    } catch (err) {
      onError?.(err.message || 'Failed to parse file.')
    } finally {
      setParsing(false)
    }
  }, [onSampleSheetChange, onError])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const onInputChange = useCallback((e) => {
    const file = e.target?.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }, [processFile])

  const remove = useCallback(() => {
    onSampleSheetChange(null)
  }, [onSampleSheetChange])

  return (
    <div className={styles.wrap}>
      <label className={styles.label}>Sample sheet (optional)</label>
      <p className={styles.hint}>
        Upload a CSV or Excel file to define your output format. Only the header row is used.
        If you skip this, we&apos;ll use the standard Shopify product CSV format.
      </p>
      {!sampleSheet ? (
        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${parsing ? styles.parsing : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={onInputChange}
            className={styles.input}
            disabled={parsing}
            aria-label="Upload sample sheet"
          />
          {parsing ? 'Parsing…' : 'Drop file or click to upload'}
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{sampleSheet.fileName}</span>
            <button type="button" className={styles.remove} onClick={remove} aria-label="Remove">
              ×
            </button>
          </div>
          <p className={styles.headersLabel}>Extracted headers ({sampleSheet.headers.length}):</p>
          <div className={styles.headersList}>
            {sampleSheet.headers.map((h, i) => (
              <span key={i} className={styles.headerTag}>{h || '(empty)'}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
