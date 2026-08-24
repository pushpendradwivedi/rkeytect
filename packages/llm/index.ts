export interface LLMRequest {
  system: string;
  input: string;
  schemaName: string;
}

export interface LLMProvider {
  readonly id: string;
  generateStructured<T>(request: LLMRequest): Promise<T>;
}

export class UnsupportedProviderError extends Error {
  constructor(provider: string) {
    super(`LLM provider '${provider}' is not configured.`);
    this.name = "UnsupportedProviderError";
  }
}

export function createProvider(provider: string): LLMProvider {
  throw new UnsupportedProviderError(provider);
}
