# rkeytect Web

The public web application is designed around **client-owned AI credentials**.

## Credential privacy contract

- Provider API keys are entered by the user in the browser.
- Keys are held in runtime memory only.
- Do not write provider keys to localStorage, sessionStorage, cookies, URL parameters, analytics events, server requests, or application logs.
- AI requests should go directly from the browser to the selected provider where the provider supports browser-side usage.
- Server routes may process public article URLs/content but must never accept an AI provider secret.

The UI must make these properties visible before a user submits a key. This is a technical design requirement, not merely a privacy-policy statement.
