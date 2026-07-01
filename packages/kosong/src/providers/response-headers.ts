import type { ResponseHeaders } from '#/provider';

interface ResponseEnvelope {
  readonly data: unknown;
  readonly responseHeaders?: ResponseHeaders;
}

interface WithResponse {
  withResponse(): Promise<{
    readonly data: unknown;
    readonly response: { readonly headers: ResponseHeaders };
  }>;
}

export async function awaitWithResponseHeaders<T>(
  value: T | PromiseLike<T> | WithResponse,
): Promise<ResponseEnvelope> {
  if (hasWithResponse(value)) {
    const { data, response } = await value.withResponse();
    return { data, responseHeaders: response.headers };
  }
  return { data: await value };
}

function hasWithResponse<T>(value: T | PromiseLike<T> | WithResponse): value is WithResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { withResponse?: unknown }).withResponse === 'function'
  );
}
