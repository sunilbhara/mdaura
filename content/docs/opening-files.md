# Opening files

You can open a single Markdown file, or a folder that contains a Markdown file and the images it refers to.

## Supported files

| Extension | Opens as |
|---|---|
| `.md`, `.markdown` | A document |
| `.mdx` | A document. JSX components are shown as text, not run. |
| `.txt` | A document, if it contains Markdown |
| Any of the above with `marp: true` in its front matter | A [presentation](/docs/presentations) |

The size limit is **50 MB** per file.

## Open a single file

Drag the file onto the drop area on the home page, or select **Choose file**. Images inside the document load if they use a full web address (`https://…`) or are embedded as data URLs.

## Open a folder with images

Images written as relative paths, such as `![Diagram](images/flow.png)`, only work if MDAura can see those image files. Select **Folder** on the home page and choose the folder that contains your Markdown file.

MDAura then:

1. Picks the Markdown file closest to the top of the folder.
2. Reads every image in the folder (`.png`, `.jpg`, `.gif`, `.webp`, `.svg`, `.avif`).
3. Matches each image reference in the document by its path, or by file name if the path does not match.

> If a folder has several Markdown files, MDAura opens the one with the shortest path. Open the others with **Choose file**.

## When a file will not open

| Message | What to do |
|---|---|
| *is not a Markdown file* | Rename the file with a `.md` extension, or choose a different file. |
| *is larger than 50 MB* | Split the document, or move embedded images out into a folder. |
| *That folder has no Markdown file in it* | Choose the folder that directly contains your `.md` file. |
