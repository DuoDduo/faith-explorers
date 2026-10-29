import { describe, expect, it } from "vitest";
import { firstParam, pageParam, withQuery } from "@/lib/url";

describe("withQuery", () => {
  it("drops empty values and page 1", () => {
    expect(withQuery("/articles", { q: "", tag: undefined, page: 1 })).toBe("/articles");
  });

  it("keeps filters alongside the page", () => {
    expect(withQuery("/articles", { q: "faith", page: 3 })).toBe("/articles?q=faith&page=3");
  });
});

describe("pageParam", () => {
  it.each([
    [undefined, 1],
    ["2", 2],
    ["0", 1],
    ["-4", 1],
    ["abc", 1],
    ["1.5", 1],
    [["3", "4"], 3],
  ])("parses %j as %i", (input, expected) => {
    expect(pageParam(input)).toBe(expected);
  });
});

describe("firstParam", () => {
  it("returns the first of repeated params", () => {
    expect(firstParam(["a", "b"])).toBe("a");
    expect(firstParam("a")).toBe("a");
    expect(firstParam(undefined)).toBeUndefined();
  });
});
