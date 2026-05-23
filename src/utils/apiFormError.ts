import axios from "axios";

export type ApiValidationErrors = Record<string, string[]>;

export function getApiValidationErrors(error: unknown): ApiValidationErrors {
  if (!axios.isAxiosError(error)) {
    return {};
  }

  const responseErrors = error.response?.data?.errors;
  if (!responseErrors || typeof responseErrors !== "object") {
    return {};
  }

  return Object.entries(responseErrors).reduce<ApiValidationErrors>(
    (accumulator, [field, messages]) => {
      const normalizedMessages = Array.isArray(messages)
        ? messages.filter(
            (message): message is string => typeof message === "string"
          )
        : [];

      if (normalizedMessages.length > 0) {
        accumulator[field] = normalizedMessages;
      }

      return accumulator;
    },
    {}
  );
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan pada permintaan."
) {
  if (axios.isAxiosError(error)) {
    const validationErrors = getApiValidationErrors(error);
    const firstValidationMessage = Object.values(validationErrors)
      .flat()
      .find((message) => typeof message === "string");

    if (firstValidationMessage) {
      return firstValidationMessage;
    }

    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function flattenApiValidationErrors(
  errors: ApiValidationErrors
): string[] {
  return Object.values(errors)
    .flat()
    .filter((message): message is string => typeof message === "string");
}
