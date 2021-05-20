> ### This extension is in development and most probably will have file structure change when Directus 9 official releases. Meanwhile breaking changes are possible in anytime.

# Editor.js

Block-styled editor for rich media stories, outputs clean data in JSON.
More info at https://editorjs.io/

## Installation

Create an `editorjs` folder into the `extensions/interfaces` folder of your Directus project and then copy the `dist/extensions/interfaces/editorjs/index.js` of this repository into it.

You can also clone this repository and build it by yourself.

## Usage

To use this custom interface into a data model, you have to:
- Add a simple field with **JSON** type
- In the **Interface** section on the left choose **Editor.js**
- Enjoy ! 🎉

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
