import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://thecuriousclassroom.vercel.app",
      lastModified: new Date(),
    },
  ];
}