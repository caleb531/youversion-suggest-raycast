import { Form } from "@raycast/api";
import { useState } from "react";
import { getPreferredLanguage, getPreferredVersion, setPreferredLanguage, setPreferredVersion } from "./preferences";
import { BibleLanguage, BibleLanguageId, BibleVersion, BibleVersionId } from "./types";
import { getBibleData, getLanguages } from "./utilities";

export default function Command() {
  const { state } = usePreferences();

  return (
    <Form isLoading={state.isLoading}>
      {state.preferences?.language?.currentValue ? (
        <Form.Dropdown
          id="language"
          title="Language"
          defaultValue={state.preferences.language.currentValue}
          onChange={(newValue) => setPreferredLanguage(newValue)}
        >
          {state.preferences.language.options.map((language) => {
            return <Form.Dropdown.Item key={language.id} value={language.id} title={language.name} />;
          })}
        </Form.Dropdown>
      ) : null}
      {state.preferences?.version?.currentValue ? (
        <Form.Dropdown
          id="version"
          title="Version"
          defaultValue={String(state.preferences.version.currentValue)}
          onChange={(newValue) => setPreferredVersion(Number(newValue))}
        >
          {state.preferences.version.options.map((version) => {
            return <Form.Dropdown.Item key={String(version.id)} value={String(version.id)} title={version.name} />;
          })}
        </Form.Dropdown>
      ) : null}
    </Form>
  );
}

function usePreferences() {
  const [state, setState] = useState<FormState>({
    isLoading: true,
    preferences: {
      language: { options: [], currentValue: undefined },
      version: { options: [], currentValue: undefined },
    },
  });

  getPreferenceFormData().then((preferences) => {
    setState({ isLoading: false, preferences });
  });

  return { state };
}

async function getPreferenceFormData() {
  const languages = await getLanguages();
  const preferredLanguageId = await getPreferredLanguage();
  const preferredVersionId = await getPreferredVersion();
  const bible = await getBibleData(preferredLanguageId);

  return {
    language: {
      options: languages,
      currentValue: preferredLanguageId,
    },
    version: {
      options: bible.versions,
      currentValue: preferredVersionId,
    },
  };
}

interface FormState {
  isLoading: boolean;
  preferences: Preferences;
}

interface Preferences {
  language: {
    options: BibleLanguage[];
    currentValue: BibleLanguageId | undefined;
  };
  version: {
    options: BibleVersion[];
    currentValue: BibleVersionId | undefined;
  };
}
