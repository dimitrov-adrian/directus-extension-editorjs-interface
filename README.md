> ### This extension is in development and most probably will have file structure change when Directus 9 official releases. Meanwhile breaking changes are possible in anytime.

# Editor.js

Block-styled editor for rich media stories, outputs clean data in JSON.
More info at https://editorjs.io/

## Installation

### Directus as npm package

If using Directus as npm package, you can include the extension as package in your `package.json` file as:

```json
	"dependencies": {
		"directus-extension-editorjs": "latest"
	}
```

### Docker installation / extensions directory

If you want to use in docker container or into the extension directory, you need to add it
manualy from the package tar

```bash
cd <your directus extensions directory>/interfaces
curl -LO directus-extension-editorjs-interface.tgz
tar xvf directus-extension-editorjs*.tgz
mv package editorjs
```

### Build by yourself

You can also clone this repository and build it by yourself.

## Usage

To use this custom interface into a data model, you have to:

- Add a simple field with **JSON** type
- In the **Interface** section on the left choose **Editor.js**
- Enjoy ! 🎉

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
