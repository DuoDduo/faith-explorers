import { describe, expect, it } from "vitest";
import {
  isEmail,
  validateContact,
  validateLogin,
  validatePostDraft,
  validateRegistration,
} from "@/lib/validation";

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

describe("validatePostDraft", () => {
  const valid = {
    title: "Walking Humbly",
    excerpt: "Practical ways to grow in humility.",
    body: "Hello",
    category: "christian-living",
    tags: "humility, growth",
  };

  it("accepts a complete draft", () => {
    expect(validatePostDraft(valid)).toEqual({});
  });

  it("flags missing and oversized fields", () => {
    expect(
      validatePostDraft({
        title: "Hi",
        excerpt: "short",
        body: "  ",
        category: "",
        tags: "a,b,c,d,e,f,g,h,i",
      }),
    ).toEqual({
      title: "Give your article a title",
      excerpt: "Write a short summary (at least 10 characters)",
      body: "The article is empty",
      category: "Choose a category",
      tags: "Use up to 8 tags",
    });
    expect(validatePostDraft({ ...valid, excerpt: "x".repeat(501) }).excerpt).toBe(
      "Keep the summary under 500 characters",
    );
  });
});
