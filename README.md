# 🇯🇴 Jordan Gold Price Tracker (مؤشر أسعار الذهب في الأردن)

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Framework: Next.js 16](https://img.shields.io/badge/Framework-Next.js%2016-blue.svg)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/Library-React%2019-blue.svg)](https://react.dev/)
[![Deployment: Netlify](https://img.shields.io/badge/Deploy-Netlify-00AD9F.svg)](https://www.netlify.com/)

A modern, responsive, and high-performance Web Application designed to track and calculate daily gold prices in Jordan. The application automatically crawls official retail pricing data from the Jordan Goldsmiths Syndicate (`jjsjo.com`) to provide immediate, zero-dependency, and cached pricing information.

Live website: **[goldpricejordan.online](https://goldpricejordan.online)**

---

## 📖 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [SEO & Metadata Optimization](#-seo--metadata-optimization)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [License](#-license)
- [Disclaimer](#-disclaimer)

---

## ✨ Features

- **Syndicate Crawler Backend:** Custom-built regular expression HTML parser targeting `https://jjsjo.com/` for zero-dependency scraping, ensuring rapid data load times without heavy libraries.
- **Karat Price Index:** Instantly lists current Buy and Sell prices for all standard karats:
  - **24K** (Pure Gold)
  - **21K** (Jordanian Market standard)
  - **18K** (Jewelry standard)
  - **14K** (Economic standard)
- **Bullion & Sovereigns Index:** Displays live estimated calculations for:
  - English Sovereign (ليرة إنجليزية عيار 21 - 8غ)
  - Rashadi Sovereign (ليرة رشادية عيار 21 - 7.2غ)
  - Fine Gold Bars (1g, 5g, 10g, 20g, 50g, 100g, 1kg)
- **Interactive Calculator & Fee Estimator:**
  - Standard gram calculation with custom weight slider.
  - Granular manufacturing fees (أجور المصنعية) toggle to calculate exact retail quotes.
  - Investment sovereign and bar calculators.
- **Visual Analytics (Interactive Charts):**
  - **Karat Price comparison:** Side-by-side comparison of buying/selling prices per karat.
  - **Local market indicator:** Line chart detailing 7/15/30-day historical gold trend fluctuations anchored to the day's prices.
  - **Savings Planner Distribution:** Visual donut chart representing asset allocation (sovereigns/bars/cash liquidity) based on a custom investment budget.
- **Instant Sharing:** Generates pre-formatted Arabic pricing bulletins for single-click copying/sharing.
- **Arabic First Design:** Optimized for RTL (Right-to-Left) direction, utilizing clean fonts and modern dashboard panels.

---

## 🛠 Architecture & Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Styling:** Vanilla CSS (Custom tokens, animations, responsive grid layouts)
- **Scraper:** Zero-dependency server-side scraping module utilizing native Node Fetch + Regex.
- **ISR (Incremental Static Regeneration):** Configured to cache pricing pages for 5 minutes (`revalidate = 300`). This absorbs high-traffic spikes, reduces load times, and ensures we do not overload the syndicate's servers.

---

## 📈 SEO & Metadata Optimization

The project complies with modern web optimization standards:
- **Semantic HTML5:** Built using clean semantic components (`header`, `main`, `section`, etc.) and accessible target components.
- **JSON-LD Schema Markup:** Injects structured data schemas for:
  - `WebPage` for general catalog crawling.
  - `Dataset` indexing raw financial variables (gold prices per karat).
  - `FAQPage` answering general consumer questions (goldsmith fees, buy/sell differences, pricing variables).
- **OpenGraph & Twitter Cards:** Configured for optimal social sharing representation.
- **Alternate Canonical tags & Robots configuration** generated dynamically.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed (v18.x or later recommended).

### 1. Clone & Install
```bash
git clone https://github.com/z3by/goldpricejo.git
cd goldpricejo
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

### 3. Production Build
To check linting and create the optimized production bundle:
```bash
npm run lint
npm run build
```

---

## ☁️ Deployment

The project is structured to deploy out-of-the-box on **Netlify** using `@netlify/plugin-nextjs`:

1. Connect your GitHub repository to Netlify.
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `.next`
3. Netlify will automatically handle Server Components and ISR caching rules through the configuration in [netlify.toml](netlify.toml).

---

## 📄 License

This repository is licensed under the **[MIT License](LICENSE)**.

---

## ⚠️ Disclaimer

**تنبيه وإخلاء مسؤولية:** هذا المشروع استرشادي غير رسمي ولا يمثل نقابة أصحاب محلات الحلي والمجوهرات في الأردن (نقابة الصاغة الأردنية) أو أي جهة حكومية. الأسعار المعروضة هي تقديرية ومبنية على آخر البيانات المتاحة ولا تعد مرجعاً رسمياً للتداول المالي أو التجاري. يرجى دائماً مراجعة الصاغة مباشرة للتحقق من الأسعار الحالية للسوق قبل أي عملية بيع أو شراء.
