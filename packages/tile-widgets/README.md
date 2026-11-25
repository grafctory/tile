# @grafctory/tile-widgets

[![npm][npm-badge]][npm] [![Grafctory][grafctory-badge]][grafctory]

[npm-badge]: https://img.shields.io/npm/v/@grafctory/tile-widgets
[npm]: https://www.npmjs.com/package/@grafctory/tile-widgets
[grafctory-badge]: https://img.shields.io/badge/part%20of-Grafctory-blue
[grafctory]: https://github.com/grafctory

Preact linked data widgets for [@grafctory/tile].

Lenses presenting resources and their collections, facets narrowing those collections and fields writing resources
back, all driven by shapes: the model decides which properties are shown, how each value reads and how a collection is
narrowed, so a model change reaches every screen showing the affected resources with no widget code to update by hand.

Widgets read their data through the [@grafctory/tile] store the app provides, and
take their look from the [@grafctory/skin] tokens an app restates for its brand.

[@grafctory/tile]: https://github.com/grafctory/tile
[@grafctory/skin]: https://github.com/grafctory/skin

# Installation

```shell
npm install @grafctory/tile-widgets  # this package
npm install preact                  # peer dependency
npm install lucide-preact           # peer dependency
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://grafctory.github.io/tile/modules/_grafctory_tile-widgets.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/grafctory/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/grafctory/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/grafctory/tile?tab=Apache-2.0-1-ov-file) file for details.

The widgets draw their glyphs with [Lucide](https://lucide.dev/), licensed under ISC, with the icons derived from
[Feather](https://feathericons.com/) under MIT. An app distributing a build that includes the widgets must ship both
notices with it. The `LICENSE` file of the `lucide-preact` package carries them, ready to copy into a notice file.

<sub>Grafctory™ is a trademark of Metreeca srl.</sub>
