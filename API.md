openapi: 3.1.0
info:
  title: jupiterweb
  description: >
    Functional Node.js/TypeScript library for extracting course information
    from the University of São Paulo (USP) via Jupiterweb.

    All functions are async (except `getInstitutes`). No caching — each call
    makes fresh HTTP requests to `uspdigital.usp.br/jupiterweb/`.
  version: 1.0.0
  license:
    name: MIT
  contact:
    name: jupiterweb
    url: https://github.com/davigole/jupiterweb-scraper

tags:
  - name: Institutes
    description: Browse and list USP institutes
  - name: Disciplines
    description: Fetch discipline data, offerings, and requirements
  - name: Search
    description: Search disciplines by name or exact code

paths: {}

components:
  schemas:
    InstituteInfo:
      type: object
      description: Information about a USP teaching institute.
      properties:
        code:
          type: string
          description: Unique institute identifier.
          example: "3"
        name:
          type: string
          description: Full institute name.
          example: Escola Politécnica
        campus:
          type: string
          description: Campus name.
          example: USP
        abbr:
          type: string
          description: Institute abbreviation.
          example: PCC
      required: [code, name, campus, abbr]

    DisciplineData:
      type: object
      description: Complete data for a discipline, including offerings, requirements, and metadata.
      properties:
        code:
          type: string
          description: Discipline code.
          example: PRO3510
        institute:
          type: string
          description: Institute name.
          example: Escola Politécnica
        department:
          type: string
          description: Department name.
          example: Programa de Computação
        name:
          type: string
          description: Discipline name in Portuguese.
          example: Introdução à Engenharia de Computação
        englishName:
          type: string
          description: Discipline name in English (may be empty).
          example: Introduction to Computer Engineering
        requirements:
          type: object
          description: >
            Prerequisites keyed by course. Each value is an array of alternatives
            (OR groups). Each alternative is an array of Requirement objects (AND).
          additionalProperties:
            type: array
            items:
              type: array
              items:
                $ref: "#/components/schemas/Requirement"
          example:
            Engenharia de Computação:
              -
                - code: PRO3510
                  type: requisito
              -
                - code: PRO3511
                  type: requisito
        idealPeriod:
          type: object
          description: Ideal semester period keyed by course.
          additionalProperties:
            type: integer
          example:
            Engenharia de Computação: 3
        offerings:
          type: array
          description: Active class offerings (turmas).
          items:
            $ref: "#/components/schemas/Offering"
        sections:
          type: object
          description: >
            Structured sections from the discipline page (syllabus, bibliography, etc.).
            Values are either strings or nested objects for grouped content.
          additionalProperties: true
      required: [code, institute, department, name, englishName, requirements, idealPeriod, offerings, sections]

    Offering:
      type: object
      description: A class offering (turma) for a discipline.
      properties:
        code:
          type: string
          description: Offering code (turma number).
          example: "001"
        startDate:
          type: string
          description: Class start date.
          example: "02/02/2026"
        endDate:
          type: string
          description: Class end date.
          example: "26/06/2026"
        classType:
          type: string
          description: Class type (e.g. "teoria", "prática").
          example: teoria
        notes:
          type: string
          description: Additional notes (may be empty).
          example: ""
        disciplineCode:
          type: string
          description: Parent discipline code.
          example: PRO3510
        schedules:
          type: array
          description: Class schedule entries.
          items:
            $ref: "#/components/schemas/ClassSchedule"
        seats:
          type: object
          description: Seat availability, keyed by category.
          additionalProperties:
            $ref: "#/components/schemas/SeatInfo"
      required: [code, startDate, endDate, classType, notes, disciplineCode, schedules, seats]

    ClassSchedule:
      type: object
      description: A single class schedule entry.
      properties:
        day:
          type: string
          description: Day of the week (lowercase Portuguese).
          enum: [segunda, terca, quarta, quinta, sexta, sabado, domingo]
          example: segunda
        startTime:
          type: string
          description: Class start time.
          example: "08:00"
        endTime:
          type: string
          description: Class end time.
          example: "10:00"
        instructor:
          type: string
          description: Professor name.
          example: Silva, João
      required: [day, startTime, endTime, instructor]

    Requirement:
      type: object
      description: A prerequisite discipline.
      properties:
        code:
          type: string
          description: Prerequisite discipline code.
          example: PRO3510
        type:
          type: string
          description: Requirement type (e.g. "requisito", "obrigatorio").
          example: requisito
      required: [code, type]

    SeatInfo:
      type: object
      description: Seat availability information for a category.
      properties:
        courses:
          type: object
          description: Per-course seat breakdown.
          additionalProperties:
            $ref: "#/components/schemas/SeatRow"
      additionalProperties: true

    SeatRow:
      type: object
      description: A row of seat values (e.g. available, total, enrolled).
      additionalProperties:
        oneOf:
          - type: number
          - type: string
      example:
        vagas: 45
        total: 60
        ocupadas: 15

    SeatValue:
      oneOf:
        - type: number
        - type: string
      description: A seat value — either a number or a dash ("-").

    MainPageData:
      type: object
      description: Parsed data from the discipline main page.
      properties:
        institute:
          type: string
        department:
          type: string
        name:
          type: string
        englishName:
          type: string
        sections:
          type: object
          additionalProperties: true
      required: [institute, department, name, englishName, sections]

    RequirementsData:
      type: object
      description: Parsed requirements data.
      properties:
        requirements:
          type: object
          additionalProperties:
            type: array
            items:
              type: array
              items:
                $ref: "#/components/schemas/Requirement"
        idealPeriod:
          type: object
          additionalProperties:
            type: integer
      required: [requirements, idealPeriod]

    SearchHit:
      type: object
      description: A search result entry.
      properties:
        code:
          type: string
          description: Discipline code.
          example: "6012003"
        name:
          type: string
          description: Discipline name.
          example: Cálculo
        institute:
          type: string
          description: Institute name (only present when `{ full: true }`).
          example: IME
          nullable: true
      required: [code, name]

    SearchResults:
      type: object
      description: Search results with a flag indicating if the query was too broad.
      properties:
        hits:
          type: array
          items:
            $ref: "#/components/schemas/SearchHit"
        tooMany:
          type: boolean
          description: >
            True when Jupiterweb returns more results than it can display.
            The caller should ask the user to refine the query.
      required: [hits, tooMany]

    SearchOptions:
      type: object
      description: Options for searchDisciplines.
      properties:
        full:
          type: boolean
          description: >
            If true, fetches the institute name for each hit.
            Requires extra HTTP requests (batched with concurrency of 5).
          default: false

x-functions:
  getInstitutes:
    tag: Institutes
    summary: Return all USP institutes
    description: >
      Reads bundled static data. Synchronous — no network calls.
    parameters: []
    returns:
      type: array
      items:
        $ref: "#/components/schemas/InstituteInfo"
    example: |
      import { getInstitutes } from "jupiterweb";

      const institutes = getInstitutes();
      // [
      //   { code: "3", name: "Escola Politécnica", campus: "USP", abbr: "PCC" },
      //   ...
      // ]

  fetchInstituteDisciplines:
    tag: Institutes
    summary: Fetch discipline codes for an institute
    description: >
      Scrapes the Jupiterweb listing page for the given institute code.
    parameters:
      - name: code
        in: parameter
        required: true
        schema:
          type: string
        description: Institute code (e.g. `"3"` for Escola Politécnica)
    returns:
      type: array
      items:
        type: string
      description: Array of discipline code strings
    example: |
      import { fetchInstituteDisciplines } from "jupiterweb";

      const codes = await fetchInstituteDisciplines("3");
      // ["PRO3510", "PRO3511", "PRO3512", ...]

  fetchDiscipline:
    tag: Disciplines
    summary: Fetch complete discipline data
    description: >
      Makes three parallel HTTP requests (main page, requirements, offerings)
      and returns structured data.
    parameters:
      - name: code
        in: parameter
        required: true
        schema:
          type: string
        description: Discipline code (e.g. `"PRO3510"`)
    returns:
      $ref: "#/components/schemas/DisciplineData"
    example: |
      import { fetchDiscipline } from "jupiterweb";

      const data = await fetchDiscipline("PRO3510");
      console.log(data.name);
      // "Introdução à Engenharia de Computação"

  hasOfferings:
    tag: Disciplines
    summary: Check if a discipline has active offerings
    description: >
      Convenience wrapper around `fetchDiscipline`. Returns `true` if the
      discipline has at least one offering (turma).
    parameters:
      - name: code
        in: parameter
        required: true
        schema:
          type: string
        description: Discipline code
    returns:
      type: boolean
    example: |
      import { hasOfferings } from "jupiterweb";

      const active = await hasOfferings("PRO3510");
      // true

  searchDisciplines:
    tag: Search
    summary: Search for disciplines by name
    description: >
      Searches Jupiterweb for disciplines matching the query. Accepts accented
      or non-accented queries (e.g. `"cálculo"` and `"calculo"` both work).

      When `{ full: true }`, fetches each discipline's detail page in parallel
      (batched with concurrency of 5) to include the institute name.

      Returns `tooMany: true` when Jupiterweb returns more results than it can
      display. In that case, the caller should ask the user to refine the query.
    parameters:
      - name: query
        in: parameter
        required: true
        schema:
          type: string
        description: Search term (e.g. `"calculo"`, `"cálculo"`)
      - name: options
        in: parameter
        required: false
        schema:
          $ref: "#/components/schemas/SearchOptions"
        description: Optional settings
    returns:
      $ref: "#/components/schemas/SearchResults"
    example: |
      import { searchDisciplines } from "jupiterweb";

      // Basic search
      const results = await searchDisciplines("calculo");
      // { hits: [{ code: "6012003", name: "Cálculo" }, ...], tooMany: false }

      // With institute names
      const full = await searchDisciplines("calculo", { full: true });
      // { hits: [{ code: "6012003", name: "Cálculo", institute: "IME" }, ...], tooMany: false }

      // Short query — too many results
      const short = await searchDisciplines("cal");
      // { hits: [], tooMany: true }

  searchByCode:
    tag: Search
    summary: Fetch discipline data by exact code
    description: >
      Lightweight lookup — only fetches the main page (no requirements or
      offerings). Returns `code`, `institute`, `department`, `name`,
      `englishName`, and `sections`.
    parameters:
      - name: code
        in: parameter
        required: true
        schema:
          type: string
        description: Discipline code (e.g. `"PRO3510"`)
    returns:
      $ref: "#/components/schemas/DisciplineData"
    example: |
      import { searchByCode } from "jupiterweb";

      const data = await searchByCode("PRO3510");
      console.log(data.institute); // "Escola Politécnica"
      console.log(data.name);      // "Introdução à Engenharia de Computação"
