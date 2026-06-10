export interface TechDetectionResult {
  primaryTech: string | null;
  allTech: string[];
  confidence: number;
  signals: string[];
}

interface TechRule {
  name: string;
  checks: Array<{ signal: string; weight: number; test: (html: string) => boolean }>;
}

const RULES: TechRule[] = [
  {
    name: "Shopify",
    checks: [
      { signal: "Found cdn.shopify.com", weight: 40, test: (h) => /cdn\.shopify\.com/i.test(h) },
      { signal: "Found Shopify.theme", weight: 40, test: (h) => /Shopify\.theme/i.test(h) },
      { signal: "Found myshopify.com", weight: 40, test: (h) => /myshopify\.com/i.test(h) },
      { signal: "Found shopify-section", weight: 20, test: (h) => /shopify-section/i.test(h) },
      { signal: "Found /cart link", weight: 20, test: (h) => /\/cart|\/checkout/i.test(h) },
    ],
  },
  {
    name: "WordPress",
    checks: [
      { signal: "Found /wp-content/", weight: 40, test: (h) => /\/wp-content\//i.test(h) },
      { signal: "Found /wp-includes/", weight: 40, test: (h) => /\/wp-includes\//i.test(h) },
      { signal: "Meta generator WordPress", weight: 20, test: (h) => /generator.*WordPress/i.test(h) },
      { signal: "Found /wp-json", weight: 20, test: (h) => /\/wp-json/i.test(h) },
    ],
  },
  {
    name: "WooCommerce",
    checks: [
      { signal: "Found woocommerce", weight: 40, test: (h) => /woocommerce/i.test(h) },
      { signal: "Found wc-cart-fragments", weight: 20, test: (h) => /wc-cart-fragments/i.test(h) },
      { signal: "Found add-to-cart", weight: 20, test: (h) => /add-to-cart/i.test(h) },
    ],
  },
  {
    name: "Wix",
    checks: [
      { signal: "Found wixstatic.com", weight: 40, test: (h) => /wixstatic\.com/i.test(h) },
      { signal: "Found wix.com", weight: 20, test: (h) => /wix\.com/i.test(h) },
      { signal: "Found X-Wix", weight: 20, test: (h) => /X-Wix/i.test(h) },
    ],
  },
  {
    name: "Squarespace",
    checks: [
      { signal: "Found squarespace.com", weight: 40, test: (h) => /squarespace\.com/i.test(h) },
      { signal: "Found static1.squarespace", weight: 40, test: (h) => /static1\.squarespace/i.test(h) },
      { signal: "Found Squarespace", weight: 20, test: (h) => /Squarespace/i.test(h) },
    ],
  },
  {
    name: "Webflow",
    checks: [
      { signal: "Found webflow.js", weight: 40, test: (h) => /webflow\.js/i.test(h) },
      { signal: "Found data-wf-page", weight: 20, test: (h) => /data-wf-page/i.test(h) },
      { signal: "Found webflow.io", weight: 20, test: (h) => /webflow\.io/i.test(h) },
    ],
  },
  {
    name: "React",
    checks: [
      { signal: "Found data-reactroot", weight: 40, test: (h) => /data-reactroot/i.test(h) },
      { signal: "Found react bundle", weight: 20, test: (h) => /react(?:\.production)?\.min\.js|__REACT/i.test(h) },
      { signal: "Found react keyword", weight: 10, test: (h) => /\breact\b/i.test(h) },
    ],
  },
  {
    name: "Next.js",
    checks: [
      { signal: "Found __NEXT_DATA__", weight: 40, test: (h) => /__NEXT_DATA__/i.test(h) },
      { signal: "Found /_next/static/", weight: 40, test: (h) => /\/_next\/static\//i.test(h) },
    ],
  },
  {
    name: "Magento",
    checks: [
      { signal: "Found Magento", weight: 40, test: (h) => /Magento/i.test(h) },
      { signal: "Found /static/frontend/", weight: 20, test: (h) => /\/static\/frontend\//i.test(h) },
      { signal: "Found mage script", weight: 20, test: (h) => /\bmage\b/i.test(h) },
    ],
  },
  {
    name: "BigCommerce",
    checks: [
      { signal: "Found cdn11.bigcommerce.com", weight: 40, test: (h) => /cdn11\.bigcommerce\.com/i.test(h) },
      { signal: "Found stencil-utils", weight: 20, test: (h) => /stencil-utils/i.test(h) },
      { signal: "Found bigcommerce", weight: 20, test: (h) => /bigcommerce/i.test(h) },
    ],
  },
];

export function detectTechFromHtml(html: string): TechDetectionResult {
  const scores: Record<string, { confidence: number; signals: string[] }> = {};

  const hasWordPress = RULES.find((r) => r.name === "WordPress")!.checks.some(
    (c) => c.test(html)
  );

  for (const rule of RULES) {
    if (rule.name === "WooCommerce" && !hasWordPress) continue;

    let confidence = 0;
    const signals: string[] = [];

    for (const check of rule.checks) {
      if (check.test(html)) {
        confidence += check.weight;
        signals.push(check.signal);
      }
    }

    if (confidence > 0) {
      scores[rule.name] = {
        confidence: Math.min(confidence, 100),
        signals,
      };
    }
  }

  const detected = Object.entries(scores).sort((a, b) => b[1].confidence - a[1].confidence);
  const allTech = detected.map(([name]) => name);
  const primary = detected[0];

  return {
    primaryTech: primary?.[0] ?? null,
    allTech,
    confidence: primary?.[1].confidence ?? 0,
    signals: primary?.[1].signals ?? [],
  };
}

export async function detectTechStack(url: string): Promise<TechDetectionResult> {
  const { assertSafeUrl } = await import("@/lib/crawler/ssrf");
  const axios = (await import("axios")).default;

  try {
    const safeUrl = await assertSafeUrl(url);
    const res = await axios.get(safeUrl.toString(), {
      timeout: 10000,
      maxRedirects: 3,
      headers: { Accept: "text/html" },
    });
    const html = typeof res.data === "string" ? res.data : "";
    return detectTechFromHtml(html);
  } catch {
    return {
      primaryTech: null,
      allTech: [],
      confidence: 0,
      signals: ["Tech detection failed"],
    };
  }
}
