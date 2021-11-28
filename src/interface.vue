<template>
	<v-dialog
		v-if="haveFilesAccess"
		:model-value="fileHandler !== null"
		@update:model-value="unsetFileHandler"
		@esc="unsetFileHandler"
	>
		<v-card>
			<v-card-title>
				<i18n-t keypath="upload_from_device" />
			</v-card-title>
			<v-card-text>
				<v-upload
					:ref="uploaderComponentElement"
					:multiple="false"
					:folder="folder"
					from-library
					from-url
					@input="handleFile"
				/>
			</v-card-text>
			<v-card-actions>
				<v-button secondary @click="unsetFileHandler">
					<i18n-t keypath="cancel" />
				</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<div ref="editorElement" :class="className"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch, PropType } from 'vue';
import { useApi, useStores } from '@directus/extensions-sdk';
import debounce from 'lodash/debounce';
import EditorJS from '@editorjs/editorjs';
import useDirectusUrl from './directus-url';

// Plugins
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
import TextAlignTool from '@canburaks/text-align-editorjs';
import AlertTool from 'editorjs-alert';
import StrikethroughTool from '@itech-indrustries/editorjs-strikethrough';
import ListTool from './custom-plugins/plugin-list-patch';
import ImageTool from './custom-plugins/plugin-image-patch';
import AttachesTool from './custom-plugins/plugin-attaches-patch';
import PersonalityTool from './custom-plugins/plugin-personality-patch';

export default defineComponent({
	props: {
		value: {
			type: Object,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		placeholder: {
			type: String,
			default: null,
		},
		tools: {
			type: Array as PropType<string[]>,
			default: () => ['header', 'list', 'code', 'image', 'paragraph', 'delimiter', 'checklist', 'quote', 'underline'],
		},
		font: {
			type: String,
			default: 'sans-serif',
		},
		bordered: {
			type: Boolean,
			default: true,
		},
		folder: {
			type: String,
			default: undefined,
		},
	},

	emits: ['input'],

	setup(props, { emit, attrs }) {
		const api = useApi();
		const { addTokenToURL } = useDirectusUrl(api);
		const { useCollectionsStore } = useStores();
		const collectionStore = useCollectionsStore();

		const editorjsInstance = ref<EditorJS>();
		const uploaderComponentElement = ref(null);
		const editorElement = ref<HTMLElement>();
		const fileHandler = ref<Function | null>(null);
		const haveFilesAccess = Boolean(collectionStore.getCollection('directus_files'));
		const editorValueEmitter = debounce(emitValue, 250);

		onMounted(() => {
			editorjsInstance.value = new EditorJS({
				logLevel: 'ERROR' as EditorJS.LogLevels,
				holder: editorElement.value,
				data: getPreparedValue(props.value),
				// Readonly makes troubles in some cases, also requires all plugins to implement it.
				// https://github.com/codex-team/editor.js/issues/1669
				readOnly: false,
				placeholder: props.placeholder,
				tools: buildToolsOptions(),
				minHeight: 24,
				onChange: editorValueEmitter,
			});

			if (attrs.autofocus) {
				editorjsInstance.value.focus();
			}
		});

		onUnmounted(() => {
			if (!editorjsInstance.value) return;

			editorjsInstance.value.destroy();
		});

		watch(
			() => props.value,
			(newVal, oldVal) => {
				if (
					!editorjsInstance.value ||
					// @TODO use better method for comparing.
					JSON.stringify(newVal?.blocks) === JSON.stringify(oldVal?.blocks)
				) {
					return;
				}

				editorjsInstance.value.isReady.then(() => {
					if (
						editorjsInstance.value.configuration.holder.contains(document.activeElement) ||
						fileHandler.value !== null
					) {
						return;
					}

					if (editorjsInstance.value) {
						editorjsInstance.value.render(getPreparedValue(newVal));
					}
				});
			}
		);

		return {
			editorjsInstance,
			editorElement,
			uploaderComponentElement,
			fileHandler,
			className: {
				[props.font]: true,
				bordered: props.bordered,
			},
			haveFilesAccess,

			// Methods
			editorValueEmitter,
			unsetFileHandler,
			setFileHandler,
			handleFile,
			getUploadFieldElement,
			addTokenToURL,
			getPreparedValue,
			buildToolsOptions,
		};

		async function emitValue(context: EditorJS): Promise<void> {
			if (props.disabled || !context) return;

			let result: EditorJS.OutputData | null = null;
			try {
				result = await context.saver.save();
			} catch (error) {
				console.warn('editorjs-extension: %s', error);
			}

			if (!result || result.blocks.length < 1) {
				emit('input', null);
			} else {
				emit('input', result);
			}
		}

		function unsetFileHandler() {
			fileHandler.value = null;
		}

		function setFileHandler(handler: Function) {
			fileHandler.value = handler;
		}

		function handleFile(event: InputEvent) {
			if (fileHandler.value) {
				fileHandler.value(event);
			}

			unsetFileHandler();
		}

		function getUploadFieldElement() {
			return uploaderComponentElement;
		}

		function getPreparedValue(value: any): EditorJS.OutputData {
			if (typeof value !== 'object') {
				return {
					time: 0,
					version: '0.0.0',
					blocks: [],
				};
			}

			return {
				time: value?.time,
				version: value?.version,
				blocks: value?.blocks || [],
			};
		}

		/**
		 * @returns {{}}
		 */
		function buildToolsOptions() {
			const uploaderConfig = {
				addTokenToURL,
				baseURL: api.defaults.baseURL,
				picker: setFileHandler,
				getUploadFieldElement,
			};

			const defaults: Record<string, object> = {
				header: {
					class: HeaderTool,
					shortcut: 'CMD+SHIFT+H',
					inlineToolbar: true,
				},
				list: {
					class: ListTool,
					inlineToolbar: true,
					shortcut: 'CMD+SHIFT+1',
				},
				embed: {
					class: EmbedTool,
					inlineToolbar: true,
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
				textalign: {
					class: TextAlignTool,
					inlineToolbar: true,
					shortcut: 'CMD+SHIFT+A',
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
			};

			// Build current tools config.
			const tools: Record<string, object> = {};
			const fileRequiresTools = ['attaches', 'personality', 'image'];
			for (const toolName of props.tools) {
				if (!haveFilesAccess && fileRequiresTools.includes(toolName)) continue;

				if (toolName in defaults) {
					tools[toolName.toString()] = defaults[toolName];
				}
			}

			return tools;
		}
	},
});
</script>

<style lang="css" scoped>
.bordered {
	padding: var(--input-padding);
	background-color: var(--background-page);
	border: var(--border-width) solid var(--border-normal);
	border-radius: var(--border-radius);
}

.bordered:hover {
	border-color: var(--border-normal-alt);
}

.bordered:focus-within {
	border-color: var(--primary);
}

.monospace {
	font-family: var(--family-monospace);
}

.serif {
	font-family: var(--family-serif);
}

.sans-serif {
	font-family: var(--family-sans-serif);
}
</style>

<style src="./editorjs-content-reset.css"></style>
<style src="./editorjs-components.css"></style>
