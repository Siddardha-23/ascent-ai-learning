import { describe, it, expect } from "vitest";
import {
  normalizeProfileId,
  isValidProfileId,
  profileLabel,
} from "@/lib/progress/schema";

describe("profile id normalization + retrofit", () => {
  it("maps name variants of the original users to their existing ids", () => {
    for (const v of ["Harshith", "harshith", " Harshith ", "HARSHITH"]) {
      expect(normalizeProfileId(v)).toBe("harshith");
    }
    for (const v of ["Aparna", "aparna", "  aparna"]) {
      expect(normalizeProfileId(v)).toBe("aparna");
    }
  });

  it("slugifies arbitrary names safely", () => {
    expect(normalizeProfileId("John Doe")).toBe("john-doe");
    expect(normalizeProfileId("Jane_Smith")).toBe("jane-smith");
    expect(normalizeProfileId("a/b/c")).toBe("abc"); // no path chars
    expect(normalizeProfileId("  ")).toBe("");
    expect(normalizeProfileId("!!!")).toBe("");
  });

  it("validates ids as safe slugs", () => {
    expect(isValidProfileId("harshith")).toBe(true);
    expect(isValidProfileId("john-doe")).toBe(true);
    expect(isValidProfileId("")).toBe(false);
    expect(isValidProfileId("-bad")).toBe(false);
    expect(isValidProfileId("bad/path")).toBe(false);
    expect(isValidProfileId("../etc")).toBe(false);
  });

  it("labels ids nicely, preferring an explicit display name", () => {
    expect(profileLabel("harshith")).toBe("Harshith");
    expect(profileLabel("aparna")).toBe("Aparna");
    expect(profileLabel("john-doe")).toBe("John Doe");
    expect(profileLabel("john-doe", "John D.")).toBe("John D.");
  });
});
