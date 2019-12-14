# eslint-plugin-small-import

ESLint rule for preventing the full import of big libraries when just a part of it can be imported.

![small-import.gif](small-import.gif)

## Installation

```
npm i eslint-plugin-small-import
```

Add this to your `.eslintrc` or your config::
```json
"plugins": ["small-import"],
"rules": {
    "small-import/no-full-import": "error"
}
```

## Disallow full import (no-full-import)
Some JavaScript libraries are a vast collection of independent helpers functions which are combined in one package, such as [`lodash`](https://lodash.com) or [`date-fns`](https://date-fns.org/). If you import one of their functions, you usually import the full suite of functions, causing higher memory consumption, startup time and bundle sizes.

The solution for this problem is to import each function directly from it's location in the package rather than the index file of the package. However, it is more tedious since more code has to be written.

### Rule details

This rule will automatically detect these cases and convert the imports. It supports `lodash`, `date-fns` and `rambda`
 out of the box, but can be configured to support more libraries as well.

### Options

A map of packages can be supplied, where the keys are the names of the libraries and the values are the location of the distinct functions within the package. More practically, the values determine what gets put inbetween the package name and the function name. The default configuration is:

```json
["error", {
    "packages": {
        "lodash": "/",
        "date-fns": "/",
        "rambda": "/src/"
    }
}]
```

### Examples

Examples of **correct** code for this rule:

```js
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'
import format from 'date-fns/format'
import append from 'rambda/src/append'
```

Examples of **incorrect** code for this rule:

```js
import {sortBy, groupBy} from 'lodash'
import {format} from 'date-fns'
import {append} from 'rambda'
```

### When Not To Use It
If your application is not sensitive to memory consumption, startup time or bundle size, e.g. in a script, then you can disable this rule.

If you are not using the `import` syntax yet, it's not supported by this rule.

If you don't use packages which would cause this problem, you can disable this rule.

### Related rules
- [eslint-plugin-lodash/import-scope](https://github.com/wix/eslint-plugin-lodash/blob/HEAD/docs/rules/import-scope.md)

### License
MIT

## Author
© [Jonny Burger](https://jonny.io)
