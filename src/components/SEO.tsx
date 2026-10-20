import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  schema?: Record<string, any>;
}

export function SEO({
  title,
  description,
  canonical,
  ogImage = 'https://maison-arome.ru/favicon-512.png',
  ogType = 'website',
  schema,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title
      ? (title.includes('Maison Arôme') ? title : `${title} | Maison Arôme`)
      : 'Maison Arôme — Оригинальная парфюмерия и распивы от 1 мл';
    document.title = fullTitle;

    const defaultDesc =
      'Интернет-магазин оригинальной парфюмерии Maison Arôme. Распивы от 1 мл и целые флаконы. 100% подлинность, честные цены, быстрая доставка по всей России.';
    const metaDesc = description || defaultDesc;

    // Update meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', metaDesc);

    // OpenGraph tags
    const setMeta = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('og:title', fullTitle);
    setMeta('og:description', metaDesc);
    setMeta('og:type', ogType);
    setMeta('og:image', ogImage.startsWith('http') ? ogImage : `https://maison-arome.ru${ogImage}`);
    setMeta('og:url', canonical || window.location.href);

    // Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonical || window.location.href.split('?')[0]);

    // JSON-LD Structured Data (Schema.org)
    let scriptTag = document.getElementById('schema-json-ld');
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'schema-json-ld';
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, canonical, ogImage, ogType, schema]);

  return null;
}
