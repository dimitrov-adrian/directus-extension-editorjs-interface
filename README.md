> ### This extension is in development and most probably will have file structure change when Directus 9 official releases

# Editor.js

Block-styled editor for rich media stories, outputs clean data in JSON.
More info at https://editorjs.io/

## Options

| Option                | Description                                   | Default     |
| --------------------- | --------------------------------------------- | ----------- |
| `placeholder`         | Set text to appear in the canvas              | `''`        |
| `tools`               | What tools to include in the editor           | _See below_ |
| `toolsConfigOverride` | What custom html blocks to show in the editor | `null`      |

### Default tools

```
linktool,
header,
list,
code,
image,
paragraph,
delimeter,
checklist,
quote
```

### Output

```javascript
{
    "version": "2.19.0", // block editor version,
    "time": 1607174917790, // timestamp of content change>,
    "blocks": [
        // {
        // Block data in object
        // }
    ]
}
```
