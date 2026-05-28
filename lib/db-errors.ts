const CONNECTION_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "P1001",
  "P1002",
  "P1017",
]);

export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { code?: unknown; message?: unknown };
  const code = typeof maybeError.code === "string" ? maybeError.code : "";
  const message =
    typeof maybeError.message === "string" ? maybeError.message : "";

  if (CONNECTION_ERROR_CODES.has(code)) return true;

  return /timed out|can't reach database server|connection.*(refused|failed|reset)|econnrefused|enotfound/i.test(
    message
  );
}

export const DATABASE_UNAVAILABLE_MESSAGE =
  "Service is temporarily unavailable. Please try again in a few minutes.";