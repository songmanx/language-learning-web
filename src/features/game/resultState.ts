import type { SaveSessionRequest } from "../../services/apiTypes";

export type SessionSaveStatus = "saving" | "saved" | "pending";

export type SessionResultState = {
  payload: SaveSessionRequest;
  saveStatus: SessionSaveStatus;
  message?: string;
};
