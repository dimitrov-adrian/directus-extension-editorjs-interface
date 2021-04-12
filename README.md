> ### This extension is in development and most probably will have file structure change when Directus 9 official releases. Meanwhile breaking changes are possible in anytime.

# Editor.js

Block-styled editor for rich media stories, outputs clean data in JSON.
More info at https://editorjs.io/

## Options

| Option        | Description                          | Default     |
| ------------- | ------------------------------------ | ----------- |
| `placeholder` | Set text to appear in the canvas     | `''`        |
| `tools`       | What tools to include in the editor  | _See below_ |
| `font`        | Default font family to use in editor | sans-serif  |
| `bordered`    | Displays border around the editor    | `false`     |

### Default tools

- header
- list
- code
- image
- paragraph
- delimeter
- checklist
- quote
- underline

### Output

```javascript
{
    "version": "2.19.0", // block editor version,
    "time": 1607174917790, // timestamp of content change>,
    "blocks": [
        // ...
        {
            "type" : "paragraph",
            "data" : {
                "text" : "Paragraph from editorjs interface in Directus."
            }
        },
        // ...
    ]
}
```
