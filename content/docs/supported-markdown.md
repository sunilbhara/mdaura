# Supported Markdown

MDAura renders CommonMark plus the GitHub extensions most people use every day. This page shows each one.

## Text

You can write **bold**, *italic*, ~~strikethrough~~ and `inline code`. Links like [the home page](/) open in the same tab. Links to other sites open in a new tab.

## Headings

Use `#` to `######`. Levels 1 to 3 appear in the outline, and every heading gets a link you can copy.

## Lists

- Unordered lists
  - nest as deep as you need
    - with a different marker at each level
1. Ordered lists
2. keep their numbering
   1. and nest too

### Task lists

- [x] Write the draft
- [x] Add diagrams
- [ ] Send for review

## Quotes

> A blockquote is shown with an accent rule on the left.
>
> It can hold several paragraphs, lists and code.

## Code

Fenced code blocks are highlighted for more than 35 languages. Name the language after the opening fence.

```python
def reading_time(words: int, wpm: int = 220) -> int:
    return max(1, round(words / wpm))
```

Every block has a **Copy** button.

## Tables

Column alignment from the separator row is respected. Wide tables scroll sideways instead of squeezing the page.

| Setting | Default | Range |
|:--|:-:|--:|
| Text size | 100% | 70% to 150% |
| Diagram zoom | Fit | 10% to 800% |
| File size | | up to 50 MB |

## Images

`![Alt text](https://example.com/image.png)` displays an image. Hover over it and select the expand button to see it full size. Relative paths need the [folder upload](/docs/opening-files#open-a-folder-with-images).

## Footnotes

Footnotes are collected at the end of the document.[^1]

[^1]: Like this one.

## Collapsible sections

<details>
<summary>Select to expand</summary>

Write `<details>` and `<summary>` in your Markdown to make a section that opens and closes.

</details>

## Raw HTML

Simple HTML such as `<kbd>`, `<sup>`, `<sub>`, `<details>` and `<img>` is allowed. Scripts, iframes, forms, styles and event handlers such as `onclick` are removed before the document is shown. See [Privacy and security](/docs/privacy).

## Front matter

YAML front matter between `---` lines at the top of the file is hidden. If it contains `marp: true`, the file opens as a [presentation](/docs/presentations).
