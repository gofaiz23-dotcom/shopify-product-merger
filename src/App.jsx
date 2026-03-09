import { useState, useCallback, useMemo, useEffect } from 'react'

const THEME_KEY = 'shopify-merger-theme'

function getInitialTheme() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  }
  return 'dark'
}
import { FileUpload } from './components/FileUpload'
import { SampleSheetUpload } from './components/SampleSheetUpload'
import { ColumnMapping } from './components/ColumnMapping'
import { PreviewExport } from './components/PreviewExport'
import { getAllColumnOptions } from './lib/merge'
import { detectShopifyField, detectMappingForSampleHeaders } from './lib/shopifyColumns'
import styles from './App.module.css'

const STEPS = ['Upload', 'Map columns', 'Preview & export']

function runAutoDetect(options, sampleSheet) {
  if (sampleSheet?.headers?.length) {
    return detectMappingForSampleHeaders(sampleSheet.headers, options)
  }
  const mapping = {}
  options.forEach(opt => {
    const key = detectShopifyField(opt.columnName, opt.sheetName)
    if (key && !mapping[key]) mapping[key] = opt.id
  })
  return mapping
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [step, setStep] = useState(1)
  const [sampleSheet, setSampleSheet] = useState(null)
  const [files, setFiles] = useState([])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])
  const [mapping, setMapping] = useState({})
  const [autoDetectCategories, setAutoDetectCategories] = useState(true)
  const [pricingConfig, setPricingConfig] = useState({})
  const [message, setMessage] = useState(null)

  const options = useMemo(() => getAllColumnOptions(files), [files])

  useEffect(() => {
    if (step >= 2 && options.length > 0 && Object.keys(mapping).length === 0) {
      setMapping(runAutoDetect(options, sampleSheet))
    }
  }, [step, options.length, sampleSheet])

  const onFilesChange = useCallback((next) => {
    setFiles(next)
    if (next.length === 0) setMapping({})
    setMessage(null)
  }, [])

  const onSampleSheetChange = useCallback((next) => {
    setSampleSheet(next)
    setMapping({})
    setMessage(null)
  }, [])

  const onError = useCallback((msg) => {
    setMessage({ type: 'error', text: msg })
  }, [])

  const canGoToStep2 = files.length > 0
  const canGoToStep3 = files.length > 0

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Shopify Product Merger</h1>
            <p className={styles.subtitle}>Merge Excel & CSV sheets into one Shopify-ready file</p>
          </div>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <nav className={styles.progress} aria-label="Progress">
        <ol className={styles.steps}>
          {STEPS.map((label, i) => {
            const stepNum = i + 1
            const active = step === stepNum
            const done = step > stepNum
            return (
              <li
                key={stepNum}
                className={`${styles.step} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}
              >
                <button
                  type="button"
                  className={styles.stepButton}
                  onClick={() => {
                    if (stepNum === 1 || (stepNum === 2 && canGoToStep2) || (stepNum === 3 && canGoToStep3)) {
                      setStep(stepNum)
                      setMessage(null)
                    }
                  }}
                  disabled={
                    (stepNum === 2 && !canGoToStep2) ||
                    (stepNum === 3 && !canGoToStep3)
                  }
                  aria-current={active ? 'step' : undefined}
                >
                  <span className={styles.stepNum}>{stepNum}</span>
                  <span className={styles.stepLabel}>{label}</span>
                </button>
                {i < STEPS.length - 1 && <span className={styles.connector} aria-hidden />}
              </li>
            )
          })}
        </ol>
      </nav>

      <main className={styles.main}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`} role="alert">
            {message.text}
          </div>
        )}

        {step === 1 && (
          <section className={styles.section} aria-labelledby="step1-heading">
            <h2 id="step1-heading" className={styles.sectionTitle}>Upload files</h2>
            <SampleSheetUpload
              sampleSheet={sampleSheet}
              onSampleSheetChange={onSampleSheetChange}
              onError={onError}
            />
            <FileUpload
              files={files}
              onFilesChange={onFilesChange}
              onError={onError}
            />
            {canGoToStep2 && (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => setStep(2)}
                >
                  Next: Map columns
                </button>
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section className={styles.section} aria-labelledby="step2-heading">
            <h2 id="step2-heading" className={styles.sectionTitle}>Map columns to Shopify</h2>
            <ColumnMapping
              sheets={files}
              sampleSheet={sampleSheet}
              mapping={mapping}
              onMappingChange={setMapping}
              autoDetectCategories={autoDetectCategories}
              onAutoDetectCategoriesChange={setAutoDetectCategories}
            />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setStep(3)}
                disabled={!canGoToStep3}
              >
                Next: Preview & export
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className={styles.section} aria-labelledby="step3-heading">
            <h2 id="step3-heading" className={styles.sectionTitle}>Preview & export</h2>
            <PreviewExport
              sheets={files}
              sampleSheet={sampleSheet}
              mapping={mapping}
              onMappingChange={setMapping}
              autoDetectCategories={autoDetectCategories}
              onAutoDetectCategoriesChange={setAutoDetectCategories}
              pricingConfig={pricingConfig}
              onPricingConfigChange={setPricingConfig}
            />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setStep(2)}
              >
                Back to mapping
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>All processing runs in your browser. No data is sent to any server.</p>
      </footer>
    </div>
  )
}
