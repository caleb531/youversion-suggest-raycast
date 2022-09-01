import fsPromises from "fs/promises";
import path from "path";
import { BibleData, JSONSerializable } from "./types";

export function normalizeSearchText(searchText: string): string {
  searchText = searchText.toLowerCase();
  // Remove all non-alphanumeric characters
  searchText = searchText.replace(/[\W_]/gi, " ");
  // Remove extra whitespace
  searchText = searchText.trim();
  searchText = searchText.replace(/\s+/g, " ");
  return searchText;
}

export async function getJSONData<T extends JSONSerializable>(path: string): Promise<T> {
  return JSON.parse(String(await fsPromises.readFile(path)));
}

export async function getBibleData(language: string): Promise<BibleData> {
  return getJSONData(path.join(__dirname, "assets", "data", "bible", `bible-${language}.json`));
}
