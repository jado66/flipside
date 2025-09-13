/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://trickipedia.app",
  generateRobotsTxt: true, // Generate robots.txt
  generateIndexSitemap: false, // Disable index sitemap, use custom sitemap.ts
  // Reference custom sitemap in robots.txt
  outDir: "./public", // Output directory

  // Exclude paths that shouldn't be in sitemap
  exclude: ["/api/*", "/admin/*", "/auth/*", "/login/*", "/_*", "/404", "/500"],

  // Additional paths to include (complement your dynamic sitemap.ts)
  additionalPaths: async (config) => {
    return [
      // Add any additional static paths here if needed
    ];
  },

  // Custom robots.txt policies
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/auth/",
          "/login/",
          "/_next/",
          "/_vercel/",
          "/private/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
    ],
    additionalSitemaps: [
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://trickipedia.app"
      }/sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Skip generating sitemap entries since you have a custom sitemap.ts
    // This config is mainly for robots.txt and SEO analysis
    return null;
  },

  // Transform function to modify URLs
  // Use default transform for automatic sitemap generation

  // Change frequency for different path patterns
  changefreq: "daily",
  priority: 0.7,

  // Enable automatic last modification detection
  autoLastmod: true,

  // SEO improvements
  trailingSlash: true, // Match your Next.js config
};
