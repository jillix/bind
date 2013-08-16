bind (for mono)
===============

Bind content and events to the DOM and create DOM Elements.

### Change Log

##### v0.1.2

* added global namespaced function support:

```json
{
    "target": ".myClass",
    "on": [{
        "name": "click",
        "handler": "global.function.name"
    }]
}
```

where `global.function.name` can be either a **module** namespaced function or a **global** namesaced function

* added `args` support for `on` handlers:

```json
{
    "target": ".myClass",
    "on": [{
        "name": "click",
        "handler": {
            "name": "globalFunctionName",
            "args": ["an argument"]
        }
    }]
}
```

The `dataContext` will be appended to the given argument array.

##### v0.1.1

* added default value support in `source` value computations:

```json
{
    "html": {
        "source": "key.from.data.context",
        "default": "default value if the source is not found"
    }
}

```
