# Shopify Product Merger

A browser-based tool that lets Shopify store owners **merge multiple Excel/CSV files** into a single **Shopify-ready product CSV**—no backend, no server.

## Features

- **Upload** — Drag & drop or click to add any number of `.xlsx` or `.csv` files. All sheets are parsed in the browser.
- **Column mapping** — Auto-detection maps your columns to Shopify fields (Title, SKU, Price, etc.). Override any mapping via dropdowns.
- **Merge by SKU** — Uses SKU as the primary key to join all sheets. Rows with the same SKU are merged into one product row.
- **Preview & export** — Preview the first 10 merged rows, then download `shopify_products.csv` in the official Shopify product CSV format.

## Tech

- **React** + **Vite**
- **SheetJS (xlsx)** — Excel parsing
- **PapaParse** — CSV parsing
- All processing in the browser; no data is sent to any server.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
```

Output is in `dist/`. Serve with any static host.

## Usage

1. **Upload** — Add one or more Excel or CSV files. Each file appears as a card with row/column counts. Remove any file with the × button.
2. **Map columns** — Review the auto-detected mapping. Change any dropdown to map your columns to Shopify fields. Use “Auto-detect again” to re-run detection.
3. **Preview & export** — Check the preview table and stats, then click **Download shopify_products.csv** to get the file ready for Shopify product import.
