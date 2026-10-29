import { describe, expect, it } from "vitest";
import { escapeXml } from "@/lib/xml";

describe("escapeXml", () => {
  it("escapes the five XML special characters", () => {
    expect(escapeXml(`God's <plan> & "you"`)).toBe("God&apos;s &lt;plan&gt; &amp; &quot;you&quot;");
  });
});
