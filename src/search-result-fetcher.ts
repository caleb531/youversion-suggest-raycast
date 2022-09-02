import cheerio from "cheerio";
import { getPreferredLanguageId } from "./preferences";
import { BibleReference } from "./types";
import { buildBibleReferenceFromID, getBibleData, getReferenceIDFromURL } from "./utilities";

export async function parseContentFromHTML(html: string): Promise<BibleReference[]> {
  const $ = cheerio.load(html);
  const $references = $("li.reference");

  const bible = await getBibleData(await getPreferredLanguageId());

  const results: BibleReference[] = [];
  $references.each((r, referenceElem) => {
    const $reference = $(referenceElem);
    const reference = buildBibleReferenceFromID(getReferenceIDFromURL($reference.find("a").prop("href")), bible);
    if (reference) {
      results.push(reference);
    }
  });
  return results;
}
