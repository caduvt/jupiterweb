# jupiterweb

Functional Node.js/TypeScript library for extracting course information from the University of São Paulo (USP) via [Jupiterweb](https://uspdigital.usp.br/jupiterweb/).

## Install

```bash
npm install jupiterweb
```

## Quick Start

```ts
import { searchDisciplines, searchByCode, fetchDiscipline } from "jupiterweb";

// 1. Search by name
const results = await searchDisciplines("calculo");
console.log(results.hits[0]);
// { code: "6012003", name: "Cálculo" }

// 2. Search with institute names (extra HTTP requests)
const full = await searchDisciplines("calculo", { full: true });
console.log(full.hits[0]);
// { code: "6012003", name: "Cálculo", institute: "IME" }

// 3. Exact lookup by code
const data = await searchByCode("PRO3510");
console.log(data.name);
// "Introdução à Engenharia de Computação"

// 4. Fetch full discipline data (offerings, requirements, etc.)
const fullData = await fetchDiscipline("PRO3510");
console.log(fullData.offerings.length);
```

## API Reference

### `getInstitutes(): InstituteInfo[]`

Returns all USP institutes from the bundled static data. Synchronous — no network calls.

```ts
const institutes = getInstitutes();
// InstituteInfo[]
```

**Returns:** Array of `InstituteInfo` objects.

---

### `fetchInstituteDisciplines(code: string): Promise<string[]>`

Fetches the list of discipline codes offered by a given institute.

```ts
const codes = await fetchInstituteDisciplines("3");
// string[] — e.g. ["PRO3510", "PRO3511", ...]
```

**Parameters:**

| Name   | Type     | Description                                        |
| ------ | -------- | -------------------------------------------------- |
| `code` | `string` | Institute code (e.g. `"3"` for Escola Politécnica) |

**Returns:** Array of discipline code strings.

---

### `fetchDiscipline(code: string): Promise<DisciplineData>`

Fetches complete data for a discipline. Makes three parallel HTTP requests (main page, requirements, offerings).

```ts
const data = await fetchDiscipline("PRO3510");
console.log(data.name);
console.log(data.department);
console.log(data.offerings.length);
```

**Parameters:**

| Name   | Type     | Description                        |
| ------ | -------- | ---------------------------------- |
| `code` | `string` | Discipline code (e.g. `"PRO3510"`) |

**Returns:** `DisciplineData` object containing name, department, offerings, requirements, and more.

---

### `hasOfferings(code: string): Promise<boolean>`

Checks whether a discipline has active offerings (classes). Internally calls `fetchDiscipline`.

```ts
const active = await hasOfferings("PRO3510");
// true or false
```

**Parameters:**

| Name   | Type     | Description     |
| ------ | -------- | --------------- |
| `code` | `string` | Discipline code |

**Returns:** `true` if the discipline has at least one offering.

---

### `searchDisciplines(query: string, options?: SearchOptions): Promise<SearchResults>`

Searches for disciplines by name. Accepts accented or non-accented queries (e.g. `"cálculo"` and `"calculo"` both work).

```ts
// Basic search — returns code and name
const results = await searchDisciplines("calculo");
// { hits: [{ code: "6012003", name: "Cálculo" }, ...], tooMany: false }

// With institute names — fetches each discipline's detail page
const full = await searchDisciplines("calculo", { full: true });
// { hits: [{ code: "6012003", name: "Cálculo", institute: "IME" }, ...], tooMany: false }

// Short queries may return too many results
const short = await searchDisciplines("cal");
// { hits: [], tooMany: true }
```

**Parameters:**

| Name     | Type          | Description                                                        |
| -------- | ------------- | ------------------------------------------------------------------ |
| `query`  | `string`      | Search term (e.g. `"calculo"`, `"cálculo"`)                        |
| `options`| `SearchOptions` | Optional settings                                                  |
| `options.full` | `boolean` | If `true`, fetches the institute name for each hit (extra HTTP requests, batched with concurrency of 5) |

**Returns:** `SearchResults` with `hits` array and `tooMany` flag. When `tooMany` is `true`, refine the search query.

---

### `searchByCode(code: string): Promise<DisciplineData>`

Fetches discipline data by exact code. Lightweight — only fetches the main page (no requirements or offerings).

```ts
const data = await searchByCode("PRO3510");
console.log(data.institute); // "Escola Politécnica"
console.log(data.name);      // "Introdução à Engenharia de Computação"
```

**Parameters:**

| Name   | Type     | Description                        |
| ------ | -------- | ---------------------------------- |
| `code` | `string` | Discipline code (e.g. `"PRO3510"`) |

**Returns:** `DisciplineData` with `code`, `institute`, `department`, `name`, `englishName`, and `sections`. Note: `requirements`, `idealPeriod`, and `offerings` are empty.

---

## Types

### `InstituteInfo`

```ts
interface InstituteInfo {
  code: string; // Institute identifier
  name: string; // Full name
  campus: string; // Campus name
  abbr: string; // Abbreviation
}
```

### `DisciplineData`

```ts
interface DisciplineData {
  code: string;
  institute: string;
  department: string;
  name: string;
  englishName: string;
  requirements: Record<string, Requirement[][]>;
  idealPeriod: Record<string, number>;
  offerings: Offering[];
  sections: Record<string, string | Record<string, string>>;
}
```

### `Offering`

```ts
interface Offering {
  code: string;
  startDate: string;
  endDate: string;
  classType: string;
  notes: string;
  disciplineCode: string;
  schedules: ClassSchedule[];
  seats: Record<string, SeatInfo>;
}
```

### `ClassSchedule`

```ts
interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
  instructor: string;
}
```

### `Requirement`

```ts
interface Requirement {
  code: string;
  type: string;
}
```

### `SeatInfo`

```ts
interface SeatInfo {
  courses: Record<string, SeatRow>;
  [key: string]: SeatRow | Record<string, SeatRow>;
}
```

### `SearchHit`

```ts
interface SearchHit {
  code: string;
  name: string;
  institute?: string; // Only present when { full: true }
}
```

### `SearchResults`

```ts
interface SearchResults {
  hits: SearchHit[];
  tooMany: boolean; // true when Jupiterweb returns too many results
}
```

### `SearchOptions`

```ts
interface SearchOptions {
  full?: boolean; // Fetch institute name for each hit (extra HTTP requests)
}
```

## Examples

### Search by name with institutes

```ts
import { searchDisciplines } from "jupiterweb";

const results = await searchDisciplines("computação", { full: true });

if (results.tooMany) {
  console.log("Too many results — please refine your search.");
} else {
  for (const hit of results.hits) {
    console.log(`${hit.code} — ${hit.name} (${hit.institute})`);
  }
}
```

### Check all offerings for a discipline

```ts
import { fetchDiscipline } from "jupiterweb";

const data = await fetchDiscipline("PRO3510");

for (const offering of data.offerings) {
  console.log(`Turma ${offering.code} (${offering.classType})`);
  console.log(`  ${offering.startDate} → ${offering.endDate}`);

  for (const schedule of offering.schedules) {
    console.log(
      `  ${schedule.day} ${schedule.startTime}-${schedule.endTime} — ${schedule.instructor}`,
    );
  }
}
```

### View prerequisites

```ts
import { fetchDiscipline } from "jupiterweb";

const data = await fetchDiscipline("PRO3510");

for (const [course, alternatives] of Object.entries(data.requirements)) {
  console.log(`Curso: ${course}`);
  for (let i = 0; i < alternatives.length; i++) {
    const reqs = alternatives[i].map((r) => r.code).join(", ");
    console.log(`  ${i > 0 ? "OU" : "PRÉ-REQUISITO"}: ${reqs}`);
  }
}
```

## Notes

- All functions are async (except `getInstitutes` which reads bundled static data).
- No caching — each call makes fresh HTTP requests. Implement your own caching if needed.
- The library scrapes `uspdigital.usp.br/jupiterweb/`. If the site changes its HTML structure, parsing may break.
- Requirements data depends on server-rendered HTML. Some pages load content dynamically via JavaScript, which this scraper cannot access.
