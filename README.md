bind (for mono)
===============

Bind content and events to the DOM and create DOM Elements.

### Change Log

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
