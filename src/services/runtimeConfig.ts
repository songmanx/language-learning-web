export function getGasBaseUrl() {
  return (import.meta.env.VITE_GAS_BASE_URL ?? "").trim();
}

export function getStaticDataMetaUrl() {
  return (import.meta.env.VITE_STATIC_DATA_META_URL ?? "").trim();
}

export function getStaticDataWordsBasePath() {
  return (import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH ?? "").trim().replace(/\/$/, "");
}

export function shouldUseMockApi() {
  const explicitMockFlag = (import.meta.env.VITE_GAS_USE_MOCK ?? "").trim().toLowerCase();
  const baseUrl = getGasBaseUrl();

  return explicitMockFlag === "true" || baseUrl.length === 0;
}

export function shouldUseStaticData() {
  if (shouldUseMockApi()) {
    return false;
  }

  return getStaticDataMetaUrl().length > 0 && getStaticDataWordsBasePath().length > 0;
}

export function getReadDataMode() {
  if (shouldUseMockApi()) {
    return "mock" as const;
  }

  if (shouldUseStaticData()) {
    return "json" as const;
  }

  return "gas" as const;
}

export function getRuntimeConfig() {
  const gasBaseUrl = getGasBaseUrl();
  const staticDataMetaUrl = getStaticDataMetaUrl();
  const staticDataWordsBasePath = getStaticDataWordsBasePath();

  return {
    gasBaseUrl,
    useMockApi: shouldUseMockApi(),
    useStaticData: shouldUseStaticData(),
    staticDataMetaUrl,
    staticDataWordsBasePath,
    readDataMode: getReadDataMode(),
  };
}
