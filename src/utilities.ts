import fsPromises from "fs/promises";
import path from "path";
import { BibleBookMetadata, BibleData, BibleReference, JSONSerializable } from "./types";

export function normalizeSearchText(searchText: string): string {
  searchText = searchText.toLowerCase();
  // Remove all non-alphanumeric characters
  searchText = searchText.replace(/[\W_]/gi, " ");
  // Remove extra whitespace
  searchText = searchText.trim();
  searchText = searchText.replace(/\s+/g, " ");
  return searchText;
}

export function getReferenceID({
  book,
  chapter,
  verse,
  endVerse,
  version,
}: Pick<BibleReference, "book" | "chapter" | "verse" | "endVerse" | "version">) {
  if (endVerse && verse) {
    return `${version}/${book.id}.${chapter}.${verse}-${endVerse}`;
  } else if (verse) {
    return `${version}/${book.id}.${chapter}.${verse}`;
  } else {
    return `${version}/${book.id}.${chapter}`;
  }
}

export function getReferenceName({
  book,
  chapter,
  verse,
  endVerse,
  version,
}: Pick<BibleReference, "book" | "chapter" | "verse" | "endVerse" | "version">) {
  if (endVerse && verse) {
    return `${book.name} ${chapter}:${verse}-${endVerse} (${version.name})`;
  } else if (verse) {
    return `${book.name} ${chapter}:${verse} (${version.name})`;
  } else {
    return `${book.name} ${chapter} (${version.name})`;
  }
}

export const baseReferenceUrl = "https://www.bible.com/bible";

export function buildReference({
  book,
  chapter,
  verse,
  endVerse,
  version,
}: Pick<BibleReference, "book" | "chapter" | "verse" | "endVerse" | "version">) {
  const id = getReferenceID({ book, chapter, verse, endVerse, version });
  const name = getReferenceName({ book, chapter, verse, endVerse, version });
  return {
    id,
    name,
    url: `${baseReferenceUrl}/${id}`,
    book,
    chapter,
    verse,
    endVerse,
    version,
  };
}

export async function getJSONData<T extends JSONSerializable>(path: string): Promise<T> {
  return JSON.parse(String(await fsPromises.readFile(path)));
}

export async function getBibleData(language: string): Promise<BibleData> {
  return getJSONData(path.join(__dirname, "assets", "data", "bible", `bible-${language}.json`));
}

export async function getBibleBookMetadata(): Promise<{ [key: string]: BibleBookMetadata }> {
  return getJSONData(path.join(__dirname, "assets", "data", "bible", `book-metadata.json`));
}
