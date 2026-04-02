const flattenErrorValue = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenErrorValue);
  }

  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(flattenErrorValue);
  }

  return [];
};

export const extractApiErrorMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const data = payload as Record<string, unknown>;

  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }

  const error = data.error;
  if (error && typeof error === 'object') {
    const errorObject = error as Record<string, unknown>;
    const detailMessage = flattenErrorValue(errorObject.details).find(Boolean);
    if (detailMessage) {
      return detailMessage;
    }
    if (typeof errorObject.message === 'string' && errorObject.message.trim()) {
      return errorObject.message;
    }
  }

  const directMessage = flattenErrorValue(data).find(Boolean);
  return directMessage || fallback;
};
