import { mapSearchError } from "./mapSearchError";

export function mapSearchErrorMessage(caughtError: unknown): string {
  return mapSearchError(caughtError).message;
}
