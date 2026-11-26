# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> [!NOTE]
> Packages published under the `@grafctory` scope from version 0.10.1; earlier versions were published under `@metreeca`.

## [Unreleased](https://github.com/grafctory/tile/compare/v0.11.0...HEAD)

## [0.11.0](https://github.com/grafctory/tile/compare/v0.10.1...v0.11.0) - 2026-11-26

### Added

- `useTally` tells a facet when the values on offer are being retrieved again, so the facet can keep them where they
  stand until the new values arrive ([#16](https://github.com/grafctory/tile/issues/16))

### Changed

- **Breaking**: Upgrade `@grafctory/blue` to `^0.16.0`, `@grafctory/keep` and `@grafctory/keep-rest` to `^0.15.0`,
  and `@grafctory/clay` to `^0.5.0`; projects using Blue, Keep or Clay alongside these packages raise their own ranges
  to the same lines, so that each is shared by both as a single copy. Required localised members stated as `{}` or
  `{ en: [] }` now fail validation: submit text under at least one language tag, or declare the member `optional()`
  in the shape where an empty value is legitimate
- READMEs introduce the packages as part of the Grafctory framework, and email bug reports go to `info@grafctory.dev`
- `Tally` holds its values still while they recompute: a ticked value keeps its place until the new values arrive,
  and clicks and keys are ignored meanwhile, with a spinner showing from the moment the reader acts, so values ticked
  in a row never land on another one sliding under the pointer ([#16](https://github.com/grafctory/tile/issues/16))

### Fixed

- `Tally` ticks a value when the reader presses its name, rather than leaving the catalogue for the resource it
  names: a linked resource is reached through a separate link following the name ([#11](https://github.com/grafctory/tile/issues/11))
- `Table` keeps its headers in view while the rows scroll past, now that the design system lets native tables scroll
  on their own: the page or the area holding the table scrolls it instead ([#15](https://github.com/grafctory/tile/issues/15))

## [0.10.1](https://github.com/grafctory/tile/compare/v0.10.0...v0.10.1) - 2026-11-24

### Changed

- Maintenance release with no change to the published API or behaviour

## [0.10.0](https://github.com/grafctory/tile/compare/v0.9.0...v0.10.0) - 2026-11-20

### Added

- `useMembers` lets a page keep the sort order and the number of items on show wherever it likes, so that a catalogue
  the reader returns to grows back to where they left it: `order` and `limit` restore them as the members bind,
  `onChange` takes both once for every change, and `basis` states the order `reset` restores ([#8](https://github.com/grafctory/tile/issues/8))
- `useTally` and `useRange` take an `eager` option retrieving the values at once, for a binding that no facet shows
  and so nothing else would ever ask for its values ([#9](https://github.com/grafctory/tile/issues/9))

### Changed

- **Breaking**: Upgrade `@metreeca/clay` to `^0.4.0`; projects using it alongside these packages raise their own range
  to match as well, so that it is shared by both as a single copy and the contexts it provides reach every binding
- **Breaking**: `useMembers` reads `order` only as the members start over, no longer whenever it changes, so that a
  page handing back what `onChange` takes doesn't retrieve the items twice; a page sorting the items again from outside
  its lens calls the `sort` function the members hand over instead of handing over a new `order`
- **Breaking**: `useTally` and `useRange` wait in a new `idle` case until asked for their values, unless created
  `eager` or narrowing the collection already, and the `Tally` and `Range` facets ask only once open or turned to, so
  that a page whose facets the reader never opens costs the store nothing; code matching every case of either binding
  handles `idle` as well, calling its `load` function to have the values retrieved ([#9](https://github.com/grafctory/tile/issues/9))
- `Tally` scrolls its values back to the top as one is ticked or unticked, so the reader sees at once the values
  ticked, which lead the list, without hunting for them in a list scrolled down to reach the value just changed
- `useQuery` keeps the criteria of each history entry on browsers supporting the Navigation API, so that a page reached
  again through the history comes back as the reader left it, even after they emptied its criteria there

## [0.9.0](https://github.com/grafctory/tile/compare/v0.8.0...v0.9.0) - 2026-11-19

### Changed

- **Breaking**: Upgrade `@metreeca/blue` and `@metreeca/qest` to `^0.15.0`, and `@metreeca/keep` and
  `@metreeca/keep-rest` to `^0.14.0`; projects using them alongside these packages raise their own ranges to match as
  well, so that each of them is shared by both as a single copy. `useQuery` now keeps the page criteria in the browser
  location in the plainer encoding `@metreeca/qest` writes, while locations bookmarked earlier keep being read

## [0.8.0](https://github.com/grafctory/tile/compare/v0.7.0...v0.8.0) - 2026-11-19

### Changed

- **Breaking**: Upgrade `@metreeca/clay` to `^0.3.0`; projects using it alongside these packages raise their own range
  to match as well, so that it is shared by both as a single copy and the contexts it provides reach every binding
- **Breaking**: `@metreeca/tile` takes `@metreeca/clay` as a peer dependency, and `@metreeca/tile-widgets` takes both
  `@metreeca/clay` and `@metreeca/tile`, so that an app installs a single copy of each and every widget reads the
  router, client and store the app sets up; apps declare these packages among their own dependencies

## [0.7.0](https://github.com/grafctory/tile/compare/v0.6.1...v0.7.0) - 2026-11-17

### Added

- `@metreeca/tile-widgets` — new package collecting the widgets bound to the collection shared across a screen: the
  `Frame`, `Sheet` and `Table` lenses, the `Search`, `Tally` and `Range` facets gathered by `Facets`, the `Clear`
  collection reset and the `Count` collection counter; glyphs are drawn with `lucide-preact`, a peer dependency the
  app installs, and an app distributing a build ships the Lucide licence notices the package README names
- `@metreeca/tile/types` — shape-driven value types, showing a stored value to a reader, handing it to a native input
  and reading back what the input yields, with `toType` picking the default type for a shape and `as()` showing a
  value as another type, as `instant.as(date)` shows and bounds instants by day
- `@metreeca/tile` — collection bindings sharing one collection across a screen: `useMembers` growing the
  items a batch at a time, `useActions` adding and removing them, `useCount`, `useSearch`, `useTally` and `useRange`
  narrowing them, and `useQuery` keeping the page criteria in the browser location
- `@metreeca/tile` — `locale` on `Store`, retrieving localised content in the languages the reader prefers, so every
  binding shows, searches and sorts text in one language; it defaults to the languages the browser reports
- `@metreeca/tile` — `scope` criteria on `useCollection`, fixing which items a collection holds beyond the
  reach of the reader: every widget retrieves under them, and clearing the collection keeps them in place

### Changed

- **Breaking**: Upgrade `@metreeca/blue`, `@metreeca/core` and `@metreeca/qest` to `^0.14.0`, `@metreeca/http` to
  `^0.6.0`, and `@metreeca/keep` and `@metreeca/keep-rest` to `^0.13.0`; projects using them alongside these packages
  raise their own ranges to match as well, so that each of them is shared by both as a single copy
- `@metreeca/tile-data` — **Breaking**: split in two. The app contexts and the `asset`, `board`, `fetch`, `model`,
  `router` and `storage` hooks move to [@metreeca/clay](https://github.com/grafctory/clay), while the `store` bindings
  become the whole of `@metreeca/tile`, which takes over the name the design system leaves (migration: import `app`
  and those hooks from `@metreeca/clay`, and replace `@metreeca/tile-data/store` with `@metreeca/tile` in imports)
- `@metreeca/tile-cell`, `@metreeca/tile-hive` and `@metreeca/tile-move` — **Breaking**: moved to
  [@metreeca/clay](https://github.com/grafctory/clay), the widgets and layouts as `@metreeca/clay-widgets`, the
  Markdown document with its table of contents as `@metreeca/clay-markdown`, and the movable items as the `transfer`
  and `roving` modules of `@metreeca/clay`, rendering `<clay-*>` elements tuned through `--clay-*` knobs (migration:
  replace the package names in dependencies and import paths, and `tile-` with `clay-` in the selectors and custom
  properties that stylesheets and inline styles aim at the elements, wherever an app restyles or retunes them)
- `@metreeca/tile` — **Breaking**: `useCollection` binds a screen to the collection held by a resource,
  shared by every widget on it, rather than retrieving items (migration: retrieve items through `useMembers`)

### Removed

- `@metreeca/tile` — **Breaking**: the design system moves to its own `@metreeca/skin` package, renaming the
  `--tile--*` tokens to `--skin--*`, the `tile` token map to `skin` and the `tile` cascade layer to `skin` (migration:
  depend on `@metreeca/skin`, import from it, and replace the `--tile--` prefix in stylesheets and inline styles)
- `@metreeca/tile-lens` — **Breaking**: superseded by the new `@metreeca/tile-widgets` package (migration: replace the
  package name in dependencies and import paths, as in `@metreeca/tile-widgets/sheet`, and hand `Sheet` the `members`
  relay returned by `useMembers` in place of the `entry`, `shape` and `model` props)
- `@metreeca/tile-form` — empty placeholder package dropped, as the fields join the lenses and facets in
  `@metreeca/tile-widgets` (migration: remove the dependency, which never exported anything)

### Security

- Upgrade the `vitest` development dependency to `^5.0.3`, fixing GHSA-xp26-3454-mjgp and GHSA-qxg6-89mg-rqv8 in
  the test tooling; published packages are not affected
- Upgrade the `happy-dom` development dependency to `^21.0.4`, fixing GHSA-834v-8h66-3h79 in the DOM environment the
  test suites run on; published packages are not affected, as `happy-dom` never reaches their consumers

## [0.6.1](https://github.com/grafctory/tile/compare/v0.6.0...v0.6.1) - 2026-10-21

### Security

- Upgrade the `vite` development dependency to `^8.3.5`, fixing GHSA-587h-7wmj-h5pm, GHSA-r825-w8mm-5pxw and
  GHSA-698v-4r3x-3vcv in the build and specimen tooling; published packages are not affected
- Upgrade the `markdown-it` documentation tooling dependency to `14.3.3`, fixing GHSA-gfr2-rv44-r23c and
  GHSA-vfgh-jcmw-g37q in the API reference build; published packages are not affected

## [0.6.0](https://github.com/grafctory/tile/compare/v0.5.1...v0.6.0) - 2026-10-20

### Changed

- Upgrade `@metreeca/blue` to `^0.13.0`
- Upgrade `@metreeca/core` to `^0.13.0`
- Upgrade `@metreeca/http` to `^0.5.0`
- Upgrade `@metreeca/keep` to `^0.12.0`
- Upgrade `@metreeca/keep-rest` to `^0.12.0`
- Upgrade `@metreeca/qest` to `^0.13.0`

## [0.5.1](https://github.com/grafctory/tile/compare/v0.5.0...v0.5.1) - 2026-10-14

### Fixed

- `@metreeca/tile-cell/icon` — glyph sizing kept in production bundles, which dropped the icon stylesheet and left
  glyphs at the oversized Lucide defaults wherever `Icon` was imported, toasts and the shell included

## [0.5.0](https://github.com/grafctory/tile/compare/v0.4.0...v0.5.0) - 2026-10-14

### Added

- `@metreeca/tile-hive/guard` — `Guard` failure boundary showing a fallback in place of a component that failed to
  render, and raising the failure on the shared board while the rest of the screen keeps working
- `@metreeca/tile-hive/toast` — bug glyph marking `defect` posts, painted on the fail step like ordinary failures

### Changed

- `@metreeca/tile-data/board` — **breaking**: `Status` gains a `defect` member for faults of the interface itself,
  and `raise` posts errors and any other value that is not problem details as a `defect` instead of a `failure`
  (migration: add a `defect` branch to every exhaustive `switch` over `Status`, and match `"defect"` wherever raised
  issues are picked out by `status === "failure"`, since broken scripts and failed renders now reach the board so)
- `@metreeca/tile-data/board` — only the outermost `Board` takes up broken scripts and unhandled rejections, so a
  page issue is stated once however many boards are nested, while each board keeps the posts of its own components
- `@metreeca/tile-cell` — no longer depends on `@metreeca/http`, which none of its modules imports

## [0.4.0](https://github.com/grafctory/tile/compare/v0.3.0...v0.4.0) - 2026-10-14

### Added

- `@metreeca/tile-move` — new package of movable items: `Placeable` card boards moving cards between grid cells and
  `Sortable` lists reordering items within and across lists, dragged by a grip or by their whole surface with the
  pointer, by touch or with the keyboard, with moves handed to `onMove` and dropped items gliding into place
- `@metreeca/tile-data/board` — shared status board (`Board`, `useBoard`, `usePosts`) collecting posts by status and
  raising failures as posts
- `@metreeca/tile-data/storage` — `useStorage` hook binding a component to a Web Storage entry
- `@metreeca/tile-data/model` — `useModel` takes a dependency list and creates the model again whenever a dependency
  changes, compared for deep equality
- `@metreeca/tile-hive/toast` — `Toast` stack showing the posts on the shared board as transient notices
- `@metreeca/tile-cell/more` — `More` incremental loading trigger, firing as it scrolls into view
- `@metreeca/tile-lens/sheet` — `Sheet` incremental collection list, virtualised over a sliding window of items
- `@metreeca/tile-cell/note` — check mark for highlight notes and a distinct alert for critical ones
- `@metreeca/tile` — `colorInfoStroke`, `colorPassStroke`, `colorWarnStroke` and `colorFailStroke` status text
  tokens, the `backgroundColorGlass` elevation token, and select menus drawn with a chevron

### Changed

- Upgrade `@metreeca/core` to `^0.12.1`
- Upgrade `@metreeca/blue` to `^0.12.1`
- Upgrade `@metreeca/http` to `^0.4.1`
- Upgrade `@metreeca/qest` to `^0.12.1`
- Upgrade `@metreeca/keep` to `^0.11.1`
- Upgrade `@metreeca/keep-rest` to `^0.11.1`
- `@metreeca/tile` — `colorInfo` and `colorPass` hold mark contrast (3:1) rather than text contrast in the light
  scheme: status text takes the matching stroke token
- `@metreeca/tile-cell/button` — status button labels hold AA contrast through the stroke roles

### Removed

- `@metreeca/tile-data/faults` — **breaking**: `Faults`, `useFaults` and `useRaise` removed in favour of the shared
  status board (`useRaise()(issue)` → `useBoard().raise(issue)`)
- `@metreeca/tile-cell/fault` — **breaking**: `Fault` removed in favour of the `Toast` stack in
  `@metreeca/tile-hive/toast`
- `@metreeca/tile-lens` — **breaking**: root entry point and the empty placeholder modules removed

## [0.3.0](https://github.com/grafctory/tile/releases/tag/v0.3.0) - 2026-10-02

### Added

- `@metreeca/tile` — `padding` spacing token, `color`, `backgroundColor`, `padding`, `borderRadius` and `boxShadow`
  style properties, and exported token group types
- `@metreeca/tile` — enlarged images shown on a rounded panel over the whole viewport, and every heading level sized
  from the heading size token
- `@metreeca/tile-data/store` — shared resource store (`Store`, `useStore`) with `useResource` and `useCollection`
  bindings over `@metreeca/keep`
- `@metreeca/tile-data/router` — nested `Routes` tables routing the trailing path of a section, with subtree patterns
  and a bare `*` catch-all inherited by nested tables
- `@metreeca/tile-cell/hint` — pointer hint naming a control, a button standing on a glyph alone included
- `@metreeca/tile-cell` — `title` hint on links, `Reload` and `Dismiss` icon roles, and the GitHub mark
- `@metreeca/tile-hive/box`, `/stack` and `/strip` — styled box, vertical stack and horizontal strip layouts with
  split placements
- `@metreeca/tile-hive/shell` — `copy` slot under the content, with the done action taken off show while exchanges
  are in flight

### Changed

- `@metreeca/tile-data/router` — **breaking**: `Router` drops the `mode` (hash routing) and `fallback` props, in favour
  of catch-all patterns in `Routes`; route tables are declared only in `Routes`
  (`<Router fallback={view}>` → `<Routes>{{ ..., "*": view }}</Routes>`)
- `@metreeca/tile-data/router` — **breaking**: the navigator takes the `replace` flag in the navigation object rather
  than as a second argument (`navigate(route, true)` → `navigate({ route, replace: true })`)
- `@metreeca/tile-data/router` — **breaking**: every same-site link is followed in place, and `Routes` renders nothing
  while it moves the location
- `@metreeca/tile-cell/fault` — **breaking**: `text` and `children` props removed; reader-actionable faults are told by
  their `detail` (`<Fault text={wording}/>` → a problem carrying `detail: wording`)
- `@metreeca/tile-data` — depends on `@metreeca/blue` and `@metreeca/qest` `^0.12.0`, and on `@metreeca/keep` and
  `@metreeca/keep-rest` `^0.11.0`
- `@metreeca/tile-data`, `/tile-cell`, `/tile-hive` and `/tile-lens` — require `@metreeca/core` `^0.12.0`, and
  `@metreeca/http` `^0.4.0` where they depend on it

### Fixed

- `@metreeca/tile` — scheme-varying colours stated as `light-dark()` pairs
- `@metreeca/tile-cell` — glyphs and link logos centred on the text, neutral button hover and press painted once, note
  code blocks laid out as written, subtle links set in the surrounding face
- `@metreeca/tile-hive/shell` — headers held to the height of a subtle button, focus rings kept whole, columns clipped
  to their width with wide content scrolled across, and the menu kept at the end of a header without a heading

## [0.2.0](https://github.com/grafctory/tile/releases/tag/v0.2.0)

Initial release of the Metreeca Tile minimalist model-driven UI toolkit, superseding the legacy `@metreeca/tile` 4.x
line: a design system published as CSS tokens and base rules, with Preact bindings wiring components to headless
`@metreeca/core` state and `@metreeca/http` clients. `@metreeca/tile-lens` and `@metreeca/tile-form` claim their
package names ahead of the linked data views and forms they will carry.

- `@metreeca/tile` — design system tokens (colours, palettes, typography, spacings, scalings, borders, elevations,
  layers, motions, opacities, viewports, visuals), base markup rules, `data-theme` colour scheme pinning and the
  `css()` / `css.var()` helpers
- `@metreeca/tile-data` — shared faults, shared fetch client, headless component state and client-side routing
- `@metreeca/tile-cell` — button, fault, icons, link, logo and note widgets
- `@metreeca/tile-hive` — shell, styled area and tabbed panel containers
- `@metreeca/tile-lens` — linked data selection state
- `@metreeca/tile-form` — placeholder for linked data forms
