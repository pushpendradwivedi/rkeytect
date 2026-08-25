"use client";

export function ApiKeyPrivacyNotice() {
  return (
    <aside aria-label="API key privacy" className="rounded-xl border p-4 text-sm">
      <div className="font-semibold">🔐 Your API key stays with you</div>
      <p className="mt-2 text-sm opacity-80">
        rkeytect does not receive, store, or log your Gemini API key. The key is
        held in browser memory and is used for direct provider requests.
      </p>
      <p className="mt-2 text-xs opacity-70">
        Your browser and provider are still responsible for protecting a
        browser-side credential. Use provider-side restrictions and quotas where
        available. Never paste a production or unrestricted key into a public
        device.
      </p>
    </aside>
  );
}
