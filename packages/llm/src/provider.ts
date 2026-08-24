export interface LLMProvider {
  readonly id: string;
  generateStructured<T>(request: StructuredGenerationRequest<T>): Promise<T>;
}

export interface StructuredGenerationRequest<T> {
  system: string;
  input: string;
  schema: unknown;
  schemaName: string;
  temperature?: number;
}

export class NotConfiguredProvider implements LLMProvider {
  readonly id = "not-configured";

  async generateStructured<T>(_request: StructuredGenerationRequest<T>): Promise<T> {
    throw new Error(
      "No LLM provider is configured. Use a local model or configure a provider adapter."
    );
  }
}
