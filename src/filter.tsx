import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import path from "path";
import { useCallback, useEffect, useState } from "react";
import { getPreferredLanguage } from "./preferences";
import { getBibleData } from "./utilities";

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

async function getSearchResults(searchText: string): Promise<SearchResult[]> {
  const searchTextLower = searchText.toLowerCase();
  const bibleFilePath = path.join(__dirname, `assets/data/bible/bible-${await getPreferredLanguage()}.json`);
  const json = await getBibleData<BibleData>(bibleFilePath);

  return json.books
    .map((bibleBook) => {
      return {
        ...bibleBook,
        url: "",
      };
    })
    .filter((bibleRef) => {
      return bibleRef.name && bibleRef.name.toLowerCase().startsWith(searchTextLower);
    });
}

interface BibleData {
  books: BibleBook[];
}

interface BibleBook {
  id: string;
  name: string;
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
