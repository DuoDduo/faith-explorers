import { describe, expect, it } from "vitest";
import { formatDate, pluralize } from "@/lib/format";

describe("formatDate", () => {
  it("formats ISO dates in UTC", () => {
    expect(formatDate("2023-08-23T23:30:00Z")).toBe("23 August 2023");
  });

  it("returns an empty string for missing dates", () => {
    expect(formatDate(null)).toBe("");
  });
});

describe("pluralize", () => {
  it("picks singular or plural", () => {
    expect(pluralize(1, "article")).toBe("1 article");
    expect(pluralize(5, "article")).toBe("5 articles");
  });
});
