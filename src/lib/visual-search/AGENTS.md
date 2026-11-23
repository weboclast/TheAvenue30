# Visual search

The engine behind "find pieces like the ones in this photo".

- **The engine, never the panel.** Each demo that mounts it draws its own, such as
  a home section or a camera view in the search dialog. What they share is
  `useVisualSearch` (the states, the drop handling, the scaling, and where focus
  goes), the `onFindSimilar` contract, and `components/visual-search-photo.tsx`.
- **`onFindSimilar` is the 1 seam**, the same shape as every AI surface here. It
  takes the photo as a `File` and returns `VisualMatch[]`: a label, a point on the
  photo, and products, best first. Left out, `demoFindSimilar` answers and the
  panel says it is a demo. No provider SDK ships, and no live call is made, not
  even behind an environment variable.
- **2 ways to fill it, behind the same prop.** A vision model describes the photo
  and each phrase runs through the store's own search, or the photo is matched
  against image embeddings of the catalog in a vector index. A match without a
  point gets a tab and no dot.
- **The photo arrives small.** The hook redraws it as a JPEG at 1280px on its
  long side, which keeps a phone photo under a Server Action's 1 MB body limit.
  Nothing else sends it, and nothing keeps it.
- **A sample is merchandising, not a search.** It answers from its own tags
  (`getVisualSearchSamples`) and never reaches `onFindSimilar`, so the first
  photo a shopper tries always answers well. A sold-out piece keeps its dot and
  shows only its stand-ins.
- **Nothing shows before a photo.** The idle state is the drop target and the
  samples.
- **No match and a failed search are 1 calm state**, with the same next step:
  another photo.
- **Each state marks its own control with `data-search-focus`**, because the
  button pressed leaves with the state it belonged to.
- **A store with departments searches the one on screen**, as text search does,
  and its `onFindSimilar` takes the slug.

Electronics leaves it out: gadgets are bought by model and spec.
