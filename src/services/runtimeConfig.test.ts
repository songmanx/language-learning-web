import { afterEach, describe, expect, it } from "vitest";
import { getRuntimeConfig, shouldUseMockApi, shouldUseStaticData } from "./runtimeConfig";

const originalBaseUrl = import.meta.env.VITE_GAS_BASE_URL;
const originalUseMock = import.meta.env.VITE_GAS_USE_MOCK;
const originalStaticMetaUrl = import.meta.env.VITE_STATIC_DATA_META_URL;
const originalStaticWordsBasePath = import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH;

describe("runtimeConfig", () => {
  afterEach(() => {
    import.meta.env.VITE_GAS_BASE_URL = originalBaseUrl;
    import.meta.env.VITE_GAS_USE_MOCK = originalUseMock;
    import.meta.env.VITE_STATIC_DATA_META_URL = originalStaticMetaUrl;
    import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH = originalStaticWordsBasePath;
  });

  it("uses mock mode when no base URL is set", () => {
    import.meta.env.VITE_GAS_BASE_URL = "";
    import.meta.env.VITE_GAS_USE_MOCK = "";

    expect(shouldUseMockApi()).toBe(true);
  });

  it("uses real API mode when base URL exists and mock flag is false", () => {
    import.meta.env.VITE_GAS_BASE_URL = "https://example.com/gas";
    import.meta.env.VITE_GAS_USE_MOCK = "false";
    import.meta.env.VITE_STATIC_DATA_META_URL = "";
    import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH = "";

    expect(getRuntimeConfig()).toEqual({
      gasBaseUrl: "https://example.com/gas",
      useMockApi: false,
      useStaticData: false,
      staticDataMetaUrl: "",
      staticDataWordsBasePath: "",
      readDataMode: "gas",
    });
  });

  it("forces mock mode when the explicit flag is true", () => {
    import.meta.env.VITE_GAS_BASE_URL = "https://example.com/gas";
    import.meta.env.VITE_GAS_USE_MOCK = "true";

    expect(shouldUseMockApi()).toBe(true);
  });

  it("uses static JSON mode when both static data paths are set", () => {
    import.meta.env.VITE_GAS_BASE_URL = "https://example.com/gas";
    import.meta.env.VITE_GAS_USE_MOCK = "false";
    import.meta.env.VITE_STATIC_DATA_META_URL = "/data/languages.json";
    import.meta.env.VITE_STATIC_DATA_WORDS_BASE_PATH = "/data/";

    expect(shouldUseStaticData()).toBe(true);
    expect(getRuntimeConfig()).toEqual({
      gasBaseUrl: "https://example.com/gas",
      useMockApi: false,
      useStaticData: true,
      staticDataMetaUrl: "/data/languages.json",
      staticDataWordsBasePath: "/data",
      readDataMode: "json",
    });
  });
});
