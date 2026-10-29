# Presentations

A Markdown file with `marp: true` in its front matter opens as a slide deck instead of a document. This follows the [Marp](https://marp.app) format, so a deck you already have should work.

## Write a deck

Separate slides with a line containing only `---`.

```markdown
---
marp: true
title: Quarterly review
---

# Quarterly review

October 2026

---

## What shipped

- New reader
- Full-screen diagrams
```

The first slide is styled as a title slide. A slide with only a heading becomes a section divider.

## Present

| Action | Keys |
|---|---|
| Next slide | <kbd>→</kbd>, <kbd>Space</kbd> or <kbd>Page Down</kbd> |
| Previous slide | <kbd>←</kbd> or <kbd>Page Up</kbd> |
| Leave the deck | <kbd>Esc</kbd> |

Slides scale to the window and keep a 16:9 shape.

## Export to PowerPoint

Select **PPTX** in the top-right corner. Each slide becomes a PowerPoint slide with its heading, bullet points and text. Diagrams and images are not included in the PowerPoint export yet.
