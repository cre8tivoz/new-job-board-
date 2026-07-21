export class ApiError extends Error {
  readonly status: number;
  readonly issues?: Record<string, string[]>;

  constructor(message: string, status: number, issues?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.issues = issues;
  }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: options?.body ? { 'Content-Type': 'application/json', ...options.headers } : options?.headers,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      typeof body.error === 'string' ? body.error : 'The request could not be completed.',
      response.status,
      body.issues,
    );
  }
  return body as T;
}
