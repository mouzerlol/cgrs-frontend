export interface CommitteeMember {
  name: string;
  role: string;
  email?: string;
  bio: string;
  image: string;
}

export interface Committee {
  chairperson: CommitteeMember;
  members: CommitteeMember[];
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: 'general' | 'guidelines' | 'events' | 'maintenance' | 'policy';
  image: string;
  featured: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  rsvp: boolean;
  featured: boolean;
  image?: string;
}

export interface SiteConfig {
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

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
