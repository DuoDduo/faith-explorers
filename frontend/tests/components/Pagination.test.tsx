import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination } from "@/components/ui/Pagination";
import { withQuery } from "@/lib/url";

const hrefFor = (page: number) => withQuery("/articles", { q: "faith", page });

describe("Pagination", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} pages={1} hrefFor={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links every page, keeping filters, and marks the current one", () => {
    render(<Pagination page={2} pages={3} hrefFor={hrefFor} />);
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("href", "/articles?q=faith");
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/articles?q=faith&page=3",
    );
  });

  it("hides previous on the first page and next on the last", () => {
    const { rerender } = render(<Pagination page={1} pages={2} hrefFor={hrefFor} />);
    expect(screen.queryByRole("link", { name: "Previous page" })).toBeNull();
    rerender(<Pagination page={2} pages={2} hrefFor={hrefFor} />);
    expect(screen.queryByRole("link", { name: "Next page" })).toBeNull();
  });
});
