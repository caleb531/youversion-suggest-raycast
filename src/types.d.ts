// A type that represents any JSON-serializable value or structure
export type JSONSerializable =
  | string
  | number
  | boolean
  | Array<JSONSerializable>
  | object
  | { [key: string]: JSONSerializable }
  | null;

// Types for JSON Bible data

export type BibleBookId = string;

export interface BibleBook {
  id: BibleBookId;
  name: string;
}

export type BibleVersionId = number;

export interface BibleVersion {
  id: BibleVersionId;
  name: string;
  full_name: string;
}

export type BibleLanguageId = string;

export interface BibleLanguage {
  id: BibleLanguageId;
  name: string;
}

export interface BibleData {
  books: BibleBook[];
  versions: BibleVersion[];
  default_version: BibleVersion;
  language: BibleLanguage;
}
