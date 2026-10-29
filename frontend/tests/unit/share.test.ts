import { describe, expect, it } from "vitest";
import { shareLinks } from "@/lib/share";

describe("shareLinks", () => {
  const links = shareLinks("https://example.com/articles/a&b", "Faith & Hope");
  const href = (network: string) => links.find((link) => link.network === network)?.href;

  it("encodes the URL and title", () => {
    expect(href("facebook")).toBe(
      "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2Farticles%2Fa%26b",
    );
    expect(href("x")).toContain("&text=Faith%20%26%20Hope");
    expect(href("email")).toBe(
      "mailto:?subject=Faith%20%26%20Hope&body=https%3A%2F%2Fexample.com%2Farticles%2Fa%26b",
    );
  });

  it("puts the title and link in one WhatsApp message", () => {
    expect(href("whatsapp")).toBe(
      "https://wa.me/?text=Faith%20%26%20Hope%20https%3A%2F%2Fexample.com%2Farticles%2Fa%26b",
    );
  });
});
