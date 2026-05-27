import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://goldpricejo.netlify.app",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
  ];
}
