import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/actions/engagement", () => ({ setLiked: vi.fn(), setBookmarked: vi.fn() }));
const { applyChange } = await import("@/components/posts/EngagementButtons");

const base = { like_count: 3, liked: false, bookmarked: false };

describe("applyChange", () => {
  it("likes and unlikes, adjusting the count", () => {
    const liked = applyChange(base, { kind: "like", on: true });
    expect(liked).toEqual({ like_count: 4, liked: true, bookmarked: false });
    expect(applyChange(liked, { kind: "like", on: false })).toEqual(base);
  });

  it("ignores a repeated like", () => {
    const liked = applyChange(base, { kind: "like", on: true });
    expect(applyChange(liked, { kind: "like", on: true })).toBe(liked);
  });

  it("toggles bookmarks without touching likes", () => {
    expect(applyChange(base, { kind: "bookmark", on: true })).toEqual({
      ...base,
      bookmarked: true,
    });
  });
});
