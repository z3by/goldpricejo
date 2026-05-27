import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أسعار الذهب اليوم في الأردن",
    short_name: "ذهب الأردن",
    description: "تابع أسعار الذهب اليوم في الأردن لحظة بلحظة لجميع العيارات بالدينار الأردني مع حاسبة ذكية الصنع.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#D4A853",
    icons: [
      {
        src: "https://jjsjo.com/site/media/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
