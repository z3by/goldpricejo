"use client";

import React, { useState, useEffect } from "react";
import { fetchGoldPrices, PricesResult } from "../actions";
import { KaratComparisonChart, SavingsDistributionChart, HistoricalTrendChart } from "./Charts";

interface DashboardProps {
  initialData: PricesResult;
}

type OunceSizeType = "1g" | "5g" | "10g" | "20g" | "ounce" | "50g" | "100g" | "1kg";

const OUNCE_SIZES: Record<OunceSizeType, { label: string; weight: number; labelAr: string }> = {
  "1g": { label: "1 غرام", weight: 1.0, labelAr: "سبيكة 1 غرام" },
  "5g": { label: "5 غرام", weight: 5.0, labelAr: "سبيكة 5 غرام" },
  "10g": { label: "10 غرام", weight: 10.0, labelAr: "سبيكة 10 غرام" },
  "20g": { label: "20 غرام", weight: 20.0, labelAr: "سبيكة 20 غرام" },
  "ounce": { label: "أونصة (31.10غ)", weight: 31.10347, labelAr: "أونصة ذهب" },
  "50g": { label: "50 غرام", weight: 50.0, labelAr: "سبيكة 50 غرام" },
  "100g": { label: "100 غرام", weight: 100.0, labelAr: "سبيكة 100 غرام" },
  "1kg": { label: "1 كيلو غرام", weight: 1000.0, labelAr: "سبيكة 1 كيلو" },
};

export default function Dashboard({ initialData }: DashboardProps) {
  const [data, setData] = useState<PricesResult>(initialData);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"karats" | "bullion">("karats");
  const [chartTab, setChartTab] = useState<"local" | "global">("local");

  const [calcProduct, setCalcProduct] = useState<"gram" | "english" | "rashadi" | "ounce">("gram");
  const [quantity, setQuantity] = useState<string>("1");
  const [weight, setWeight] = useState<string>("10");
  const [selectedKarat, setSelectedKarat] = useState<string>("21K");
  const [calcType, setCalcType] = useState<"sell" | "buy" | "plan">("sell");
  const [includeFee, setIncludeFee] = useState<boolean>(true);
  const [mfgFeeInput, setMfgFeeInput] = useState<string>("5.0");

  const [plannerBudget, setPlannerBudget] = useState<string>("1000");
  const [plannerPreference, setPlannerPreference] = useState<"combo" | "sovereigns" | "bars">("combo");
  const [copied, setCopied] = useState<boolean>(false);
  const [ounceSize, setOunceSize] = useState<OunceSizeType>("ounce");

  const handleRefresh = async (silent = false) => {
    setRefreshError(null);
    try {
      const result = await fetchGoldPrices();
      if (result.success) {
        setData(result);
      } else if (!silent) {
        setRefreshError("عذراً، لم نتمكن من الاتصال بخوادم النقابة لتحديث الأسعار.");
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setRefreshError("فشل تحديث البيانات. يرجى التحقق من اتصال الشبكة.");
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRefresh(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const p24 = data.prices.find((p) => p.karat === "24K") || { sell: 0, buy: 0 };
  const p21 = data.prices.find((p) => p.karat === "21K") || { sell: 0, buy: 0 };

  const sell22 = p24.sell * (22 / 24);
  const buy22 = p24.buy * (22 / 24);

  const ounceSell = p24.sell * 31.10347;
  const ounceBuy = p24.buy * 31.10347;

  const selectedOunceSizeWeight = OUNCE_SIZES[ounceSize].weight;
  const selectedOunceSell = p24.sell * selectedOunceSizeWeight;
  const selectedOunceBuy = p24.buy * selectedOunceSizeWeight;

  const rashadi21Sell = p21.sell * 7.20;
  const rashadi21Buy = p21.buy * 7.20;

  const english21Sell = p21.sell * 8.00;
  const english21Buy = p21.buy * 8.00;

  const activeKaratData = data.prices.find(
    (p) => p.karat.toUpperCase() === selectedKarat.toUpperCase()
  ) || { sell: 0, buy: 0 };

  const getMfgFee = (karat: string): number => {
    switch (karat.toUpperCase()) {
      case "24K": return 1.5;
      case "22K": return 2.0; 
      case "21K": return 5.0;
      case "18K": return 7.0;
      case "14K": return 5.5;
      default: return 0.0;
    }
  };

  const weightNum = parseFloat(weight) || 0;
  const qtyNum = parseFloat(quantity) || 1;

  let rawGramPrice = 0;
  let unitPrice = 0;
  let mfgFeePerGram = 0;
  let totalRawPrice = 0;
  let totalFee = 0;
  let grandTotal = 0;
  let displayWeight = 0;

  if (calcProduct === "gram") {
    rawGramPrice = selectedKarat.toUpperCase() === "22K"
      ? (calcType === "sell" ? sell22 : buy22)
      : (calcType === "sell" ? activeKaratData.sell : activeKaratData.buy);
    mfgFeePerGram = includeFee && calcType === "sell" ? (parseFloat(mfgFeeInput) || 0) : 0;
    totalRawPrice = weightNum * rawGramPrice;
    totalFee = weightNum * mfgFeePerGram;
    grandTotal = totalRawPrice + totalFee;
    displayWeight = weightNum;
  } else if (calcProduct === "english") {
    unitPrice = calcType === "sell" ? english21Sell : english21Buy;
    totalRawPrice = qtyNum * unitPrice;
    totalFee = 0;
    grandTotal = totalRawPrice;
    displayWeight = qtyNum * 8.00;
  } else if (calcProduct === "rashadi") {
    unitPrice = calcType === "sell" ? rashadi21Sell : rashadi21Buy;
    totalRawPrice = qtyNum * unitPrice;
    totalFee = 0;
    grandTotal = totalRawPrice;
    displayWeight = qtyNum * 7.20;
  } else if (calcProduct === "ounce") {
    unitPrice = calcType === "sell" ? selectedOunceSell : selectedOunceBuy;
    totalRawPrice = qtyNum * unitPrice;
    totalFee = 0;
    grandTotal = totalRawPrice;
    displayWeight = qtyNum * selectedOunceSizeWeight;
  }

  const handleKaratChange = (k: string) => {
    setSelectedKarat(k);
    setMfgFeeInput(getMfgFee(k).toFixed(1));
  };

  const handleCalcTypeChange = (type: "sell" | "buy" | "plan") => {
    setCalcType(type);
    if (type === "sell") {
      setMfgFeeInput(getMfgFee(selectedKarat).toFixed(1));
    }
  };

  const handleCopy = () => {
    const p18 = data.prices.find(p=>p.karat==="18K") || { sell: 0, buy: 0 };
    const dateFormatted = formatArabicDate(data.timestamp);
    const linkOrigin = typeof window !== "undefined" ? window.location.origin : "https://goldpricejo.netlify.app";

    const textToCopy = `نشرة أسعار الذهب اليوم في الأردن\n` +
      `التحديث: ${dateFormatted}\n\n` +
      `• عيار 24: بيع ${p24.sell.toFixed(3)} | شراء ${p24.buy.toFixed(3)} د.أ\n` +
      `• عيار 21: بيع ${p21.sell.toFixed(3)} | شراء ${p21.buy.toFixed(3)} د.أ\n` +
      `• عيار 18: بيع ${p18.sell.toFixed(3)} | شراء ${p18.buy.toFixed(3)} د.أ\n\n` +
      `الأونصة والليرات الاستثمارية:\n` +
      `• أونصة الذهب 24K (31.10غ): بيع ${ounceSell.toFixed(3)} | شراء ${ounceBuy.toFixed(3)} د.أ\n` +
      `• سبيكة ذهب 50غ 24K: بيع ${(p24.sell * 50).toFixed(3)} | شراء ${(p24.buy * 50).toFixed(3)} د.أ\n` +
      `• سبيكة ذهب 100غ 24K: بيع ${(p24.sell * 100).toFixed(3)} | شراء ${(p24.buy * 100).toFixed(3)} د.أ\n` +
      `• ليرة إنجليزية عيار 21 (8غ): بيع ${english21Sell.toFixed(3)} | شراء ${english21Buy.toFixed(3)} د.أ\n` +
      `• ليرة رشادية عيار 21 (7.2غ): بيع ${rashadi21Sell.toFixed(3)} | شراء ${rashadi21Buy.toFixed(3)} د.أ\n\n` +
      `${linkOrigin}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  interface PlanItem {
    name: string;
    count: number;
    cost: number;
    weight: number;
  }

  const getSavingsPlan = () => {
    const budgetNum = parseFloat(plannerBudget) || 0;
    const plan: PlanItem[] = [];
    let remaining = budgetNum;
    
    const sovereignPrice = english21Sell + 2.5; 
    const rashadiPrice = rashadi21Sell + 2.0;
    const bar10gPrice = p24.sell * 10 + 15.0;
    const bar5gPrice = p24.sell * 5 + 10.0;
    const bar1gPrice = p24.sell * 1 + 5.0;

    if (plannerPreference === "sovereigns") {
      if (remaining >= sovereignPrice) {
        const count = Math.floor(remaining / sovereignPrice);
        const cost = count * sovereignPrice;
        plan.push({ name: "ليرة إنجليزية (عيار 21 - 8غ)", count, cost, weight: count * 8 });
        remaining -= cost;
      }
      if (remaining >= rashadiPrice) {
        const count = Math.floor(remaining / rashadiPrice);
        const cost = count * rashadiPrice;
        plan.push({ name: "ليرة رشادية (عيار 21 - 7.2غ)", count, cost, weight: count * 7.2 });
        remaining -= cost;
      }
    } else if (plannerPreference === "bars") {
      if (remaining >= bar10gPrice) {
        const count = Math.floor(remaining / bar10gPrice);
        const cost = count * bar10gPrice;
        plan.push({ name: "سبائك ذهبية 24K (وزن 10غ)", count, cost, weight: count * 10 });
        remaining -= cost;
      }
      if (remaining >= bar5gPrice) {
        const count = Math.floor(remaining / bar5gPrice);
        const cost = count * bar5gPrice;
        plan.push({ name: "سبائك ذهبية 24K (وزن 5غ)", count, cost, weight: count * 5 });
        remaining -= cost;
      }
    } else {
      if (remaining >= bar10gPrice * 1.5) {
        const count = Math.floor(remaining / (bar10gPrice * 2)) || 1;
        const cost = count * bar10gPrice;
        plan.push({ name: "سبائك ذهبية 24K (وزن 10غ)", count, cost, weight: count * 10 });
        remaining -= cost;
      }
      if (remaining >= sovereignPrice) {
        const count = Math.floor(remaining / sovereignPrice);
        const cost = count * sovereignPrice;
        plan.push({ name: "ليرة إنجليزية (عيار 21 - 8غ)", count, cost, weight: count * 8 });
        remaining -= cost;
      }
      if (remaining >= rashadiPrice) {
        const count = Math.floor(remaining / rashadiPrice);
        const cost = count * rashadiPrice;
        plan.push({ name: "ليرة رشادية (عيار 21 - 7.2غ)", count, cost, weight: count * 7.2 });
        remaining -= cost;
      }
    }

    if (remaining >= bar1gPrice) {
      const count = Math.floor(remaining / bar1gPrice);
      const cost = count * bar1gPrice;
      plan.push({ name: "سبائك استثمارية 24K (وزن 1غ)", count, cost, weight: count * 1 });
      remaining -= cost;
    }

    return { plan, remaining, budgetNum };
  };

  const planResult = getSavingsPlan();

  const formatArabicDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("ar-JO", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Amman"
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const shareText = `أسعار الذهب اليوم في الأردن حسب نشرة الصاغة:\n` +
    `• عيار 24: بيع ${data.prices.find(p=>p.karat==="24K")?.sell || '-'} / شراء ${data.prices.find(p=>p.karat==="24K")?.buy || '-'}\n` +
    `• عيار 21: بيع ${data.prices.find(p=>p.karat==="21K")?.sell || '-'} / شراء ${data.prices.find(p=>p.karat==="21K")?.buy || '-'}\n` +
    `• عيار 18: بيع ${data.prices.find(p=>p.karat==="18K")?.sell || '-'} / شراء ${data.prices.find(p=>p.karat==="18K")?.buy || '-'}\n` +
    `احسب التكلفة الإجمالية والـمصنعيات مباشرة عبر الرابط:\n`;

  const encodedShareText = typeof window !== "undefined" ? encodeURIComponent(shareText + window.location.href) : "";

  return (
    <>
      {/* Navigation Header */}
      <header className="app-header">
        <div className="container header-flex">
          <div className="brand-title">
            سعر الذهب <span>الأردن</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flex: 1, paddingBottom: "100px" }}>
        
        {refreshError && (
          <div style={{ 
            background: "#FEF2F2", 
            border: "1px solid #FCA5A5", 
            color: "#991B1B",
            padding: "16px",
            borderRadius: "var(--radius-sm)",
            marginTop: "24px",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: '#DC2626', color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>!</span>
            <span>{refreshError}</span>
          </div>
        )}

        <div className="hero-banner">
          <h1 className="main-title">أسعار الذهب اليوم في الأردن</h1>
          <p className="sub-title">تحديث مباشر ولحظي لأسعار بيع وشراء غرام الذهب والأونصة والليرات الإنجليزية والرشادية بالدينار الأردني الصادرة عن نقابة الصاغة.</p>
        </div>

        <div className="disclaimer-banner">
          <span className="icon">⚠️</span>
          <span>
            <strong>تنبيه وإخلاء مسؤولية:</strong> هذا الموقع استرشادي غير رسمي ولا يمثل نقابة الصاغة الأردنية أو أي جهة حكومية. الأسعار المعروضة هي أسعار تقريبية مبنية على آخر البيانات المنشورة وقد تختلف عن أسعار السوق الفعلية في الصاغة لحظة بلحظة. يرجى مراجعة الصائغ مباشرة قبل إتمام أي عملية بيع أو شراء.
          </span>
        </div>

        <div className="dashboard-layout">
          
          {/* Left Column: Official Pricing Index */}
          <section className="minimal-panel col-span-7">
            <div className="panel-heading">
              <h2 style={{ margin: 0 }}>النشرة الرسمية</h2>
              <button onClick={handleCopy} className="btn-outline">
                {copied ? "✓ تم النسخ" : "نسخ النشرة"}
              </button>
            </div>
            
            <div className="tab-container">
              <button
                type="button"
                className={`tab-btn ${activeTab === "karats" ? "active" : ""}`}
                onClick={() => setActiveTab("karats")}
              >
                العيارات
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "bullion" ? "active" : ""}`}
                onClick={() => setActiveTab("bullion")}
              >
                السبائك والليرات
              </button>
            </div>
            
            {activeTab === "karats" ? (
              <>
                <div className="hero-price">
                  <span className="hero-price-label">عيار 21 (مؤشر السوق)</span>
                  <div>
                    <span className="hero-price-value">{(data.prices.find(p => p.karat === "21K")?.sell || 0).toFixed(3)}</span>
                    <span className="hero-price-currency">د.أ</span>
                  </div>
                  <div className="hero-price-stats">
                    <div>شراء: <span>{(data.prices.find(p => p.karat === "21K")?.buy || 0).toFixed(3)}</span></div>
                    <div className="profit">فارق: <span>{((data.prices.find(p => p.karat === "21K")?.sell || 0) - (data.prices.find(p => p.karat === "21K")?.buy || 0)).toFixed(3)}</span></div>
                  </div>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[
                    data.prices.find(p => p.karat === "24K"),
                    { karat: "22K", sell: sell22, buy: buy22 },
                    data.prices.find(p => p.karat === "18K"),
                    data.prices.find(p => p.karat === "14K")
                  ].map((p) => {
                    if (!p) return null;
                    return (
                      <li key={p.karat} className="list-item">
                        <div>
                          <div className="list-item-title">عيار {p.karat.replace("K", "")}</div>
                          <span className="list-item-sub">
                            {p.karat === "24K" && "ذهب صافي"}
                            {p.karat === "22K" && "مسكوكات"}
                            {p.karat === "18K" && "مجوهرات"}
                            {p.karat === "14K" && "اقتصادي"}
                          </span>
                        </div>
                        <div className="list-item-value-group">
                          <div className="list-item-stat">
                            <span className="stat-label">بيع</span>
                            <span className="stat-value">{p.sell.toFixed(3)}</span>
                          </div>
                          <div className="list-item-stat">
                            <span className="stat-label">شراء</span>
                            <span className="stat-value">{p.buy.toFixed(3)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div style={{ marginTop: "20px" }}>
                  <KaratComparisonChart prices={data.prices} />
                </div>
              </>
            ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[
                    { title: "سبيكة ذهب 100 غرام", sub: "100.00 غرام - 24K", sell: p24.sell * 100, buy: p24.buy * 100 },
                    { title: "سبيكة ذهب 50 غرام", sub: "50.00 غرام - 24K", sell: p24.sell * 50, buy: p24.buy * 50 },
                    { title: "أونصة الذهب", sub: "31.10 غرام - 24K", sell: ounceSell, buy: ounceBuy },
                    { title: "سبيكة ذهب 20 غرام", sub: "20.00 غرام - 24K", sell: p24.sell * 20, buy: p24.buy * 20 },
                    { title: "سبيكة ذهب 10 غرام", sub: "10.00 غرام - 24K", sell: p24.sell * 10, buy: p24.buy * 10 },
                    { title: "سبيكة ذهب 5 غرام", sub: "5.00 غرام - 24K", sell: p24.sell * 5, buy: p24.buy * 5 },
                    { title: "ليرة إنجليزية", sub: "8.00 غرام - عيار 21", sell: english21Sell, buy: english21Buy },
                    { title: "ليرة رشادية", sub: "7.20 غرام - عيار 21", sell: rashadi21Sell, buy: rashadi21Buy }
                  ].map((item, idx) => (
                    <li key={idx} className="list-item">
                      <div>
                        <div className="list-item-title">{item.title}</div>
                        <span className="list-item-sub">{item.sub}</span>
                      </div>
                      <div className="list-item-value-group">
                        <div className="list-item-stat">
                          <span className="stat-label">بيع</span>
                          <span className="stat-value">{item.sell.toFixed(3)}</span>
                        </div>
                        <div className="list-item-stat">
                          <span className="stat-label">شراء</span>
                          <span className="stat-value">{item.buy.toFixed(3)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
            )}

            <div style={{ marginTop: "24px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              آخر تحديث: {formatArabicDate(data.timestamp)}
            </div>
          </section>

          {/* Right Column: Calculator */}
          <section className="minimal-panel col-span-5">
            <h2 style={{ marginBottom: "24px" }}>الحاسبة والتخطيط</h2>
            
            <div className="segmented-control">
              <button
                type="button"
                className={`segment-btn ${calcType === "sell" ? "active" : ""}`}
                onClick={() => handleCalcTypeChange("sell")}
              >
                شراء
              </button>
              <button
                type="button"
                className={`segment-btn ${calcType === "buy" ? "active" : ""}`}
                onClick={() => handleCalcTypeChange("buy")}
              >
                بيع
              </button>
              <button
                type="button"
                className={`segment-btn ${calcType === "plan" ? "active" : ""}`}
                onClick={() => handleCalcTypeChange("plan")}
              >
                ادخار
              </button>
            </div>

            {calcType !== "plan" ? (
              <>
                <span className="input-label">نوع الذهب</span>
                <div className="pills-row">
                  {[
                    { id: "gram", label: "ذهب بالجرام" },
                    { id: "english", label: "ليرة إنجليزية" },
                    { id: "rashadi", label: "ليرة رشادية" },
                    { id: "ounce", label: "أونصة / سبيكة" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`pill-btn ${calcProduct === p.id ? "active" : ""}`}
                      onClick={() => setCalcProduct(p.id as typeof calcProduct)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {calcProduct === "gram" && (
                  <>
                    <span className="input-label">العيار</span>
                    <div className="pills-row">
                      {["24K", "22K", "21K", "18K", "14K"].map((k) => (
                        <button
                          key={k}
                          type="button"
                          className={`pill-btn ${selectedKarat === k ? "active" : ""}`}
                          onClick={() => handleKaratChange(k)}
                        >
                          {k.replace("K", "")}
                        </button>
                      ))}
                    </div>

                    <div className="input-box">
                      <span className="input-label">الوزن</span>
                      <div className="input-row">
                        <input
                          type="number"
                          className="clean-input"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="0.0"
                          min="0.1"
                          step="0.1"
                        />
                        <span className="input-unit">غرام</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="150"
                        value={parseFloat(weight) || 1}
                        onChange={(e) => setWeight(e.target.value)}
                        className="slider-input"
                        aria-label="الوزن بالجرام"
                      />
                      
                      <div className="pills-row" style={{ marginTop: "16px", marginBottom: 0 }}>
                        {[
                          { label: "5غ", value: 5 },
                          { label: "10غ", value: 10 },
                          { label: "20غ", value: 20 },
                          { label: "50غ", value: 50 },
                          { label: "100غ", value: 100 }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            className="pill-btn-outline"
                            onClick={() => setWeight(preset.value.toString())}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {calcType === "sell" && (
                      <>
                        <div className="checkbox-row">
                          <input
                            id="fees-toggle-box"
                            type="checkbox"
                            className="checkbox-input"
                            checked={includeFee}
                            onChange={(e) => setIncludeFee(e.target.checked)}
                          />
                          <label htmlFor="fees-toggle-box" className="checkbox-label">
                            إضافة المصنعية
                          </label>
                        </div>
                        
                        {includeFee && (
                          <div className="input-box" style={{ padding: "12px 16px" }}>
                            <span className="input-label" style={{ marginBottom: "8px" }}>مصنعية الغرام</span>
                            <div className="input-row">
                              <input
                                type="number"
                                className="clean-input"
                                style={{ fontSize: "1.5rem" }}
                                value={mfgFeeInput}
                                onChange={(e) => setMfgFeeInput(e.target.value)}
                                placeholder="0.0"
                                min="0"
                                step="0.1"
                              />
                              <span className="input-unit">د.أ</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {(calcProduct === "english" || calcProduct === "rashadi") && (
                  <>
                    <div className="input-box">
                      <span className="input-label">العدد (الكمية)</span>
                      <div className="input-row">
                        <input
                          type="number"
                          className="clean-input"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="1"
                          min="1"
                          step="1"
                        />
                        <span className="input-unit">قطعة</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={parseFloat(quantity) || 1}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="slider-input"
                        aria-label="الكمية بالقطع"
                      />
                      
                      <div className="pills-row" style={{ marginTop: "16px", marginBottom: 0 }}>
                        {[
                          { label: "1 ليرة", value: 1 },
                          { label: "2 ليرة", value: 2 },
                          { label: "5 ليرات", value: 5 },
                          { label: "10 ليرات", value: 10 }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            className="pill-btn-outline"
                            onClick={() => setQuantity(preset.value.toString())}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {calcProduct === "ounce" && (
                  <>
                    <span className="input-label">وزن السبيكة / الأونصة</span>
                    <div className="pills-row" style={{ flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                      {(Object.keys(OUNCE_SIZES) as OunceSizeType[]).map((key) => (
                        <button
                          key={key}
                          type="button"
                          className={`pill-btn ${ounceSize === key ? "active" : ""}`}
                          style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                          onClick={() => setOunceSize(key)}
                        >
                          {OUNCE_SIZES[key].label}
                        </button>
                      ))}
                    </div>

                    <div className="input-box">
                      <span className="input-label">العدد (الكمية)</span>
                      <div className="input-row">
                        <input
                          type="number"
                          className="clean-input"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="1"
                          min="1"
                          step="1"
                        />
                        <span className="input-unit">
                          {ounceSize === "ounce" ? "أونصة" : "سبيكة"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={parseFloat(quantity) || 1}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="slider-input"
                        aria-label={`الكمية - ${OUNCE_SIZES[ounceSize].labelAr}`}
                      />
                      
                      <div className="pills-row" style={{ marginTop: "16px", marginBottom: 0 }}>
                        {[
                          { label: `1 ${ounceSize === "ounce" ? "أونصة" : "سبيكة"}`, value: 1 },
                          { label: `2 ${ounceSize === "ounce" ? "أونصة" : "سبيكة"}`, value: 2 },
                          { label: `5 ${ounceSize === "ounce" ? "أونصات" : "سبائك"}`, value: 5 },
                          { label: `10 ${ounceSize === "ounce" ? "أونصات" : "سبائك"}`, value: 10 }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            className="pill-btn-outline"
                            onClick={() => setQuantity(preset.value.toString())}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="receipt-block">
                  {calcProduct === "gram" ? (
                    <>
                      <div className="receipt-row">
                        <span>السعر الخام للغرام</span>
                        <span className="value">{rawGramPrice.toFixed(3)} د.أ</span>
                      </div>
                      {calcType === "sell" && includeFee && (
                        <div className="receipt-row">
                          <span>مصنعية للغرام</span>
                          <span className="value">+{mfgFeePerGram.toFixed(2)} د.أ</span>
                        </div>
                      )}
                      <div className="receipt-row">
                        <span>الوزن</span>
                        <span className="value">{weightNum} غرام</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="receipt-row">
                        <span>سعر الوحدة</span>
                        <span className="value">{unitPrice.toFixed(3)} د.أ</span>
                      </div>
                      <div className="receipt-row">
                        <span>العدد</span>
                        <span className="value">
                          {qtyNum} {calcProduct === "ounce" ? OUNCE_SIZES[ounceSize].labelAr : "ليرة"}
                        </span>
                      </div>
                      <div className="receipt-row">
                        <span>الوزن الإجمالي المقدر</span>
                        <span className="value">{displayWeight.toFixed(2)} غرام</span>
                      </div>
                    </>
                  )}

                  <div className="receipt-total">
                    <span className="label">الإجمالي</span>
                    <span className="total-value">
                      {grandTotal.toLocaleString("ar-JO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                  <div className="input-box">
                    <label htmlFor="planner-budget" className="input-label">الميزانية المرصودة</label>
                    <div className="input-row">
                      <input
                        id="planner-budget"
                        type="number"
                        className="clean-input"
                        value={plannerBudget}
                        onChange={(e) => setPlannerBudget(e.target.value)}
                        placeholder="0"
                        min="10"
                        step="10"
                      />
                      <span className="input-unit">د.أ</span>
                    </div>
                  
                  <div className="pills-row" style={{ marginTop: "16px", marginBottom: 0 }}>
                    {[500, 1000, 2500, 5000].map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`pill-btn-outline ${plannerBudget === b.toString() ? "active" : ""}`}
                        style={plannerBudget === b.toString() ? { background: "var(--brand-light)", color: "var(--brand-primary)", borderColor: "var(--brand-primary)" } : {}}
                        onClick={() => setPlannerBudget(b.toString())}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="input-label" style={{ marginTop: "24px" }}>نمط الاستثمار</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { id: "combo", label: "تشكيلة متوازنة" },
                    { id: "sovereigns", label: "ليرات فقط" },
                    { id: "bars", label: "سبائك فقط" }
                  ].map((pref) => (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => setPlannerPreference(pref.id as typeof plannerPreference)}
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        background: plannerPreference === pref.id ? "var(--brand-light)" : "var(--bg-app)",
                        border: `1px solid ${plannerPreference === pref.id ? "var(--brand-primary)" : "var(--border-subtle)"}`,
                        borderRadius: "var(--radius-sm)",
                        color: plannerPreference === pref.id ? "var(--brand-primary)" : "var(--text-secondary)",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all var(--transition-fast)"
                      }}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>

                <div className="receipt-block" style={{ marginTop: "24px" }}>
                  <div className="input-label" style={{ marginBottom: "16px" }}>الأصول المقترحة</div>
                  
                  {planResult.plan.length > 0 ? (
                    <div>
                      <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border-subtle)" }}>
                        <SavingsDistributionChart plan={planResult.plan} remaining={planResult.remaining} />
                      </div>
                      {planResult.plan.map((item, idx) => (
                        <div key={idx} className="plan-item">
                          <div>
                            <div className="plan-item-title">{item.name}</div>
                            <div className="plan-item-sub">{item.weight.toFixed(1)} غرام</div>
                          </div>
                          <div style={{ textAlign: "left" }}>
                            <div className="plan-item-amount">{item.count}×</div>
                            <div className="plan-item-cost">{item.cost.toFixed(2)} د.أ</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "16px", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
                      المبلغ المرصود لا يكفي لشراء أصغر وحدة ادخار (سبيكة 1 غرام).
                    </div>
                  )}

                  <div className="receipt-total">
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className="label" style={{ fontSize: "0.9rem" }}>إجمالي الميزانية</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>باقي: {planResult.remaining.toFixed(2)} د.أ</span>
                    </div>
                    <span className="total-value">
                      {planResult.budgetNum.toLocaleString("ar-JO")}
                    </span>
                  </div>
                </div>
              </>
            )}
          </section>

            {/* Full Width: Live Chart Box */}
            <section className="minimal-panel col-span-12">
              <div className="panel-heading" style={{ marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <h2 style={{ margin: 0 }}>مؤشرات ومخططات أسعار الذهب</h2>
                <div className="tab-container" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className={`tab-btn ${chartTab === "local" ? "active" : ""}`}
                    onClick={() => setChartTab("local")}
                    style={{ padding: "6px 16px" }}
                  >
                    مؤشر السوق المحلي
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${chartTab === "global" ? "active" : ""}`}
                    onClick={() => setChartTab("global")}
                    style={{ padding: "6px 16px" }}
                  >
                    البورصة العالمية (XAU/USD)
                  </button>
                </div>
              </div>

              {chartTab === "local" ? (
                <HistoricalTrendChart prices={data.prices} />
              ) : (
                <>
                  <div style={{
                    width: "100%",
                    height: "320px",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    border: "1px solid var(--border-subtle)",
                    background: "#FFF"
                  }}>
                    <iframe 
                      src="https://goldbroker.com/widget/live/XAU?currency=USD&amp;height=320" 
                      scrolling="no" 
                      frameBorder="0" 
                      width="100%" 
                      height="320" 
                      style={{ border: "0", overflow: "hidden" }}
                      title="مخطط أسعار الذهب العالمي مباشر"
                    ></iframe>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "16px" }}>
                    سعر أونصة الذهب في الأسواق العالمية بالدولار، المحرك الأساسي لأسعار السوق المحلي الأردني.
                  </p>
                </>
              )}
            </section>

          {/* Full Width: FAQs */}
          <section className="minimal-panel col-span-12">
            <h2 style={{ marginBottom: "24px" }}>دليل المستثمر</h2>
            
            <div>
              {[
                {
                  title: "كيف يتم احتساب أسعار الذهب الرسمية في الأردن؟",
                  body: "تحدد التسعيرة الصادرة عن نقابة الصاغة (نقابة أصحاب محلات الحلي والمجوهرات في الأردن) بناءً على سعر أونصة الذهب عالمياً بالدولار الأمريكي، وسعر صرف الدينار الأردني المربوط بالدولار الأمريكي (المثبت عند 0.709 دينار للدولار)، وتكاليف الدمغة والشحن والاستيراد."
                },
                {
                  title: "ما الفرق بين سعر البيع وسعر الشراء المنشورين؟",
                  body: "سعر البيع هو السعر الرسمي الذي تشتري به قطعة الذهب الجديدة من الصائغ. سعر الشراء هو السعر الرسمي الذي تدفعه محلات الصاغة لك عندما ترغب في بيع ذهبك القديم أو المستعمل لديهم."
                },
                {
                  title: "كيف تُحسب أجور المصنعية في الأردن؟",
                  body: "المصنعية هي الأجرة المضافة مقابل صياغة القطعة وتصميمها. في الأردن، تتراوح أجور المصنعية للذهب عيار 21 تقريباً بين 3.5 إلى 6 دنانير أردنية لكل غرام، وعيار 18 بين 5 إلى 9 دنانير، بينما تتراوح مصنعية السبائك والليرات الاستثمارية بين 1 إلى 2.5 دينار للغرام."
                }
              ].map((faq, index) => (
                <details key={index}>
                  <summary>{faq.title}</summary>
                  <div className="details-content">
                    {faq.body}
                  </div>
                </details>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="app-footer">
        <div className="container">
          <div className="footer-disclaimer">
            <span className="disclaimer-badge">إخلاء مسؤولية قانونية</span>
            <p>
              موقع "أسعار الذهب اليوم في الأردن" هو منصة مستقلة استرشادية، <strong>ولا يمثل الموقع الرسمي لنقابة أصحاب محلات الحلي والمجوهرات في الأردن</strong> أو أي جهة رسمية أخرى. البيانات ومؤشرات الأسعار الواردة في هذا الموقع يتم جمعها وتحديثها آلياً من مصادر البيانات العامة ونشاط الصاغة، وهي معروضة لأغراض إعلامية وتثقيفية فقط. نظرًا للتقلبات المستمرة في الأسواق العالمية والمحلية، قد لا تكون هذه البيانات دقيقة تماماً أو متطابقة مع أسعار الصاغة الفعلية في نفس لحظة تصفحكم للموقع. لا يتحمل الموقع أو مالكوه أو القائمون عليه أي مسؤولية أو تبعات قانونية أو مالية مهما كانت طبيعتها نتيجة لأي قرارات استثمارية، أو تداولات، أو عمليات بيع وشراء يتم اتخاذها بناءً على المعلومات الواردة هنا. تقع كامل المسؤولية في التحقق الفعلي من الأسعار ومصنعية الذهب على عاتق المستخدم من خلال مراجعة محلات الصاغة المعتمدة مباشرة قبل إتمام أي معاملة تجارية.
            </p>
          </div>
          
          <div className="footer-flex" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "20px", marginTop: "20px" }}>
            <div className="footer-text">
              <strong>سعر الذهب — الأردن</strong> — أسعار استرشادية محدثة آلياً من البيانات المنشورة (موقع غير رسمي).
            </div>
            
            <div className="footer-links">
              <a href={`https://api.whatsapp.com/send?text=${encodedShareText}`} target="_blank" rel="noopener noreferrer">واتساب</a>
              <a href={`https://t.me/share/url?url=${encodedShareText ? typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "" : ""}&text=${encodedShareText}`} target="_blank" rel="noopener noreferrer">تليغرام</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
