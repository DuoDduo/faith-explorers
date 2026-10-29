import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/forms/ContactForm";
import type { FormState } from "@/lib/actions/form-state";

const submitContact = vi.fn<(prev: FormState, data: FormData) => Promise<FormState>>();
vi.mock("@/lib/actions/contact", () => ({
  submitContact: (prev: FormState, data: FormData) => submitContact(prev, data),
}));

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText("Name:"), "Ada");
  await userEvent.type(screen.getByLabelText("Email:"), "ada@example");
  await userEvent.type(screen.getByLabelText("Message:"), "Hello");
  await userEvent.click(screen.getByRole("button", { name: "Send Message" }));
}

describe("ContactForm", () => {
  it("shows field errors and keeps what was typed", async () => {
    submitContact.mockResolvedValueOnce({
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: { email: "Invalid email address" },
      values: { name: "Ada", email: "ada@example", message: "Hello" },
    });
    render(<ContactForm />);
    await fillAndSubmit();

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Email:")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Name:")).toHaveValue("Ada");
    const sent = submitContact.mock.calls[0][1];
    expect(Object.fromEntries(sent)).toEqual({
      name: "Ada",
      email: "ada@example",
      message: "Hello",
    });
  });

  it("shows the server's confirmation on success", async () => {
    submitContact.mockResolvedValueOnce({ status: "success", message: "Thanks!" });
    render(<ContactForm />);
    await fillAndSubmit();
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks!");
  });
});
