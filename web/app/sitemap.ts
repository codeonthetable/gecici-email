import { MetadataRoute } from 'next';
import { USE_CASES } from '../lib/use-cases';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gecici.email';
  const lastModified = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ai-ajanlar`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/api-dokuman`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sss`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gizlilik-ve-guvenlik`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const useCaseRoutes: MetadataRoute.Sitemap = Object.keys(USE_CASES).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...coreRoutes, ...useCaseRoutes];
}
