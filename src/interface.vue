<template>
	<div>
		<v-dialog
			:active="fileHandler !== null"
			@toggle="unsetFileHandler"
			@esc="unsetFileHandler"
		>
			<v-card>
				<v-card-title>{{ $t("upload_from_device") }}</v-card-title>
				<v-card-text>
					<v-upload
						ref="vUploaderComponentRef"
						@input="handleFile"
						:multiple="false"
						from-library
						from-url
					/>
				</v-card-text>
				<v-card-actions>
					<v-button secondary @click="unsetFileHandler">
						{{ $t("cancel") }}
					</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<div :class="className" ref="editorElement"></div>
	</div>
</template>

<script>
import EditorJS from "@editorjs/editorjs";
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

export default {
	props: {
		value: {
			type: Object,
			default: null
		},
		disabled: {
			type: Boolean,
			default: false
		},
		placeholder: {
			type: String,
			default: null
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
				"underline"
			]
		},
		font: {
			type: String,
			default: "sans-serif"
		},
		bordered: {
			type: Boolean,
			default: false
		}
	},

	inject: ["system"],

	mounted: function() {
		this.editorjsInstance = new EditorJS({
			logLevel: "ERROR",
			holder: this.$refs.editorElement,
			data: this.getPreparedValue(this.$props.value),
			readOnly: this.$props.disabled,
			placeholder: this.$props.placeholder,
			tools: this.buildToolsOptions(),
			minHeight: 24,
			onChange: this.editorValueEmitter
		});
	},

	unmounted: function() {
		if (this.editorjsInstance) {
			this.editorjsInstance.destroy();
		}
	},

	data: function() {
		return {
			fileHandler: null,
			editorjsInstance: null,
			className: {
				[this.$props.font]: true,
				bordered: this.$props.bordered
			}
		};
	},

	watch: {
		value: function(newVal, oldVal) {
			if (
				!this.editorjsInstance ||
				// @TODO use better method for comparing.
				JSON.stringify(newVal?.blocks) === JSON.stringify(oldVal?.blocks)
			)
				return;

			this.editorjsInstance.isReady.then(() => {
				if (
					this.editorjsInstance.configuration.holder.contains(
						document.activeElement
					) ||
					this.fileHandler !== null
				)
					return;

				this.editorjsInstance.render(this.getPreparedValue(newVal));
			});
		},
		disabled: function(newVal, oldVal) {
			if (newVal !== oldVal) {
				this.editorjsInstance.isReady.then(() => {
					this.editorjsInstance.readOnly.toggle(newVal);
				});
			}
		}
	},

	methods: {
		unsetFileHandler: function() {
			this.fileHandler = null;
		},

		setFileHandler: function(handler) {
			this.fileHandler = handler;
		},

		handleFile: function(event) {
			this.fileHandler(event);
			this.unsetFileHandler();
		},

		getUploadFieldRef: function() {
			return this.$refs.vUploaderComponentRef;
		},

		urlWithToken: function(url) {
			if (!url || url.substr(0, 1) !== "/") {
				return url;
			}

			const token = this.system.api.defaults.headers.Authorization.substr(7);
			if (url.indexOf("?") === -1) {
				return `${url}?access_token=${token}`;
			} else {
				return `${url}&access_token=${token}`;
			}
		},

		getPreparedValue: function(value) {
			if (typeof value !== "object") {
				return {
					time: null,
					version: 0,
					blocks: []
				};
			}

			return {
				time: value?.time,
				version: value?.version,
				blocks: value?.blocks || []
			};
		},

		editorValueEmitter: function(context) {
			if (this.$props.disabled || !context) return;

			context.saver
				.save()
				.then(result => {
					if (!result || result.blocks.length < 1) {
						this.$emit("input", null);
					} else {
						this.$emit("input", result);
					}
				})
				.catch(error => this.$emit("error", "Cannot get content"));
		},

		buildToolsOptions: function() {
			const uploaderConfig = {
				urlWithToken: this.urlWithToken,
				baseURL: this.system.api.defaults.baseURL,
				picker: this.setFileHandler,
				getUploadFieldRef: this.getUploadFieldRef
			};

			const defaults = {
				header: {
					class: HeaderTool,
					shortcut: "CMD+SHIFT+H",
					inlineToolbar: true
				},
				list: {
					class: ListTool,
					inlineToolbar: true,
					shortcut: "CMD+SHIFT+1"
				},
				embed: {
					class: EmbedTool,
					inlineToolbar: true
				},
				paragraph: {
					class: ParagraphTool,
					inlineToolbar: true
				},
				code: {
					class: CodeTool
				},
				warning: {
					class: WarningTool,
					inlineToolbar: true,
					shortcut: "CMD+SHIFT+W"
				},
				underline: {
					class: UnderlineTool,
					shortcut: "CMD+SHIFT+U"
				},
				textalign: {
					class: TextAlignTool,
					inlineToolbar: true,
					shortcut: "CMD+SHIFT+A"
				},
				strikethrough: {
					class: StrikethroughTool
				},
				alert: {
					class: AlertTool
				},
				table: {
					class: TableTool,
					inlineToolbar: true
				},
				quote: {
					class: QuoteTool,
					inlineToolbar: true,
					shortcut: "CMD+SHIFT+O"
				},
				marker: {
					class: MarkerTool,
					shortcut: "CMD+SHIFT+M"
				},
				inlinecode: {
					class: InlineCodeTool,
					shortcut: "CMD+SHIFT+I"
				},
				delimiter: {
					class: DelimiterTool
				},
				raw: {
					class: RawToolTool
				},
				checklist: {
					class: ChecklistTool,
					inlineToolbar: true
				},
				simpleimage: {
					class: SimpleImageTool
				},
				image: {
					class: ImageTool,
					config: {
						uploader: uploaderConfig
					}
				},
				attaches: {
					class: AttachesTool,
					config: {
						uploader: uploaderConfig
					}
				},
				personality: {
					class: PersonalityTool,
					config: {
						uploader: uploaderConfig
					}
				}
			};

			// Build current tools config.
			const tools = {};

			for (const toolName of this.$props.tools) {
				if (toolName in defaults) {
					tools[toolName.toString()] = defaults[toolName];
				}
			}

			return tools;
		}
	}
};
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
	--v-input-font-family: var(--family-monospace);
}
.serif {
	--v-input-font-family: var(--family-serif);
}
.sans-serif {
	--v-input-font-family: var(--family-sans-serif);
}
</style>

<style src="./editorjs-content-reset.css"></style>
<style src="./editorjs-components.css"></style>
