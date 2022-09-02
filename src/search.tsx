import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { getPreferredLanguageId } from "./preferences";
import { BibleBook, BibleBookId, BibleBookMetadata, BibleReference, BibleVersion } from "./types";
import { buildBibleReference, copyContentToClipboard, getBibleData, normalizeSearchText } from "./utilities";

export default function Command() {
  const { state, search } = useSearch();

  return (
    <List
      isLoading={state.isLoading}
      onSearchTextChange={search}
      searchBarPlaceholder="Type the name of a chapter, verse, or range or verses..."
      throttle
    >
      <List.Section title="Results" subtitle={state.results.length + ""}>
        {state.results.map((searchResult: BibleReference) => (
          <SearchListItem key={searchResult.id} searchResult={searchResult} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: BibleReference }) {
  return (
    <List.Item
      title={`${searchResult.name} (${searchResult.version.name})`}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="View on YouVersion" url={searchResult.url} />
          <Action
            title="Copy content to clipboard"
            onAction={() => {
              copyContentToClipboard(searchResult);
            }}
          />
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

function getSearchResult(book: BibleBookMatch, searchParams: SearchParams, chosenVersion: BibleVersion) {
  const chapter = Math.min(searchParams.chapter, book.metadata.chapters);
  const lastVerse = book.metadata.verses[chapter - 1];

  return buildBibleReference({
    book: book,
    chapter,
    verse: searchParams.verse ? Math.min(searchParams.verse, lastVerse) : null,
    endVerse: searchParams.endVerse ? Math.min(searchParams.endVerse, lastVerse) : null,
    version: chosenVersion,
  });
}

async function getSearchResults(searchText: string): Promise<BibleReference[]> {
  searchText = normalizeSearchText(searchText);
  const searchParams = getSearchParams(searchText);
  if (!searchParams) {
    return [];
  }
  const bible = await getBibleData(await getPreferredLanguageId());
  return [];
}

interface BibleBookMatch extends BibleBook {
  priority: number;
  metadata: BibleBookMetadata;
}

interface SearchState {
  results: BibleReference[];
  isLoading: boolean;
}
interface SearchParams {
  book: BibleBookId;
  chapter: number;
  verse: number | null;
  endVerse: number | null;
  version: string | null;
}
