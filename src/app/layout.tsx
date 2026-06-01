import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F8FAFC",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "أسعار الذهب اليوم في الأردن | تحديث مباشر وفقاً لنشرة الصاغة (غير رسمي)",
  description: "تابع أسعار الذهب اليوم في الأردن لحظة بلحظة لجميع العيارات (24، 21، 18، 14). حاسبة ذهب تفاعلية ذكية للبيع والشراء، مخططات بيانية مباشرة، وأسعار استرشادية غير رسمية.",
  keywords: [
    "سعر الذهب اليوم في الأردن",
    "أسعار الذهب في الأردن",
    "ذهب عيار 21 اليوم",
    "نقابة أصحاب محلات الصاغة الأردنية",
    "سعر غرام الذهب الأردن",
    "حاسبة أسعار الذهب",
    "سعر بيع الذهب الأردن",
    "شراء الذهب المستعمل الأردن",
    "سعر الذهب الآن",
    "سعر الليرة الذهب في الأردن",
    "غير رسمي"
  ],
  authors: [{ name: "مؤشر أسعار الذهب في الأردن (غير رسمي)" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: "https://goldpricejordan.online",
    title: "أسعار الذهب اليوم في الأردن | تحديث مباشر (مؤشر غير رسمي)",
    description: "تغطية شاملة ومباشرة لأسعار الذهب في الأردن اليوم للبيع والشراء لعيارات 24، 21، 18، 14 وفق تسعيرة الصاغة (موقع استرشادي غير رسمي) مع حاسبة ذكية.",
    siteName: "سعر الذهب اليوم في الأردن (غير رسمي)",
    images: [
      {
        url: "https://jjsjo.com/site/media/logo.png", // Fallback to official logo or brand asset
        width: 800,
        height: 600,
        alt: "أسعار الذهب في الأردن اليوم"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "أسعار الذهب اليوم في الأردن | تحديث مباشر (مؤشر غير رسمي)",
    description: "أسعار الذهب في الأردن لحظة بلحظة لعيارات 24، 21، 18، 14 مع حاسبة شراء وبيع استرشادية غير رسمية.",
    images: ["https://jjsjo.com/site/media/logo.png"]
  },
  alternates: {
    canonical: "https://goldpricejordan.online"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.className} ${cairo.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="https://jjsjo.com/site/media/logo.png" type="image/png" />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Google AdSense Auto Ads */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
