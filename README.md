bind (for mono)
===============

Bind content and events to the DOM and create DOM Elements.

### Change Log

##### v0.1.1

* added global functions support:
```JSON
{
    "target": ".myClass",
    "on": [{
        "name": "click",
        "handler": "globalFunctionName"
    }]
}
```

Where `globalFunctionName` is a function defined in `window` object.

* added `args` support:
```JSOn
{
    "target": ".myClass",
    "on": [{
        "name": "click",
        "handler": {
            "name": "globalFunctionName",
            "args": [1]
        }
    }]
}
```
The last argument is the `dataContext`.

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
