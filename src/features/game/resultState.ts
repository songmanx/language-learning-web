import type { SaveSessionRequest } from "../../services/apiTypes";
import type { SessionConfig } from "./sessionConfig";

export type SessionSaveStatus = "saving" | "saved" | "pending";

export type SessionResultState = {
  payload: SaveSessionRequest;
  saveStatus: SessionSaveStatus;
  message?: string;
  sessionConfig?: SessionConfig;
  displayMode?: "standard" | "practice" | "review";
};
