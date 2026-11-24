# @grafctory/tile

Linked data UI toolkit for Preact.

Preact lenses, facets and fields for [@grafctory/qest](https://github.com/grafctory/qest) linked data APIs:

- **Shape-Driven Screens**: the [@grafctory/blue] shapes shared with the server decide what screens show and accept
- **Accessible Widgets**: labelled controls, keyboard paths and status announcements designed to WCAG 2.2 AA
- **Store-Backed Resources**: a [@grafctory/keep] store keeps caching, batching and validation out of interface code

Screens are composed in JSX from linked data lenses, facets and fields, running within the contexts and hooks of
[@grafctory/clay](https://github.com/grafctory/clay), and leave the exchange of resources to the store.

Their look comes from the [@grafctory/skin] design tokens alone: components render without the skin stylesheet, and
follow the platform colour scheme once it is loaded, or whatever theme the app sets there instead.

# Installation

```shell
npm install @grafctory/skin            # design system stylesheet, optional
npm install @grafctory/clay            # contexts and hooks the store runs within
npm install @grafctory/tile            # linked data store and value types
npm install @grafctory/tile-widgets    # linked data lenses, facets and fields
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Add the widgets package where the app's screens show linked data, with the peer dependencies its README lists. An
app brands whatever Tile renders by overriding the [@grafctory/skin] tokens, as its
[theming guide](https://github.com/grafctory/skin#theming) explains for each family of tokens it defines.

| Package                  | Description                                    |
|--------------------------|------------------------------------------------|
| [@grafctory/tile]         | Linked data store and shape-driven value types |
| [@grafctory/tile-widgets] | Linked data widgets                            |
| [@grafctory/tile-charts]  | Linked data charts (planned)                   |
| [@grafctory/tile-topics]  | SKOS topic widgets (planned)                   |
| [@grafctory/tile-apis]    | API documentation widgets (planned)            |

[@grafctory/skin]: https://grafctory.github.io/skin/

[@grafctory/blue]: https://github.com/grafctory/blue

[@grafctory/keep]: https://github.com/grafctory/keep

[@grafctory/tile]: https://grafctory.github.io/tile/modules/_grafctory_tile.html

[@grafctory/tile-widgets]: https://grafctory.github.io/tile/modules/_grafctory_tile-widgets.html

[@grafctory/tile-charts]: https://grafctory.github.io/tile/modules/_grafctory_tile-charts.html

[@grafctory/tile-topics]: https://grafctory.github.io/tile/modules/_grafctory_tile-topics.html

[@grafctory/tile-apis]: https://grafctory.github.io/tile/modules/_grafctory_tile-apis.html

# Usage

> [!NOTE]
>
> Each package documents its own API in its README and API reference; for complete coverage, see the
> [API reference](https://grafctory.github.io/tile/).

# Support

- open an [issue](https://github.com/grafctory/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/grafctory/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/grafctory/tile?tab=Apache-2.0-1-ov-file) file for details.
