import { fetchGoldPrices } from "./actions";
import Dashboard from "./components/Dashboard";

// Enable background Incremental Static Regeneration (ISR)
// Rebuilds the page in the background at most every 5 minutes (300 seconds) on Netlify
export const revalidate = 300;

export default async function Home() {
  // Fetch initial pricing data server-side
  const initialData = await fetchGoldPrices();

  const p24 = initialData.prices.find((p) => p.karat === "24K") || { sell: 0, buy: 0 };
  const p21 = initialData.prices.find((p) => p.karat === "21K") || { sell: 0, buy: 0 };
  const p18 = initialData.prices.find((p) => p.karat === "18K") || { sell: 0, buy: 0 };

  const updatedDesc = `تابع أسعار الذهب اليوم في الأردن لحظة بلحظة لجميع العيارات (24، 21، 18، 14). أسعار السوق الحالية: عيار 24 بيع ${p24.sell.toFixed(2)} د.أ، عيار 21 بيع ${p21.sell.toFixed(2)} د.أ، عيار 18 بيع ${p18.sell.toFixed(2)} د.أ. حاسبة ذهب تفاعلية ذكية للبيع والشراء وأسعار الصاغة الرسمية.`;

  // Structured Data (JSON-LD) for Search Engines (SEO)
  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "أسعار الذهب اليوم في الأردن | تحديث مباشر",
    "description": updatedDesc,
    "publisher": {
      "@type": "Organization",
      "name": "ذهب الأردن للخدمات المالية",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jjsjo.com/site/media/logo.png"
      }
    }
  };

  // Structured Data for the Financial Dataset
  const jsonLdDataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "نشرة أسعار الذهب اليومية في الأردن",
    "description": `نشرة أسعار بيع وشراء الذهب اليومية لعيارات 24، 21، 18، 14 الصادرة عن نقابة أصحاب محلات الحلي والمجوهرات في الأردن. أسعار الصاغة الحالية: عيار 24 (بيع ${p24.sell.toFixed(2)} / شراء ${p24.buy.toFixed(2)})، عيار 21 (بيع ${p21.sell.toFixed(2)} / شراء ${p21.buy.toFixed(2)})، عيار 18 (بيع ${p18.sell.toFixed(2)} / شراء ${p18.buy.toFixed(2)}).`,
    "url": "https://goldpricejordan.online",
    "isAccessibleForFree": true,
    "creator": {
      "@type": "Organization",
      "name": "نقابة الصاغة الأردنية",
      "url": "https://jjsjo.com"
    },
    "variableMeasured": [
      `سعر غرام الذهب عيار 24 في الأردن - بيع ${p24.sell.toFixed(2)} د.أ`,
      `سعر غرام الذهب عيار 21 في الأردن - بيع ${p21.sell.toFixed(2)} د.أ`,
      `سعر غرام الذهب عيار 18 في الأردن - بيع ${p18.sell.toFixed(2)} د.أ`,
      "سعر غرام الذهب عيار 14 في الأردن"
    ]
  };

  // Structured Data for FAQs
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "كيف يتم احتساب أسعار الذهب الرسمية في الأردن؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "تحدد التسعيرة الصادرة عن نقابة الصاغة (نقابة أصحاب محلات الحلي والمجوهرات في الأردن) بناءً على سعر أونصة الذهب عالمياً بالدولار الأمريكي، وسعر صرف الدينار الأردني المربوط بالدولار الأمريكي (المثبت عند 0.709 دينار للدولار)، وتكاليف الدمغة والشحن والاستيراد."
        }
      },
      {
        "@type": "Question",
        "name": "ما الفرق بين سعر البيع وسعر الشراء المنشورين؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "سعر البيع هو السعر الرسمي الذي تشتري به قطعة الذهب الجديدة من الصائغ. سعر الشراء هو السعر الرسمي الذي تدفعه محلات الصاغة لك عندما ترغب في بيع ذهبك القديم أو المستعمل لديهم."
        }
      },
      {
        "@type": "Question",
        "name": "كيف تُحسب أجور المصنعية في الأردن؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "المصنعية هي الأجرة المضافة مقابل صياغة القطعة وتصميمها. في الأردن، تتراوح أجور المصنعية للذهب عيار 21 تقريباً بين 3.5 إلى 6 دنانير أردنية لكل غرام، وعيار 18 بين 5 إلى 9 دنانير، بينما تتراوح مصنعية السبائك والليرات الاستثمارية بين 1 إلى 2.5 دينار للغرام."
        }
      }
    ]
  };

  return (
    <>
      {/* Inject JSON-LD Schema scripts for search engine indexing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdDataset).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq).replace(/</g, '\\u003c') }}
      />

      <Dashboard initialData={initialData} />
    </>
  );
}
