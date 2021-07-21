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
curl -LO https://github.com/dimitrov-adrian/directus-extension-editorjs-interface/releases/latest/download/editorjs.zip
unzip editorjs.zip
```

### Build by yourself

You can also clone this repository and build it by yourself.

## Usage

To use this custom interface into a data model, you have to:

- Add a simple field with **JSON** type
- In the **Interface** section on the left choose **Editor.js**
- Enjoy ! 🎉

### Example output of the interface

```json
{
	"version": "2.19.0",
	"time": 1607174917790,
	"blocks": [
		{
			"type": "paragraph",
			"data": {
				"text": "Paragraph from editorjs interface in Directus."
			}
		}
	]
}
```

For more info check https://editorjs.io/base-concepts#what-is-clean-data
