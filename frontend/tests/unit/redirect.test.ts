import { describe, expect, it } from "vitest";
import { loginHref, safeNextPath } from "@/lib/auth/redirect";

describe("safeNextPath", () => {
  it("allows paths on this site", () => {
    expect(safeNextPath("/articles/faith?page=2")).toBe("/articles/faith?page=2");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "articles", null, 42])(
    "rejects %j",
    (value) => {
      expect(safeNextPath(value)).toBe("/");
    },
  );
});

describe("loginHref", () => {
  it("encodes where to return to", () => {
    expect(loginHref("/articles/a?b=1")).toBe("/login?next=%2Farticles%2Fa%3Fb%3D1");
    expect(loginHref()).toBe("/login");
  });
});
