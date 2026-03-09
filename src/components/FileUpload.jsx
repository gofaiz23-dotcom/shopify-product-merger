import { useCallback, useState } from 'react'
import { parseFile } from '../lib/parsers'
import styles from './FileUpload.module.css'

export function FileUpload({ files, onFilesChange, onError }) {
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)

  const processFiles = useCallback(async (fileList) => {
    const newFiles = Array.from(fileList || []).filter(
      f => f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))
    )
    if (!newFiles.length) {
      onError?.('Please upload .csv or .xlsx files.')
      return
    }
    setParsing(true)
    try {
      const allSheets = []
      for (const file of newFiles) {
        const sheets = await parseFile(file)
        sheets.forEach(sheet => {
          allSheets.push({
            file: file.name,
            name: sheet.name,
            columns: sheet.columns,
            rows: sheet.rows,
          })
        })
      }
      onFilesChange([...files, ...allSheets])
    } catch (err) {
      onError?.(err.message || 'Failed to parse files.')
    } finally {
      setParsing(false)
    }
  }, [files, onFilesChange, onError])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer?.files)
  }, [processFiles])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const onInputChange = useCallback((e) => {
    processFiles(e.target?.files)
    e.target.value = ''
  }, [processFiles])

  const removeSheet = useCallback((index) => {
    const next = files.filter((_, i) => i !== index)
    onFilesChange(next)
  }, [files, onFilesChange])

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${parsing ? styles.parsing : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          type="file"
          multiple
          accept=".csv,.xlsx,.xls"
          onChange={onInputChange}
          className={styles.input}
          disabled={parsing}
        />
        {parsing ? (
          <p className={styles.hint}>Parsing files…</p>
        ) : (
          <>
            <p className={styles.primary}>Drop Excel or CSV files here, or click to browse</p>
            <p className={styles.hint}>Supports .xlsx and .csv. All sheets are parsed.</p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className={styles.cards}>
          {files.map((sheet, i) => (
            <div key={`${sheet.file}-${sheet.name}-${i}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle} title={sheet.name}>{sheet.name}</span>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeSheet(i)}
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
              <div className={styles.cardMeta}>
                <span>{sheet.rows?.length ?? 0} rows</span>
                <span>{sheet.columns?.length ?? 0} columns</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
