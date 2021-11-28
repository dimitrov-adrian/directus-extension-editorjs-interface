# Editor.js - Directus extension

Block-styled editor for rich media stories, outputs clean data in JSON. More info at https://editorjs.io/

## Installation

In your Directus installation root

```
npm install directus-extension-editorjs
```

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

## Build by yourself and custom usage

You can also clone this repository and build it by yourself.

```
npm ci
npm run build
```

Then use `dist/index.js` in your custom `/extensions/interfaces` directory or in whatever you want.

For more info check https://editorjs.io/base-concepts#what-is-clean-data
