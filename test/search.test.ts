import { describe, it, expect } from "vitest";
import { searchDisciplines, searchByCode } from "../src/scrape/search.js";

describe("searchDisciplines", () => {
  it("returns hits for a specific query", async () => {
    const results = await searchDisciplines("calculo");
    expect(results.tooMany).toBe(false);
    expect(results.hits.length).toBeGreaterThan(0);
    expect(typeof results.hits[0].code).toBe("string");
    expect(typeof results.hits[0].name).toBe("string");
  });

  it("returns tooMany for a short query", async () => {
    const results = await searchDisciplines("cal");
    expect(results.tooMany).toBe(true);
    expect(results.hits.length).toBe(0);
  });

  it("handles accented queries", async () => {
    const results = await searchDisciplines("cálculo");
    expect(results.tooMany).toBe(false);
    expect(results.hits.length).toBeGreaterThan(0);
  });

  it("returns empty for an empty query", async () => {
    const results = await searchDisciplines("");
    expect(results.hits.length).toBe(0);
  });

  it("includes institute when full: true", async () => {
    const results = await searchDisciplines("calculo", { full: true });
    expect(results.tooMany).toBe(false);
    expect(results.hits.length).toBeGreaterThan(0);
    const first = results.hits[0];
    expect(typeof first.institute).toBe("string");
    expect(first.institute?.length).toBeGreaterThan(0);
  });

  it("full: true returns same hit count as without full", async () => {
    const basic = await searchDisciplines("calculo");
    const full = await searchDisciplines("calculo", { full: true });
    expect(full.hits.length).toBe(basic.hits.length);
  });

  it("full: true populates institute for all hits", async () => {
    const results = await searchDisciplines("calculo", { full: true });
    for (const hit of results.hits) {
      expect(typeof hit.institute).toBe("string");
      expect(hit.institute?.length).toBeGreaterThan(0);
    }
  });

  it("full: false does not include institute", async () => {
    const results = await searchDisciplines("calculo", { full: false });
    for (const hit of results.hits) {
      expect(hit.institute).toBeUndefined();
    }
  });

  it("full: true with tooMany returns empty hits", async () => {
    const results = await searchDisciplines("cal", { full: true });
    expect(results.tooMany).toBe(true);
    expect(results.hits.length).toBe(0);
  });

  it("accents are normalized (calculo == cálculo)", async () => {
    const a = await searchDisciplines("calculo");
    const b = await searchDisciplines("cálculo");
    expect(a.hits.length).toBe(b.hits.length);
  });

  it("hit codes are non-empty", async () => {
    const results = await searchDisciplines("calculo");
    for (const hit of results.hits) {
      expect(hit.code.length).toBeGreaterThan(0);
    }
  });

  it("hit names are non-empty", async () => {
    const results = await searchDisciplines("calculo");
    for (const hit of results.hits) {
      expect(hit.name.length).toBeGreaterThan(0);
    }
  });
});

describe("searchByCode", () => {
  it("returns full discipline data for an exact code", async () => {
    const data = await searchByCode("PRO3510");
    expect(data.code).toBe("PRO3510");
    expect(typeof data.name).toBe("string");
    expect(typeof data.institute).toBe("string");
    expect(typeof data.department).toBe("string");
    expect(data.institute.length).toBeGreaterThan(0);
  });

  it("uppercases the code", async () => {
    const data = await searchByCode("pro3510");
    expect(data.code).toBe("PRO3510");
  });

  it("returns sections with data", async () => {
    const data = await searchByCode("PRO3510");
    const sectionKeys = Object.keys(data.sections);
    expect(sectionKeys.length).toBeGreaterThan(0);
  });

  it("returns empty requirements and offerings (lightweight)", async () => {
    const data = await searchByCode("PRO3510");
    expect(data.requirements).toEqual({});
    expect(data.offerings).toEqual([]);
    expect(data.idealPeriod).toEqual({});
  });

  it("is deterministic (same code returns same data)", async () => {
    const a = await searchByCode("PRO3510");
    const b = await searchByCode("PRO3510");
    expect(a.name).toBe(b.name);
    expect(a.institute).toBe(b.institute);
  });

  it("returns englishName field", async () => {
    const data = await searchByCode("PRO3510");
    expect(typeof data.englishName).toBe("string");
  });
});
