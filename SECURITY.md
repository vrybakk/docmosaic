# Security Policy

## Supported versions

Security fixes land on the **latest published release** of each package (`@docmosaic/core`, `@docmosaic/react`). Older versions are not patched - please upgrade to the latest version.

## Scope

DocMosaic is **fully client-side**: it has no backend, accepts no uploads, and never transmits document data off the device. The relevant security surface is therefore the npm packages themselves - supply chain, and the handling of untrusted input in the image / PDF generation pipeline (a malicious document or image that could crash or hang a consuming app).

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Instead, use GitHub's private vulnerability reporting:

-   Go to the repository's **Security** tab → **Report a vulnerability**, or use the [direct link](https://github.com/vrybakk/docmosaic/security/advisories/new).

Include a description, reproduction steps, and the affected version(s). You'll get an acknowledgement within a few days and a remediation or mitigation timeline once the report is triaged. Please give us a reasonable window to ship a fix before any public disclosure.
