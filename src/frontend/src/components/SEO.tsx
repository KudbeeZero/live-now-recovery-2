import { Helmet } from "react-helmet-async";

const DEFAULT_OG_IMAGE =
  "https://live-now-recovery-3f2.caffeine.xyz/assets/generated/og-image.dim_1200x630.png";
const SITE_URL = "https://live-now-recovery-3f2.caffeine.xyz";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  jsonLd?: object | object[];
}

export function SEO({
  title,
  description,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonical,
  jsonLd,
}: SEOProps) {
  const canonicalUrl = canonical
    ? `${SITE_URL}${canonical}`
    : typeof window !== "undefined"
      ? window.location.href
      : SITE_URL;

  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Live Now Recovery" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* Canonical */}
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      {/* JSON-LD structured data rendered outside Helmet to avoid nesting issues */}
      {schemas.map((schema) => (
        <script
          key={JSON.stringify(schema).slice(0, 64)}
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
