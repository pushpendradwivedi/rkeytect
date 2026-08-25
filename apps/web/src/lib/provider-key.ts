export type ProviderId = "gemini";

/**
 * Client-only credential holder.
 * Never persist this object or send it to rkeytect application routes.
 */
export class EphemeralProviderKey {
  private value: string | null = null;

  set(value: string): void {
    this.value = value.trim() || null;
  }

  get(): string | null {
    return this.value;
  }

  clear(): void {
    this.value = null;
  }
}

export const geminiKey = new EphemeralProviderKey();
