// Seat types
export type SeatValue = number | string;
export type SeatRow = Record<string, SeatValue>;

export interface SeatInfo {
  courses: Record<string, SeatRow>;
  [key: string]: SeatRow | Record<string, SeatRow>;
}

// Schedule
export interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
  instructor: string;
}

// Requirement
export interface Requirement {
  code: string;
  type: string;
}

// Offering
export interface Offering {
  code: string;
  startDate: string;
  endDate: string;
  classType: string;
  notes: string;
  disciplineCode: string;
  schedules: ClassSchedule[];
  seats: Record<string, SeatInfo>;
}

// Discipline data
export interface DisciplineData {
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

// Institute
export interface InstituteInfo {
  code: string;
  name: string;
  campus: string;
  abbr: string;
}

// Parser return types
export interface MainPageData {
  institute: string;
  department: string;
  name: string;
  englishName: string;
  sections: Record<string, string | Record<string, string>>;
}

export interface RequirementsData {
  requirements: Record<string, Requirement[][]>;
  idealPeriod: Record<string, number>;
}

export interface SearchHit {
  code: string;
  name: string;
  institute?: string;
}

export interface SearchResults {
  hits: SearchHit[];
  tooMany: boolean;
}

export interface SearchOptions {
  /** Fetch institute name for each hit (requires extra HTTP requests) */
  full?: boolean;
}
