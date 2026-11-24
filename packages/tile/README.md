# @grafctory/tile

[![npm](https://img.shields.io/npm/v/@grafctory/tile)](https://www.npmjs.com/package/@grafctory/tile)

Preact linked data store and shape-driven value types for [@grafctory/tile](https://github.com/grafctory/tile).

The store an app shares with its screens, and the hooks that bind components to the resources and collections it holds.

Reads and writes go through a [@grafctory/keep](https://github.com/grafctory/keep) store over the fetch client the app
shares through its [@grafctory/clay](https://github.com/grafctory/clay) contexts, so components never handle caching,
batching or validation themselves, and stay focused on what they present to the reader.

# Installation

```shell
npm install @grafctory/tile  # this package
npm install preact          # peer dependency
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://grafctory.github.io/tile/modules/_grafctory_tile.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/grafctory/tile/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/grafctory/tile/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/grafctory/tile?tab=Apache-2.0-1-ov-file) file for details.
