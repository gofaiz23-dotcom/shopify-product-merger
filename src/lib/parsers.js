import * as XLSX from 'xlsx'
import Papa from 'papaparse'

/**
 * Parse a file (Excel or CSV) and return array of { name, columns, rows } per sheet
 */
export function parseFile(file) {
  const ext = (file.name || '').toLowerCase()
  if (ext.endsWith('.csv')) {
    return parseCSV(file)
  }
  if (ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
    return parseExcel(file)
  }
  throw new Error('Unsupported file type. Use .csv or .xlsx')
}

function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(result) {
        if (result.errors.length && result.errors.some(e => e.type === 'Quotes')) {
          reject(new Error('CSV parse error. Check quotes and commas.'))
          return
        }
        const rows = result.data.filter(r => r && Object.keys(r).length)
        const columns = rows.length ? Object.keys(rows[0]) : []
        resolve([{ name: file.name, columns, rows }])
      },
      error(err) {
        reject(err)
      }
    })
  })
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheets = []
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })
          const rows = json.filter(r => r && Object.keys(r).length)
          const columns = rows.length ? Object.keys(rows[0]) : (sheet['!ref'] ? [] : [])
          sheets.push({ name: `${file.name} (${sheetName})`, columns, rows })
        })
        resolve(sheets)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse a file and return only the header row (column names). Works for CSV and Excel.
 */
export function parseFileHeadersOnly(file) {
  const ext = (file.name || '').toLowerCase()
  if (ext.endsWith('.csv')) {
    return parseCSVHeadersOnly(file)
  }
  if (ext.endsWith('.xlsx') || ext.endsWith('.xls')) {
    return parseExcelHeadersOnly(file)
  }
  throw new Error('Unsupported file type. Use .csv or .xlsx')
}

function parseCSVHeadersOnly(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      preview: 1,
      skipEmptyLines: true,
      complete(result) {
        const first = result.data && result.data[0]
        const headers = first ? Object.keys(first) : (result.meta?.fields || [])
        resolve({ headers, fileName: file.name })
      },
      error(err) {
        reject(err)
      }
    })
  })
}

function parseExcelHeadersOnly(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '', header: 1 })
        const headers = (json[0] || []).filter(h => h != null && String(h).trim() !== '')
        resolve({ headers, fileName: file.name })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}
