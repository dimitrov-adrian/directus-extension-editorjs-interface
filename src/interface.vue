<template>
	<div ref="editorElement" :class="className"></div>

	<v-drawer
		v-if="haveFilesAccess"
		:model-value="fileHandler !== null"
		icon="image"
		:title="t('upload_from_device')"
		:cancelable="true"
		@update:model-value="unsetFileHandler"
		@cancel="unsetFileHandler"
	>
		<div class="drawer-content">
			<v-upload
				:ref="uploaderComponentElement"
				:multiple="false"
				:folder="folder"
				from-library
				from-url
				@input="handleFile"
			/>
		</div>
	</v-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApi, useStores } from '@directus/extensions-sdk';
import EditorJS from '@editorjs/editorjs';

import useDirectusToken from './use-directus-token';
import useFileHandler from './use-filehandler';
import useTools from './use-tools';

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
		const { t } = useI18n();

		const api = useApi();
		const { addTokenToURL } = useDirectusToken(api);
		const { useCollectionsStore } = useStores();
		const collectionStore = useCollectionsStore();

		const editorjsInstance = ref<EditorJS>();
		const uploaderComponentElement = ref<HTMLElement>();
		const editorElement = ref<HTMLElement>();
		const haveFilesAccess = Boolean(collectionStore.getCollection('directus_files'));
		const isInternalChange = ref<boolean>(false);

		const { fileHandler, setFileHandler, unsetFileHandler, handleFile } = useFileHandler();

		const tools = useTools(
			{
				addTokenToURL,
				baseURL: api.defaults.baseURL,
				setFileHandler,
				getUploadFieldElement: () => uploaderComponentElement,
				t: {
					no_file_selected: t('no_file_selected'),
				},
			},
			props.tools,
			haveFilesAccess
		);

		onMounted(() => {
			editorjsInstance.value = new EditorJS({
				logLevel: 'ERROR' as EditorJS.LogLevels,
				holder: editorElement.value,
				data: getPreparedValue(props.value),
				// Readonly makes troubles in some cases, also requires all plugins to implement it.
				// https://github.com/codex-team/editor.js/issues/1669
				readOnly: false,
				placeholder: props.placeholder,
				minHeight: 72,
				onChange: (a) => emitValue(a),
				tools: tools,
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
			async (newVal: any) => {
				if (isInternalChange.value || !editorjsInstance.value || !editorjsInstance.value.isReady) return;

				// Do not render if in current file operation.
				if (fileHandler.value !== null) return;

				// Cannot rely on deep equeal because of constantly changed time and IDs,
				// also some tools does not emmits change event properly.
				// if (isDocEqual(newVal, oldVal)) return;

				try {
					await editorjsInstance.value.isReady;
					editorjsInstance.value.render(getPreparedValue(newVal));
					isInternalChange.value = false;
				} catch (error) {
					window.console.warn('editorjs-extension: %s', error);
				}
			}
		);

		return {
			t,
			editorjsInstance,
			editorElement,
			uploaderComponentElement,
			fileHandler,
			className: {
				[props.font]: true,
				bordered: props.bordered,
			},
			haveFilesAccess,
			unsetFileHandler,
			handleFile,
		};

		async function emitValue(context: EditorJS.API) {
			if (props.disabled || !context || !context.saver) return;

			isInternalChange.value = true;

			try {
				const result: EditorJS.OutputData = await context.saver.save();

				if (!result || result.blocks.length < 1) {
					emit('input', null);
				} else {
					emit('input', result);
				}
			} catch (error) {
				window.console.warn('editorjs-extension: %s', error);
			}
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

.drawer-content {
	padding: var(--content-padding);
	padding-top: 0;
	padding-bottom: var(--content-padding);
}
</style>

<style src="./editorjs-content-reset.css"></style>
<style src="./editorjs-components.css"></style>
