import { describe, it, expect } from "vitest";
import { getInstitutes, fetchInstituteDisciplines } from "../src/scrape/institutes.js";

describe("getInstitutes", () => {
  it("returns a non-empty array", () => {
    const institutes = getInstitutes();
    expect(institutes.length).toBeGreaterThan(0);
  });

  it("returns objects with correct shape", () => {
    const institutes = getInstitutes();
    const inst = institutes[0];
    expect(typeof inst.code).toBe("string");
    expect(typeof inst.name).toBe("string");
    expect(typeof inst.campus).toBe("string");
    expect(typeof inst.abbr).toBe("string");
  });

  it("all codes are unique", () => {
    const institutes = getInstitutes();
    const codes = institutes.map((i) => i.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("all fields are strings (no null/undefined)", () => {
    const institutes = getInstitutes();
    for (const inst of institutes) {
      expect(inst.code).toBeTruthy();
      expect(inst.name).toBeTruthy();
      expect(typeof inst.campus).toBe("string");
      expect(typeof inst.abbr).toBe("string");
    }
  });

  it("can find institute by code", () => {
    const institutes = getInstitutes();
    const poli = institutes.find((i) => i.code === "3");
    expect(poli).toBeDefined();
    expect(poli!.name).toContain("Politécnica");
  });

  it("can find institute by abbreviation", () => {
    const institutes = getInstitutes();
    const byAbbr = institutes.filter((i) => i.abbr.length > 0);
    expect(byAbbr.length).toBeGreaterThan(0);
  });

  it("is deterministic (same result on repeated calls)", () => {
    const a = getInstitutes();
    const b = getInstitutes();
    expect(a.length).toBe(b.length);
    expect(a[0].code).toBe(b[0].code);
  });
});

describe("fetchInstituteDisciplines", () => {
  it("returns discipline codes for a real institute", async () => {
    const institutes = getInstitutes();
    const codes = await fetchInstituteDisciplines(institutes[0].code);
    expect(Array.isArray(codes)).toBe(true);
    expect(codes.length).toBeGreaterThan(0);
    expect(typeof codes[0]).toBe("string");
  });

  it("returns unique codes", async () => {
    const institutes = getInstitutes();
    const codes = await fetchInstituteDisciplines(institutes[0].code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("codes are non-empty strings", async () => {
    const institutes = getInstitutes();
    const codes = await fetchInstituteDisciplines(institutes[0].code);
    for (const code of codes) {
      expect(code.length).toBeGreaterThan(0);
    }
  });

  it("handles a different institute", async () => {
    const institutes = getInstitutes();
    // Use the second institute to test variety
    const codes = await fetchInstituteDisciplines(institutes[1].code);
    expect(Array.isArray(codes)).toBe(true);
  });
});
