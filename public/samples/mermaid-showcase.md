# Animated Diagrams

Every diagram below reveals itself: nodes blur in, connectors draw, and a glowing bead flows along flowchart edges. Use the **▶ replay** button on any diagram.

## Flowchart

```mermaid
flowchart TD
  U([User]) --> L[Landing page]
  L --> V[Viewer]
  V --> S{Share?}
  S -- Yes --> W[Export to Word]
  W --> K[Send the file]
  S -- No --> E[Export]
```

## Sequence

```mermaid
sequenceDiagram
  participant B as Browser
  participant R as Reader
  participant M as Mermaid
  B->>R: open file
  R->>M: render diagram
  M-->>R: SVG
  R->>R: animate nodes and edges
  R-->>B: document ready
```

## State

```mermaid
stateDiagram-v2
  [*] --> Closed
  Closed --> Reading: open file
  Reading --> Presenting: Marp file
  Reading --> Exporting: export
  Exporting --> Reading: done
  Presenting --> [*]
```

## Entity relationship

```mermaid
erDiagram
  DOCUMENT ||--o{ HEADING : contains
  DOCUMENT ||--o{ DIAGRAM : contains
  HEADING ||--o{ HEADING : nests
```

## Timeline of work

```mermaid
gantt
  title Build plan
  dateFormat  YYYY-MM-DD
  section Product
  Core viewer :done, a1, 2026-10-14, 3d
  Diagram viewer :a2, after a1, 4d
  Share links :a3, after a2, 5d
```

## Pie

```mermaid
pie title Where time goes
  "Reading" : 55
  "Searching" : 25
  "Exporting" : 20
```
