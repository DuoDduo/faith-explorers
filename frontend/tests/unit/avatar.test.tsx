import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, initials } from "@/components/ui/Avatar";

describe("initials", () => {
  it("uses the first and last name", () => {
    expect(initials("Grace Okafor")).toBe("GO");
    expect(initials("  Mary  Jane Watson ")).toBe("MW");
    expect(initials("ada")).toBe("A");
  });
});

describe("Avatar", () => {
  it("falls back to initials without a photo", () => {
    render(<Avatar src={null} name="Grace Okafor" />);
    expect(screen.getByText("GO")).toBeInTheDocument();
  });
});
