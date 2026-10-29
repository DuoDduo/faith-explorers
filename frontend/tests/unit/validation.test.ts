import { describe, expect, it } from "vitest";
import { isEmail, validateContact } from "@/lib/validation";

describe("validateContact", () => {
  it("accepts a complete message", () => {
    expect(validateContact({ name: "Ada", email: "ada@example.com", message: "Hi" })).toEqual({});
  });

  it("reports every invalid field", () => {
    expect(validateContact({ name: " ", email: "nope", message: "" })).toEqual({
      name: "Name is required",
      email: "Invalid email address",
      message: "Message is required",
    });
  });
});

describe("isEmail", () => {
  it("needs a local part, @ and a dotted domain", () => {
    expect(isEmail("a@b.co")).toBe(true);
    expect(isEmail("a@b")).toBe(false);
    expect(isEmail("a b@c.com")).toBe(false);
  });
});
