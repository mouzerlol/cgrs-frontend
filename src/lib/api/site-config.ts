import { SiteConfig } from '@/types';

interface SiteConfigData {
  siteName: string;
  domain: string;
  description: string;
  mission: string;
  values: string[];
  contact: {
    email: string;
    chairperson: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

async function importSiteConfigData(): Promise<SiteConfigData> {
  const data = await import('@/data/site-config.json');
  return data.default as SiteConfigData;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return importSiteConfigData() as Promise<SiteConfig>;
}

export async function getSiteName(): Promise<string> {
  const data = await importSiteConfigData();
  return data.siteName;
}

export async function getValues(): Promise<string[]> {
  const data = await importSiteConfigData();
  return data.values;
}
