import { describe, expect, it } from "vitest";
import { isEmail, validateContact, validateLogin, validateRegistration } from "@/lib/validation";

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

describe("validateRegistration", () => {
  it("requires a name, valid email and 8+ character password", () => {
    expect(validateRegistration({ name: "", email: "x", password: "short" })).toEqual({
      name: "Name is required",
      email: "Invalid email address",
      password: "Use at least 8 characters",
    });
    expect(
      validateRegistration({ name: "Ada", email: "ada@example.com", password: "long enough" }),
    ).toEqual({});
  });
});

describe("validateLogin", () => {
  it("only checks the fields are filled in sensibly", () => {
    expect(validateLogin({ email: "ada@example.com", password: "x" })).toEqual({});
    expect(Object.keys(validateLogin({ email: "", password: "" }))).toEqual(["email", "password"]);
  });
});
