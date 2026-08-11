export {
  getInstitutes,
  fetchInstituteDisciplines,
} from "./scrape/institutes.js";
export { fetchDiscipline, hasOfferings } from "./scrape/discipline.js";
export { searchDisciplines, searchByCode } from "./scrape/search.js";

export type {
  InstituteInfo,
  DisciplineData,
  Offering,
  ClassSchedule,
  Requirement,
  SeatInfo,
  SeatValue,
  SeatRow,
  MainPageData,
  RequirementsData,
  SearchHit,
  SearchResults,
  SearchOptions,
} from "./types/index.js";
