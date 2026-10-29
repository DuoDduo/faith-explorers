import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas have nothing for search engines.
      disallow: ["/admin", "/dashboard", "/account", "/login", "/register", "/reset-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
