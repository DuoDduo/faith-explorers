import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
const { AdminButton } = await import("@/components/admin/AdminButton");

describe("AdminButton", () => {
  it("refreshes the page after a successful action", async () => {
    const action = vi.fn().mockResolvedValue({});
    render(<AdminButton action={action}>Publish</AdminButton>);
    await userEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(action).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the API's reason when the action is refused", async () => {
    refresh.mockClear();
    const action = vi.fn().mockResolvedValue({ error: "You can't remove your own admin access" });
    render(<AdminButton action={action}>Demote</AdminButton>);
    await userEvent.click(screen.getByRole("button", { name: "Demote" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("own admin access");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("does nothing when the confirmation is cancelled", async () => {
    const action = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <AdminButton action={action} confirm="Sure?">
        Delete
      </AdminButton>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(action).not.toHaveBeenCalled();
  });
});
