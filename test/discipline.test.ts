import { describe, it, expect } from "vitest";
import { fetchDiscipline, hasOfferings } from "../src/scrape/discipline.js";
import { getInstitutes, fetchInstituteDisciplines } from "../src/scrape/institutes.js";

describe("fetchDiscipline", () => {
  it("returns discipline data with correct shape", async () => {
    const institutes = getInstitutes();
    const codes = await fetchInstituteDisciplines(institutes[0].code);
    const data = await fetchDiscipline(codes[0]);

    expect(data.code).toBe(codes[0].toUpperCase());
    expect(typeof data.name).toBe("string");
    expect(typeof data.department).toBe("string");
    expect(typeof data.institute).toBe("string");
    expect(typeof data.englishName).toBe("string");
    expect(Array.isArray(data.offerings)).toBe(true);
    expect(typeof data.requirements).toBe("object");
    expect(typeof data.idealPeriod).toBe("object");
    expect(typeof data.sections).toBe("object");
  });

  it("uppercases the code", async () => {
    const institutes = getInstitutes();
    const codes = await fetchInstituteDisciplines(institutes[0].code);
    const data = await fetchDiscipline(codes[0].toLowerCase());
    expect(data.code).toBe(codes[0].toUpperCase());
  });

  it("returns name and department for a known discipline", async () => {
    const data = await fetchDiscipline("PRO3510");
    expect(data.name.length).toBeGreaterThan(0);
    expect(data.department.length).toBeGreaterThan(0);
    expect(data.institute.length).toBeGreaterThan(0);
  });

  it("sections contain structured data", async () => {
    const data = await fetchDiscipline("PRO3510");
    const sectionKeys = Object.keys(data.sections);
    expect(sectionKeys.length).toBeGreaterThan(0);
  });

  it("offerings have correct shape when present", async () => {
    const data = await fetchDiscipline("PRO3510");
    for (const offering of data.offerings) {
      expect(typeof offering.code).toBe("string");
      expect(typeof offering.startDate).toBe("string");
      expect(typeof offering.endDate).toBe("string");
      expect(typeof offering.classType).toBe("string");
      expect(typeof offering.disciplineCode).toBe("string");
      expect(Array.isArray(offering.schedules)).toBe(true);
      expect(typeof offering.seats).toBe("object");

      for (const schedule of offering.schedules) {
        expect(typeof schedule.day).toBe("string");
        expect(typeof schedule.startTime).toBe("string");
        expect(typeof schedule.endTime).toBe("string");
        expect(typeof schedule.instructor).toBe("string");
      }
    }
  });

  it("requirements have correct shape when present", async () => {
    const data = await fetchDiscipline("PRO3510");
    for (const [_course, alternatives] of Object.entries(data.requirements)) {
      expect(Array.isArray(alternatives)).toBe(true);
      for (const alt of alternatives) {
        expect(Array.isArray(alt)).toBe(true);
        for (const req of alt) {
          expect(typeof req.code).toBe("string");
          expect(typeof req.type).toBe("string");
        }
      }
    }
  });

  it("idealPeriod values are numbers when present", async () => {
    const data = await fetchDiscipline("PRO3510");
    for (const [_course, period] of Object.entries(data.idealPeriod)) {
      expect(typeof period).toBe("number");
    }
  });

  it("is deterministic (same code returns same data)", async () => {
    const a = await fetchDiscipline("PRO3510");
    const b = await fetchDiscipline("PRO3510");
    expect(a.name).toBe(b.name);
    expect(a.department).toBe(b.department);
    expect(a.institute).toBe(b.institute);
  });
});

describe("hasOfferings", () => {
  it("returns a boolean", async () => {
    const institutes = getInstitutes();
    const codes = await fetchInstituteDisciplines(institutes[0].code);
    const result = await hasOfferings(codes[0]);
    expect(typeof result).toBe("boolean");
  });

  it("returns true/false consistently for the same code", async () => {
    const a = await hasOfferings("PRO3510");
    const b = await hasOfferings("PRO3510");
    expect(a).toBe(b);
  });
});
