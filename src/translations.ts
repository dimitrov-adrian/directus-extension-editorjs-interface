import { I18nConfig } from '@editorjs/editorjs';

export default function getTranslations(t: (str: string) => string): I18nConfig {
	return {
		messages: {
			ui: {
				blockTunes: {
					toggler: {
						'Click to tune': t('layout_options'),
					},
				},
				toolbar: {
					toolbox: {
						Add: t('create'),
					},
				},
			},
			toolNames: {
				Text: t('text'),
				Heading: t('wysiwyg_options.heading'),
				List: t('wysiwyg_options.bullist'),
				Warning: t('warning'),
				Checklist: t('interfaces.select-multiple-checkbox.checkboxes'),
				Quote: t('wysiwyg_options.blockquote'),
				Code: t('interfaces.input-code.code'),
				Image: t('interfaces.file-image.image'),
				Attaches: t('file'),
				Delimiter: t('wysiwyg_options.hr'),
				'Raw HTML': t('wysiwyg_options.codeblock'),
				Table: t('wysiwyg_options.table'),
				Link: t('wysiwyg_options.link'),
				Bold: t('wysiwyg_options.bold'),
				Underline: t('wysiwyg_options.underline'),
				Italic: t('wysiwyg_options.italic'),
				Inlinecode: t('inline'),
				Strikethrough: t('wysiwyg_options.strikethrough'),
			},
			tools: {
				link: {
					Link: t('wysiwyg_options.link'),
					'Add a link': t('field_options.directus_roles.fields.link_placeholder'),
				},
				image: {
					Caption: t('title'),
					// 'Couldn’t upload image. Please try another.': t(''),
				},
				warning: {
					Title: t('title'),
					Message: t('note'),
				},
				code: {
					'Enter a quote': t('wysiwyg_options.blockquote'),
				},
				nestedlist: {
					Ordered: t('wysiwyg_options.numlist'),
					Unordered: t('wysiwyg_options.bullist'),
				},
				embed: {
					'Enter a caption': t('field_options.directus_roles.fields.name_placeholder'),
				},
			},
			blockTunes: {
				delete: {
					Delete: t('delete_label'),
				},
			},
		},
	};
}
