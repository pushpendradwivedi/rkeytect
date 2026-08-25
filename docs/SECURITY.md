# Security model

## BYOK

rkeytect uses Bring Your Own Key for browser-side AI providers.

### Gemini flow

```text
User browser
   |
   | Gemini API key (memory only)
   v
Google Gemini API
```

The rkeytect server is intentionally not in this credential path.

### We must never

- accept provider API keys in rkeytect server routes
- persist provider keys in a database
- write provider keys to localStorage/sessionStorage/cookies
- place keys in URLs
- include keys in analytics or telemetry
- log request headers containing keys
- commit keys to Git

### User warning

A browser-side API key is still a credential. rkeytect cannot protect it from a compromised endpoint, malicious extension, malware, screenshots, or other client-side compromise. Users should use provider-side restrictions and quotas where supported.

### AI output warning

All architecture output is AI-assisted and must be labeled as such. Source-backed, inferred and recommended architecture must remain distinct. Users must verify generated output against the original AWS source and official AWS documentation before production use.
