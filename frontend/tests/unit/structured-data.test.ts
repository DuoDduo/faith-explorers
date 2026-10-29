import { describe, expect, it } from "vitest";
import { articleJsonLd, jsonLdScript } from "@/lib/structured-data";
import type { PostDetail } from "@/types/api";

const post: PostDetail = {
  id: 1,
  slug: "walking-in-faith",
  title: "Walking in faith",
  excerpt: "A short summary.",
  body: "Body",
  cover_url: null,
  featured: false,
  read_time: 4,
  views: 0,
  like_count: 0,
  published_at: "2026-01-02T10:00:00Z",
  author: { id: 7, name: "Pastor Flo", avatar_url: null, bio: null },
  category: { name: "Faith", slug: "faith" },
  tags: [{ name: "Hope", slug: "hope" }],
};

describe("articleJsonLd", () => {
  it("describes the article with absolute URLs", () => {
    const data = articleJsonLd(post, "/images/cover.jpg");
    expect(data).toMatchObject({
      "@type": "BlogPosting",
      headline: "Walking in faith",
      datePublished: "2026-01-02T10:00:00Z",
      keywords: "Hope",
      author: { name: "Pastor Flo", url: "http://localhost:3000/authors/7" },
    });
    expect(data.image).toEqual(["http://localhost:3000/images/cover.jpg"]);
  });

  it("keeps uploaded cover URLs that are already absolute", () => {
    const data = articleJsonLd({ ...post, cover_url: "https://cdn.example.com/c.jpg" }, "/x.jpg");
    expect(data.image).toEqual(["https://cdn.example.com/c.jpg"]);
  });
});

describe("jsonLdScript", () => {
  it("escapes < so content can't close the script tag", () => {
    const out = jsonLdScript({ headline: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).headline).toBe("</script><script>alert(1)</script>");
  });
});
