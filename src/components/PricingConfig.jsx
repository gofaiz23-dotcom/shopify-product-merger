import { useState } from 'react'
import { DEFAULT_PRICING_CONFIG } from '../lib/priceCalculator'
import styles from './PricingConfig.module.css'

export function PricingConfig({ config, onChange }) {
  const [open, setOpen] = useState(false)
  const c = { ...DEFAULT_PRICING_CONFIG, ...config }

  const update = (key, value) => {
    const num = parseFloat(value)
    onChange({
      ...config,
      [key]: isNaN(num) ? value : num,
    })
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen(o => !o)}
      >
        {open ? '▼' : '▶'} Pricing formula settings
      </button>
      {open && (
        <div className={styles.form}>
          <div className={styles.row}>
            <label>Misc %</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={c.miscPercent}
              onChange={e => update('miscPercent', e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label>LTL shipping cost ($)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={c.ltlCost}
              onChange={e => update('ltlCost', e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label>Parcel/Ground cost ($)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={c.parcelCost}
              onChange={e => update('parcelCost', e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label>Marketplace commission %</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={c.commissionPercent}
              onChange={e => update('commissionPercent', e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label>Profit margin %</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={c.profitPercent}
              onChange={e => update('profitPercent', e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label>LTL keywords (comma-separated)</label>
            <input
              type="text"
              value={c.ltlKeywords}
              onChange={e => update('ltlKeywords', e.target.value)}
              placeholder="ltl,freight"
            />
          </div>
          <div className={styles.row}>
            <label>Parcel keywords (comma-separated)</label>
            <input
              type="text"
              value={c.parcelKeywords}
              onChange={e => update('parcelKeywords', e.target.value)}
              placeholder="parcel,ground"
            />
          </div>
        </div>
      )}
    </div>
  )
}
