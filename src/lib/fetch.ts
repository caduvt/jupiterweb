import * as cheerio from "cheerio";
import iconv from "iconv-lite";

export async function fetchPage(url: string): Promise<cheerio.CheerioAPI> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${response.statusText} for ${url}`,
    );
  }
  const text = iconv.decode(Buffer.from(await response.arrayBuffer()), "latin1");
  return cheerio.load(text);
}
