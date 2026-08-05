import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsArticle } from '@/types';
import ArticleContent from '@/components/blog/ArticleContent';
import newsData from '@/data/news.json';
import { getBreadcrumbsJsonLd } from '@/lib/breadcrumbs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const articles = newsData.articles as NewsArticle[];
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return { title: 'Article Not Found | Coronation Gardens' };
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: article.title },
  ];

  const description =
    article.excerpt.length > 160 ? article.excerpt.slice(0, 157) + '...' : article.excerpt;
  const ogImage = {
    url: `/api/og/news?slug=${article.slug}`,
    width: 1200,
    height: 630,
    alt: `${article.title}, on the Coronation Gardens community noticeboard.`,
  };

  return {
    title: `${article.title} | Coronation Gardens`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [ogImage.url],
    },
    other: {
      'script[type="application/ld+json"]': JSON.stringify(getBreadcrumbsJsonLd(breadcrumbs)),
    },
  };
}

export async function generateStaticParams() {
  const articles = newsData.articles as NewsArticle[];
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const articles = newsData.articles as NewsArticle[];
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = articles
    .filter((a) => a.id !== article.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return <ArticleContent article={article} relatedArticles={relatedArticles} />;
}
