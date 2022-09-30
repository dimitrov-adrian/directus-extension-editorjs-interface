import SimpleImageTool from '@editorjs/simple-image';
import ParagraphTool from '@editorjs/paragraph';
import QuoteTool from '@editorjs/quote';
import WarningTool from '@editorjs/warning';
import ChecklistTool from '@editorjs/checklist';
import DelimiterTool from '@editorjs/delimiter';
import TableTool from '@editorjs/table';
import CodeTool from '@editorjs/code';
import HeaderTool from '@editorjs/header';
import UnderlineTool from '@editorjs/underline';
import EmbedTool from '@editorjs/embed';
import MarkerTool from '@editorjs/marker';
import RawToolTool from '@editorjs/raw';
import InlineCodeTool from '@editorjs/inline-code';
import AlertTool from 'editorjs-alert';
import StrikethroughTool from '@itech-indrustries/editorjs-strikethrough';
import AlignmentTuneTool from 'editorjs-text-alignment-blocktune';
import NestedListTool from '@editorjs/nested-list';
import ListTool from 'editorjs-list';
import ImageTool from './custom-plugins/plugin-image-patch.js';
import AttachesTool from './custom-plugins/plugin-attaches-patch.js';
import PersonalityTool from './custom-plugins/plugin-personality-patch.js';
import InvertedDelimiterTool from '../../editorjs-inverted-delimiter/dist/bundle';
import InlineSmallTool from '../../editorjs-inline-small/dist/bundle';
import ButtonTool from '../../editorjs-button/dist/bundle';
import IframeTool from '../../editorjs-iframe/dist/bundle';
import { EditorJsImage } from './useImage';

export type UploaderConfig = {
	setFileHandler: (handler: any) => void;
	t: Record<string, string>;
	openImageDrawer: () => void;
	onImageEdit: (image: EditorJsImage) => void;
	getImagePreviewUrl: (imageUrl: string) => string;
	getRokkaHash: (imageId: string) => Promise<string>;
};

export default function getTools(
	uploaderConfig: UploaderConfig,
	selection: Array<string>,
	haveFilesAccess: boolean
): Record<string, object> {
	const tools: Record<string, any> = {};
	const fileRequiresTools = ['attaches', 'personality', 'image'];

	const defaults: Record<string, any> = {
		header: {
			class: HeaderTool,
			shortcut: 'CMD+SHIFT+H',
			inlineToolbar: true,
			config: {
				levels: [2, 3, 4],
				defaultLevel: 2,
			},
		},
		list: {
			class: ListTool,
			inlineToolbar: false,
			shortcut: 'CMD+SHIFT+1',
		},
		nestedlist: {
			class: NestedListTool,
			inlineToolbar: true,
			shortcut: 'CMD+SHIFT+L',
		},
		embed: {
			class: EmbedTool,
			inlineToolbar: true,
			config: {
				services: {
					youtube: true,
					vimeo: true,
				},
			},
		},
		paragraph: {
			class: ParagraphTool,
			inlineToolbar: true,
		},
		code: {
			class: CodeTool,
		},
		warning: {
			class: WarningTool,
			inlineToolbar: true,
			shortcut: 'CMD+SHIFT+W',
		},
		underline: {
			class: UnderlineTool,
			shortcut: 'CMD+SHIFT+U',
		},
		strikethrough: {
			class: StrikethroughTool,
		},
		alert: {
			class: AlertTool,
		},
		table: {
			class: TableTool,
			inlineToolbar: true,
		},
		quote: {
			class: QuoteTool,
			inlineToolbar: true,
			shortcut: 'CMD+SHIFT+O',
		},
		marker: {
			class: MarkerTool,
			shortcut: 'CMD+SHIFT+M',
		},
		inlinecode: {
			class: InlineCodeTool,
			shortcut: 'CMD+SHIFT+I',
		},
		inlinesmall: {
			class: InlineSmallTool,
		},
		delimiter: {
			class: DelimiterTool,
		},
		raw: {
			class: RawToolTool,
		},
		checklist: {
			class: ChecklistTool,
			inlineToolbar: true,
		},
		simpleimage: {
			class: SimpleImageTool,
		},
		image: {
			class: ImageTool,
			config: {
				uploader: uploaderConfig,
			},
		},
		attaches: {
			class: AttachesTool,
			config: {
				uploader: uploaderConfig,
			},
		},
		personality: {
			class: PersonalityTool,
			config: {
				uploader: uploaderConfig,
			},
		},
		alignmentTune: {
			class: AlignmentTuneTool,
		},
		inverteddelimiter: {
			class: InvertedDelimiterTool,
		},
		button: {
			class: ButtonTool,
		},
		iframe: {
			class: IframeTool,
		},
	};

	for (const toolName of selection) {
		if (!haveFilesAccess && fileRequiresTools.includes(toolName)) continue;

		if (toolName in defaults) {
			tools[toolName] = defaults[toolName];
		}
	}

	if ('alignmentTune' in tools) {
		if ('paragraph' in tools) {
			tools.paragraph.tunes = ['alignmentTune'];
		}

		if ('header' in tools) {
			tools.header.tunes = ['alignmentTune'];
		}

		if ('quote' in tools) {
			tools.quote.tunes = ['alignmentTune'];
		}
	}

	return tools;
}
