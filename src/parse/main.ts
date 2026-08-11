import type { CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import { normalizeTitle } from "../lib/normalize.js";
import type { MainPageData } from "../types/index.js";

export function parseMainPage($: CheerioAPI): MainPageData {
  const table = $("form[name='form1'] > table").first();
  if (table.length === 0) {
    return {
      institute: "",
      department: "",
      name: "",
      englishName: "",
      sections: {},
    };
  }

  const centeredText: string[] = [];
  table.find("td[align='CENTER']").each((_i, el) => {
    centeredText.push($(el).text().trim());
  });
  while (centeredText.length < 4) centeredText.push("");

  const institute = centeredText[0];
  const department = centeredText[1];
  const nameRaw = centeredText[2].replace(/^Disciplina:/, "");
  const dashIdx = nameRaw.indexOf("-");
  const name = dashIdx > 0 ? nameRaw.slice(dashIdx + 1).trim() : nameRaw.trim();
  const englishName = centeredText[3];

  const sections = parseFreeTextSections($);

  return { institute, department, name, englishName, sections };
}

function parseFreeTextSections(
  $: CheerioAPI,
): Record<string, string | Record<string, string>> {
  const spans = $("span.txt_arial_8pt_gray, span.txt_arial_8pt_black");
  const result: Record<string, string | Record<string, string>> = {};

  let title = "";
  let subtitle = "";
  let subtitleTab: Element | null = null;
  let addedText = false;

  for (const span of spans) {
    const text = $(span).text().trim();
    const classes = $(span).attr("class") || "";
    const isBlack = classes.includes("txt_arial_8pt_black");

    if (isBlack) {
      const normalized = normalizeTitle(text);
      const tab = $(span).closest("table")[0];
      const tabEl = tab && tab.type === "tag" ? (tab as Element) : null;

      if (
        title &&
        ((!subtitle && !addedText) || (subtitle && tabEl === subtitleTab))
      ) {
        subtitle = normalized;
        subtitleTab = tabEl;

        if (
          !(title in result) ||
          typeof result[title] !== "object" ||
          Array.isArray(result[title])
        ) {
          result[title] = {};
        }
        (result[title] as Record<string, string>)[subtitle] = "";
      } else {
        title = normalized;
        subtitle = "";
        result[title] = "";
      }
      addedText = false;
    } else {
      if (
        subtitle &&
        title &&
        typeof result[title] === "object" &&
        !Array.isArray(result[title])
      ) {
        const current = (result[title] as Record<string, string>)[subtitle];
        (result[title] as Record<string, string>)[subtitle] =
          current && text ? `${current}\n${text}` : text;
      } else {
        const current = result[title];
        result[title] = current && text ? `${current}\n${text}` : text;
        addedText = true;
      }
    }
  }

  return result;
}
