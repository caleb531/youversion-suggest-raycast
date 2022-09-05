import { Form } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { getPreferredLanguage, getPreferredVersion, setPreferredLanguage, setPreferredVersion } from "./preferences";
import { BibleLanguage, BibleLanguageId, BibleVersion, BibleVersionId } from "./types";
import { getBibleData, getLanguages } from "./utilities";

export default function Command() {
  const { state, onChangeLanguage, onChangeVersion } = usePreferences();

  return (
    <Form isLoading={state.isLoading}>
      {state.currentLanguage ? (
        <Form.Dropdown id="language" title="Language" value={state.currentLanguage} onChange={onChangeLanguage}>
          {state.languageOptions.map((language) => {
            return <Form.Dropdown.Item key={language.id} value={language.id} title={language.name} />;
          })}
        </Form.Dropdown>
      ) : null}
      {state.currentVersion ? (
        <Form.Dropdown id="version" title="Version" value={String(state.currentVersion)} onChange={onChangeVersion}>
          {state.versionOptions.map((version) => {
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
    languageOptions: [],
    currentLanguage: undefined,
    versionOptions: [],
    currentVersion: undefined,
  });

  useEffect(() => {
    getPreferenceFormData().then((newState) => {
      setState({ isLoading: false, ...newState });
    });
  }, []);

  const onChangeLanguage = useCallback(async (newValue: string) => {
    await setPreferredLanguage(newValue);
    const newState = await getPreferenceFormData();
    setState({ isLoading: false, ...newState });
  }, []);

  const onChangeVersion = useCallback(async (newValue: string) => {
    await setPreferredVersion(Number(newValue));
    const newState = await getPreferenceFormData();
    setState({ isLoading: false, ...newState });
  }, []);

  return { state, onChangeLanguage, onChangeVersion };
}

async function getPreferenceFormData() {
  const languages = await getLanguages();
  const preferredLanguageId = await getPreferredLanguage();
  const preferredVersionId = await getPreferredVersion();
  const bible = await getBibleData(preferredLanguageId);

  return {
    languageOptions: languages,
    currentLanguage: preferredLanguageId,
    versionOptions: bible.versions,
    currentVersion: preferredVersionId,
  };
}

interface FormState {
  isLoading: boolean;
  languageOptions: BibleLanguage[];
  currentLanguage: BibleLanguageId | undefined;
  versionOptions: BibleVersion[];
  currentVersion: BibleVersionId | undefined;
}
