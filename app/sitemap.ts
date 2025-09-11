import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://trickipedia.app/";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contribute`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/skill-trees`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    // Fetch all categories for dynamic routes
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`, {
      headers: {
        "User-Agent": "Sitemap Generator",
      },
    });

    if (!categoriesResponse.ok) {
      console.warn("Failed to fetch categories for sitemap");
      return staticRoutes;
    }

    const categories = await categoriesResponse.json();

    // Generate category routes
    const categoryRoutes: MetadataRoute.Sitemap = categories.map(
      (category: any) => ({
        url: `${baseUrl}/${category.slug}`,
        lastModified: new Date(category.updated_at || category.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })
    );

    // Generate subcategory routes
    const subcategoryRoutes: MetadataRoute.Sitemap = [];
    for (const category of categories) {
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          subcategoryRoutes.push({
            url: `${baseUrl}/${category.slug}/${subcategory.slug}`,
            lastModified: new Date(
              subcategory.updated_at || subcategory.created_at
            ),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          });
        }
      }
    }

    // Fetch tricks for individual trick pages
    const tricksResponse = await fetch(`${baseUrl}/api/tricks?limit=1000`, {
      headers: {
        "User-Agent": "Sitemap Generator",
      },
    });

    let trickRoutes: MetadataRoute.Sitemap = [];
    if (tricksResponse.ok) {
      const tricks = await tricksResponse.json();
      trickRoutes = tricks.map((trick: any) => ({
        url: `${baseUrl}/${trick.category_slug}/${trick.subcategory_slug}/${trick.slug}`,
        lastModified: new Date(trick.updated_at || trick.created_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }

    return [
      ...staticRoutes,
      ...categoryRoutes,
      ...subcategoryRoutes,
      ...trickRoutes,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
