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
		<div class="uploader-drawer-content">
			<div v-if="currentPreview" class="uploader-preview-image">
				<img :src="currentPreview" />
			</div>
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
import { isEqual, cloneDeep } from 'lodash';
import useDirectusToken from './use-directus-token';
import useFileHandler from './use-filehandler';
import useTools from './use-tools';
import getTranslations from './translations';

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
			type: String as PropType<'sans-serif' | 'monospace' | 'serif'>,
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
		const { currentPreview, setCurrentPreview, fileHandler, setFileHandler, unsetFileHandler, handleFile } =
			useFileHandler();

		const editorjsInstance = ref<EditorJS>();
		const uploaderComponentElement = ref<HTMLElement>();
		const editorElement = ref<HTMLElement>();
		const haveFilesAccess = Boolean(collectionStore.getCollection('directus_files'));
		const isInternalChange = ref<boolean>(false);

		const tools = useTools(
			{
				addTokenToURL,
				baseURL: api.defaults.baseURL,
				setFileHandler,
				setCurrentPreview,
				getUploadFieldElement: () => uploaderComponentElement,
				t: {
					no_file_selected: t('no_file_selected'),
				},
			},
			props.tools,
			haveFilesAccess
		);

		onMounted(() => {
			const initialValue = getPreparedValue(props.value);

			editorjsInstance.value = new EditorJS({
				i18n: getTranslations(t),
				logLevel: 'ERROR' as EditorJS.LogLevels,
				holder: editorElement.value,
				data: initialValue,
				// Readonly makes troubles in some cases, also requires all plugins to implement it.
				// https://github.com/codex-team/editor.js/issues/1669
				readOnly: false,
				placeholder: props.placeholder,
				minHeight: 72,
				onChange: (a, b) => emitValue(a, b),
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
			async (newVal: any, oldVal: any) => {
				if (!editorjsInstance.value || !editorjsInstance.value.isReady) return;

				if (isInternalChange.value) {
					isInternalChange.value = false;
					return;
				}

				// Do not render if there is uploader active operation.
				if (fileHandler.value !== null) return;

				if (isEqual(newVal?.blocks, oldVal?.blocks)) return;

				try {
					await editorjsInstance.value.isReady;
					editorjsInstance.value.render(getPreparedValue(newVal));
				} catch (error) {
					window.console.warn('editorjs-extension: %s', error);
				}
			}
		);

		return {
			t,
			editorElement,
			uploaderComponentElement,
			fileHandler,
			currentPreview,
			className: {
				[props.font]: true,
				bordered: props.bordered,
			},
			haveFilesAccess,
			unsetFileHandler,
			handleFile,
		};

		async function emitValue(context: EditorJS.API, targetBlock: EditorJS.BlockAPI) {
			if (props.disabled || !context || !context.saver) return;
			isInternalChange.value = true;

			try {
				const result: EditorJS.OutputData = await context.saver.save();

				if (!result || result.blocks.length < 1) {
					emit('input', null);
					return;
				}

				if (isEqual(getBlockData(targetBlock.id, props.value), getBlockData(targetBlock.id, result))) return;

				emit('input', result);
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

			return cloneDeep({
				time: value?.time,
				version: value?.version,
				blocks: value?.blocks || [],
			});
		}

		function getBlockData(blockId: string, context: any) {
			return context?.blocks?.find((block: any) => blockId === block?.id)?.data;
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

.uploader-drawer-content {
	padding: var(--content-padding);
	padding-top: 0;
	padding-bottom: var(--content-padding);
}

.uploader-preview-image {
	margin-bottom: var(--form-vertical-gap);
	background-color: var(--background-normal);
	border-radius: var(--border-radius);
}

.uploader-preview-image img {
	display: block;
	width: auto;
	max-width: 100%;
	height: auto;
	max-height: 40vh;
	margin: 0 auto;
	object-fit: contain;
}
</style>

<style src="./editorjs-ui.css"></style>
<style src="./editorjs-components.css"></style>
<style src="./editorjs-content-reset.css"></style>
