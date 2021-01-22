import Interface from "./interface.vue";

export default {
	id: "extension-editorjs",
	name: "Editor.js",
	description: "Block-styled editor for rich media stories, outputs clean data in JSON using Editor.js",
	icon: "add_circle",
	component: Interface,
	types: ["json"],
	options: [
		{
			field: "placeholder",
			name: "Placeholder",
			meta: {
				width: "half",
				interface: "text-input",
			},
		},
		{
			field: "font",
			name: "Font",
			type: "string",
			meta: {
				width: "half",
				interface: "dropdown",
				options: {
					choices: [
						{ text: "sans-serif", value: "sans-serif" },
						{ text: "monospace", value: "monospace" },
						{ text: "serif", value: "serif" },
					],
				},
			},
			schema: {
				default_value: "sans-serif",
			},
		},
		{
			field: "tools",
			name: "Tools",
			type: "json",
			schema: {
				default_value: [
					"header",
					"list",
					"code",
					"image",
					"paragraph",
					"delimeter",
					"checklist",
					"quote",
					"underline",
				],
			},
			meta: {
				width: "half",
				interface: "dropdown-multiselect",
				options: {
					choices: [
						{ value: "header", text: "Header" },
						{ value: "list", text: "List" },
						{ value: "embed", text: "Embed" },
						{ value: "paragraph", text: "Paragraph" },
						{ value: "code", text: "Code" },
						{ value: "image", text: "Image" },
						{ value: "warning", text: "Warning" },
						{ value: "attaches", text: "Attaches" },
						{ value: "table", text: "Table" },
						{ value: "quote", text: "Quote" },
						{ value: "marker", text: "Marker" },
						{ value: "simpleimage", text: "Simple Image" },
						{ value: "underline", text: "Underline" },
						{ value: "inlinecode", text: "Inline Code" },
						{ value: "textalign", text: "Align" },
						{ value: "alert", text: "Alert" },
						{ value: "strikethrough", text: "Strikethrough" },
						{ value: "delimiter", text: "Delimiter" },
						{ value: "checklist", text: "Checklist" },
						{ value: "personality", text: "Personality" },
						{ value: "raw", text: "Raw HTML" },
					],
				},
			},
		},
		{
			field: 'bordered',
			name: 'Border',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'toggle',
			},
			schema: {
				default_value: false,
			},
		},
	],
};
