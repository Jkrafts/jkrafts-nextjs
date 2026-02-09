import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://jkrafts.com";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      priority: 1.0,
      changeFrequency: "yearly",
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "yearly",
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "yearly",
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      priority: 0.9,
      changeFrequency: "yearly",
    },
  ];
}
