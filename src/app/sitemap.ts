import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://goldpricejordan.online",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
  ];
}
