import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { getPreferredLanguageId, getPreferredVersionId } from "./preferences";
import { BibleData, BibleVersion, BibleVersionId } from "./types";
import { getBibleData, normalizeSearchText as coreNormalizeSearchText } from "./utilities";

export default function Command() {
  const { state, search } = useSearch();

  return (
    <List
      isLoading={state.isLoading}
      onSearchTextChange={search}
      searchBarPlaceholder="Type the name of a chapter, verse, or range or verses..."
    >
      <List.Section title="Results" subtitle={state.results.length + ""}>
        {state.results.map((searchResult: SearchResult) => (
          <SearchListItem key={searchResult.name} searchResult={searchResult} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  return (
    <List.Item
      title={searchResult.name}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={searchResult.url} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard
              title="Copy Install Command"
              content={`npm install ${searchResult.name}`}
              shortcut={{ modifiers: ["cmd"], key: "." }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function useSearch() {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: true });

  const search = useCallback(
    async function search(searchText: string) {
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));
      try {
        const results = await getSearchResults(searchText);
        setState((oldState) => ({
          ...oldState,
          results: results,
          isLoading: false,
        }));
      } catch (error) {
        setState((oldState) => ({
          ...oldState,
          isLoading: false,
        }));

        console.error("search error", error);
        showToast({ style: Toast.Style.Failure, title: "Could not perform search", message: String(error) });
      }
    },
    [setState]
  );

  useEffect(() => {
    search("");
  }, []);

  return {
    state: state,
    search: search,
  };
}

// Normalize the search text by removing extraneous characters and collapsing
// whitespace
function normalizeSearchText(searchText: string): string {
  searchText = coreNormalizeSearchText(searchText);
  searchText = searchText.replace(/(\d)(?=[a-z])/gi, "$1 ");
  searchText = searchText.replace(/\s+/g, " ");
  searchText = searchText.trim();
  return searchText;
}

function getReferenceMatches(searchText: string): string[] | null {
  const bookRegex = /(\d?(?:[^\W\d_]|\s)+|\d)\s?/;
  const chapterRegex = /(\d+)\s?/;
  const verseRegex = /(\d+)\s?/;
  const endVerseRegex = /(\d+)?\s?/;
  const versionRegex = /([^\W\d_](?:[^\W\d_]\d*|\s)*)?.*?/;
  return searchText.match(
    new RegExp(
      `^${bookRegex.source}(?:${chapterRegex.source}(?:${verseRegex.source}${endVerseRegex.source})?${versionRegex.source})?$`,
      "i"
    )
  );
}

// Parse out the search text into its parts (which we are calling 'parameters')
function getSearchParams(searchText: string): SearchParams | null {
  const refMatch = getReferenceMatches(searchText);
  if (!refMatch) {
    return null;
  }

  const searchParams: SearchParams = {};

  const bookMatch = refMatch[1];
  searchParams.book = bookMatch.trimEnd();

  const chapterMatch = refMatch[2];
  if (chapterMatch) {
    searchParams.chapter = Math.max(1, parseInt(chapterMatch, 10));
  }
  const verseMatch = refMatch[3];
  if (verseMatch) {
    searchParams.verse = Math.max(1, parseInt(verseMatch, 10));
  }
  const endVerseMatch = refMatch[4];
  if (endVerseMatch) {
    searchParams.endVerse = parseInt(endVerseMatch, 10);
  }
  const versionMatch = refMatch[5];
  if (versionMatch) {
    searchParams.version = normalizeSearchText(versionMatch);
  }

  return searchParams;
}

// Finds a version which best matches the given version query
function guessVersion(versions: BibleVersion[], versionSearchText: string): BibleVersion | null {
  // Chop off character from version query until matching version can be found
  // (if a matching version even exists)
  for (let i = versionSearchText.length; i >= 0; i -= 1) {
    for (const version of versions) {
      const normalizedVersionName = normalizeSearchText(version.name);
      if (normalizedVersionName === versionSearchText.slice(0, i)) {
        return version;
      }
    }
  }
  // Give partial matches lower precedence over exact matches
  for (let i = versionSearchText.length; i >= 0; i -= 1) {
    for (const version of versions) {
      const normalizedVersionName = normalizeSearchText(version.name);
      if (normalizedVersionName.startsWith(versionSearchText.slice(0, i))) {
        return version;
      }
    }
  }
  return null;
}

function chooseBestVersion(
  preferredVersionId: BibleVersionId,
  bible: BibleData,
  searchParams: SearchParams
): BibleVersion | null {
  if (searchParams.version) {
    return guessVersion(bible.versions, searchParams.version);
  } else if (preferredVersionId) {
    return bible.versions.find((version) => version.id === preferredVersionId) || null;
  }
  return null;
}

async function getSearchResults(searchText: string): Promise<SearchResult[]> {
  searchText = normalizeSearchText(searchText);
  const searchParams = getSearchParams(searchText);
  if (!searchParams) {
    return [];
  }
  const bible = await getBibleData(await getPreferredLanguageId());

  if (!searchParams.chapter) {
    searchParams.chapter = 1;
  }

  const chosenVersion = chooseBestVersion(await getPreferredVersionId(), bible, searchParams);

  console.log("searchParams", searchParams);

  return bible.books
    .map((bibleBook) => {
      return {
        ...bibleBook,
        url: "",
      };
    })
    .filter((bibleRef) => {
      return bibleRef.name && bibleRef.name.toLowerCase().startsWith(searchText);
    });
}

interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
}
interface SearchResult {
  id: string;
  name: string;
  url: string;
}
interface SearchParams {
  book?: string;
  chapter?: number;
  verse?: number;
  endVerse?: number;
  version?: string;
}
