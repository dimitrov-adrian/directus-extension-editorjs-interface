<template>
	<v-dialog
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
					@input="handleFile"
					:multiple="false"
					:folder="folder"
					from-library
					from-url
				/>
			</v-card-text>
			<v-card-actions>
				<v-button secondary @click="unsetFileHandler">
					<i18n-t keypath="cancel" />
				</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<div :class="className" ref="editorElement"></div>
</template>

<script>
import {
	defineComponent,
	ref,
	onMounted,
	onUnmounted,
	watch,
	inject,
} from "vue";
import debounce from "debounce";
import EditorJS from "@editorjs/editorjs";

// Plugins
import SimpleImageTool from "@editorjs/simple-image";
import ParagraphTool from "@editorjs/paragraph";
import QuoteTool from "@editorjs/quote";
import WarningTool from "@editorjs/warning";
import ChecklistTool from "@editorjs/checklist";
import DelimiterTool from "@editorjs/delimiter";
import TableTool from "@editorjs/table";
import CodeTool from "@editorjs/code";
import HeaderTool from "@editorjs/header";
import UnderlineTool from "@editorjs/underline";
import EmbedTool from "@editorjs/embed";
import MarkerTool from "@editorjs/marker";
import RawToolTool from "@editorjs/raw";
import InlineCodeTool from "@editorjs/inline-code";
import TextAlignTool from "@canburaks/text-align-editorjs";
import AlertTool from "editorjs-alert";
import StrikethroughTool from "@itech-indrustries/editorjs-strikethrough";
import ListTool from "./custom-plugins/plugin-list-patch";
import ImageTool from "./custom-plugins/plugin-image-patch";
import AttachesTool from "./custom-plugins/plugin-attaches-patch";
import PersonalityTool from "./custom-plugins/plugin-personality-patch";

export default defineComponent({
	emits: ["input", "error"],
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
			type: Array,
			default: () => [
				"header",
				"list",
				"code",
				"image",
				"paragraph",
				"delimiter",
				"checklist",
				"quote",
				"underline",
			],
		},
		font: {
			type: String,
			default: "sans-serif",
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
	setup(props, { emit, attrs }) {
		const api = inject("api");

		function addQueryToPath(path, query) {
			const queryParams = [];

			for (const [key, value] of Object.entries(query)) {
				queryParams.push(`${key}=${value}`);
			}

			return path.includes('?') ? `${path}&${queryParams.join('&')}` : `${path}?${queryParams.join('&')}`;
		}

		function getToken() {
			return api.defaults.headers?.['Authorization']?.split(' ')[1] || null;
		}

		function addTokenToURL(url, token) {
			const accessToken = token || getToken();
			if (!accessToken) return url;
			return addQueryToPath(url, { access_token: accessToken });
		}

		const editorjsInstance = ref(null);
		const uploaderComponentElement = ref(null);
		const editorElement = ref(null);
		const fileHandler = ref(null);

		const editorValueEmitter = debounce(function saver(context) {
			if (props.disabled || !context) return;

			context.saver
				.save()
				.then((result) => {
					if (!result || result.blocks.length < 1) {
						emit("input", null);
					} else {
						emit("input", result);
					}
				})
				.catch(() => emit("error", "Cannot get content"));
		}, 250);

		onMounted(() => {
			editorjsInstance.value = new EditorJS({
				// @ts-ignore
				logLevel: "ERROR",
				holder: editorElement.value,
				data: getPreparedValue(props.value),
				readOnly: props.disabled,
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
			() => props.disabled,
			(newVal, oldVal) => {
				if (newVal === oldVal || !editorjsInstance.value) return;
				editorjsInstance.value.isReady.then(() => {
					editorjsInstance.value.readOnly.toggle(newVal);
				});
			}
		);

		watch(
			() => props.value,
			(newVal, oldVal) => {
				if (
					!editorjsInstance.value ||
					// @TODO use better method for comparing.
					JSON.stringify(newVal?.blocks) === JSON.stringify(oldVal?.blocks)
				)
					return;

				editorjsInstance.value.isReady.then(() => {
					if (
						editorjsInstance.value.configuration.holder.contains(
							document.activeElement
						) ||
						fileHandler.value !== null
					)
						return;
					editorjsInstance.value.render(getPreparedValue(newVal));
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
			file: props.file,

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

		function unsetFileHandler() {
			fileHandler.value = null;
		}

		function setFileHandler(handler) {
			fileHandler.value = handler;
		}

		function handleFile(event) {
			fileHandler.value(event);
			unsetFileHandler();
		}

		function getUploadFieldElement() {
			return uploaderComponentElement;
		}

		function getPreparedValue(value) {
			if (typeof value !== "object") {
				return {
					time: null,
					version: 0,
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

			const defaults = {
				header: {
					class: HeaderTool,
					shortcut: "CMD+SHIFT+H",
					inlineToolbar: true,
				},
				list: {
					class: ListTool,
					inlineToolbar: true,
					shortcut: "CMD+SHIFT+1",
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
					shortcut: "CMD+SHIFT+W",
				},
				underline: {
					class: UnderlineTool,
					shortcut: "CMD+SHIFT+U",
				},
				textalign: {
					class: TextAlignTool,
					inlineToolbar: true,
					shortcut: "CMD+SHIFT+A",
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
					shortcut: "CMD+SHIFT+O",
				},
				marker: {
					class: MarkerTool,
					shortcut: "CMD+SHIFT+M",
				},
				inlinecode: {
					class: InlineCodeTool,
					shortcut: "CMD+SHIFT+I",
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
			const tools = {};

			for (const toolName of props.tools) {
				// @ts-ignore
				if (defaults.hasOwnProperty(toolName)) {
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
	background-color: var(--background-page);
	border: var(--border-width) solid var(--border-normal);
	border-radius: var(--border-radius);
	padding: var(--input-padding);
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
