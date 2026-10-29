# Privacy and security

## Your files stay on your machine

When you open a file, your browser reads it and renders it. The file is not uploaded, logged or stored anywhere. Exports to Word, PDF and PowerPoint are also built in your browser.

The document you are reading is kept in your browser's session storage so a page reload does not lose it. Session storage belongs to that tab only and is cleared when you close the tab.

MDAura has no accounts and no analytics.

## Documents are treated as untrusted

Markdown can contain HTML, so MDAura filters every document before showing it.

- Scripts, iframes, forms, styles, `javascript:` links and event handlers such as `onclick` are removed.
- Diagrams run in Mermaid's strict mode, which disables click handlers and HTML in labels.
- Links to other sites open in a new tab with `noopener`.

This matters most when you open a file someone else wrote.

## External content

Images that point to other websites, such as `https://example.com/chart.png`, are loaded by your browser from that site, the same as on any web page. The fonts are loaded from Google Fonts.

## Reporting a security problem

Please report security problems privately through GitHub's **Report a vulnerability** option on the repository, rather than in a public issue.
