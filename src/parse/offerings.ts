import type { CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import { normalizeTitle } from "../lib/normalize.js";
import type { Offering, ClassSchedule, SeatInfo } from "../types/index.js";

export function parseOfferings(
  $: CheerioAPI,
  disciplineCode: string,
): Offering[] {
  const offerings: Offering[] = [];
  const container = $("div#layout_principal > table:nth-of-type(4) td").first();

  if (container.length === 0) return offerings;

  const boxes = container.children().filter((_i, el) => el.tagName === "div");

  for (const box of boxes) {
    const boxEl = $(box);
    const boxTables = boxEl
      .children()
      .filter((_i, el) => el.tagName === "table")
      .toArray();

    const infoSpans = $(boxTables[0]).find("span.txt_arial_8pt_gray").toArray();
    const infoText: string[] = infoSpans.map((s) => $(s).text().trim());
    while (infoText.length < 5) infoText.push("");

    let schedulesRows: Element[] | null = null;
    let seatsRows: Element[] | null = null;

    if (boxTables.length >= 2) {
      if (boxTables.length >= 3) {
        schedulesRows = $(boxTables[1]).children("tr").toArray().slice(1);
        seatsRows = $(boxTables[2]).children("tr").toArray();
      } else {
        seatsRows = $(boxTables[1]).children("tr").toArray();
      }
    }

    const schedules: ClassSchedule[] = [];
    if (schedulesRows) {
      for (const row of schedulesRows) {
        const rowTds = $(row).children("td").toArray();
        const rowText = rowTds.map((td) => $(td).text().trim());
        while (rowText.length < 4) rowText.push("");
        schedules.push({
          day: rowText[0].toLowerCase(),
          startTime: rowText[1],
          endTime: rowText[2],
          instructor: rowText[3],
        });
      }
    }

    const seats: Record<string, SeatInfo> = {};
    if (seatsRows && seatsRows.length > 0) {
      parseSeats($, seatsRows, seats);
    }

    const offering: Offering = {
      code: infoText[0].toUpperCase(),
      startDate: infoText[1],
      endDate: infoText[2],
      classType: infoText[3].toLowerCase(),
      notes: infoText[4],
      disciplineCode: disciplineCode.toUpperCase(),
      schedules,
      seats,
    };

    offerings.push(offering);
  }

  return offerings;
}

function parseSeats(
  $: CheerioAPI,
  seatsRows: Element[],
  seats: Record<string, SeatInfo>,
) {
  const headerTds = $(seatsRows[0]).children("td").toArray().slice(1);
  const seatsLabels = headerTds.map((td) =>
    normalizeTitle($(td).text().trim().toLowerCase()),
  );

  let seatType = "";

  for (let r = 1; r < seatsRows.length; r++) {
    const rowTds = $(seatsRows[r]).children("td").toArray();
    const rowText = rowTds.map((td) => $(td).text().trim());

    const isTitle = rowText[0] !== "";
    const adjustedText = isTitle ? rowText : rowText.slice(1);

    const rowName = adjustedText[0];
    const rowVals = adjustedText
      .slice(1)
      .map((v) => (v.match(/^\d+$/) ? parseInt(v, 10) : "-"));
    while (rowVals.length < seatsLabels.length) rowVals.push("-");

    const rowItems: Record<string, unknown> = {};
    for (let i = 0; i < seatsLabels.length; i++) {
      rowItems[seatsLabels[i]] = rowVals[i];
    }

    if (isTitle) {
      seatType = normalizeTitle(rowName);
      seats[seatType] = { courses: {} };
    } else if (seatType) {
      const courses = seats[seatType].courses as Record<
        string,
        Record<string, unknown>
      >;
      courses[rowName] = rowItems;
    }
  }
}
