import type { CheerioAPI } from "cheerio";
import type { SearchResults, SearchHit } from "../types/index.js";

export function parseSearchResults($: CheerioAPI): SearchResults {
  const hits: SearchHit[] = [];
  const tooMany = checkTooMany($);

  if (!tooMany) {
    const links = $("a[href*='sgldis=']");
    for (const link of links) {
      const href = $(link).attr("href");
      if (!href) continue;

      const codeMatch = href.match(/sgldis=([^&]+)/);
      if (!codeMatch) continue;

      const code = codeMatch[1];
      const name = $(link).text().trim();
      if (code && name) {
        hits.push({ code, name });
      }
    }
  }

  return { hits, tooMany };
}

function checkTooMany($: CheerioAPI): boolean {
  const msg = $("#web_mensagem");
  if (msg.length) {
    const text = msg.text().trim().toLowerCase();
    return text.includes("muitas disciplinas");
  }
  return false;
}
