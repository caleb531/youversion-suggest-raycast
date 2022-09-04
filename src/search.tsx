import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { searchBibleForPhrase } from "./search-result-fetcher";
import { BibleReference } from "./types";
import { copyContentToClipboard, normalizeSearchText } from "./utilities";

export default function Command() {
  const { state, search } = useSearch();

  return (
    <List
      isLoading={state.isLoading}
      onSearchTextChange={search}
      searchBarPlaceholder="Type a word or phrase to search the Bible for..."
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
      subtitle={searchResult.content}
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

async function getSearchResults(searchText: string): Promise<BibleReference[]> {
  searchText = normalizeSearchText(searchText);
  // Do not call out to YouVersion's servers if the search text is empty
  if (searchText.trim()) {
    return searchBibleForPhrase(searchText);
  } else {
    return [];
  }
}

interface SearchState {
  results: BibleReference[];
  isLoading: boolean;
}