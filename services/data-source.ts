export type DataSource = "mock" | "api";

export const DATA_SOURCE: DataSource =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "api" ? "api" : "mock";

export const USE_MOCK_DATA = DATA_SOURCE === "mock";
