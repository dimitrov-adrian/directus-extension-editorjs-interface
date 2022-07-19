<template>
	<div ref="editorElement" :class="{ [font]: true, disabled, bordered }"></div>

	<v-drawer
		v-if="haveFilesAccess && !disabled"
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

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, withDefaults } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApi, useStores } from '@directus/extensions-sdk';
import EditorJS from '@editorjs/editorjs';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import useDirectusToken from './use-directus-token';
import useFileHandler from './use-filehandler';
import getTools from './get-tools';
import getTranslations from './translations';
import { wait } from './wait';

const props = withDefaults(
	defineProps<{
		disabled?: boolean;
		nullable?: boolean;
		autofocus?: boolean;
		value?: Object;
		bordered?: boolean;
		placeholder?: string;
		tools: string[];
		folder?: string;
		font: 'sans-serif' | 'monospace' | 'serif';
	}>(),
	{
		disabled: false,
		nullable: false,
		autofocus: false,
		value: () => null,
		bordered: true,
		tools: () => ['header', 'nestedlist', 'code', 'image', 'paragraph', 'delimiter', 'checklist', 'quote', 'underline'],
		font: 'sans-serif',
	}
);

const emit = defineEmits(['input']);

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

const tools = getTools(
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
	const initialValue = getSanitizedValue(props.value);

	editorjsInstance.value = new EditorJS({
		i18n: getTranslations(t),
		logLevel: 'ERROR' as EditorJS.LogLevels,
		holder: editorElement.value,
		data: initialValue || undefined,
		// Readonly makes troubles in some cases, also requires all plugins to implement it.
		// https://github.com/codex-team/editor.js/issues/1669
		readOnly: false,
		placeholder: props.placeholder,
		minHeight: 72,
		onChange: (a, b) => emitValue(a, b),
		tools: tools,
	});

	if (props.autofocus) {
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
		if (!editorjsInstance.value || !editorjsInstance.value.isReady || isInternalChange.value) return;

		// Do not render if there is uploader active operation.
		if (fileHandler.value !== null) return;

		if (isEqual(newVal?.blocks, oldVal?.blocks)) return;

		try {
			await editorjsInstance.value.isReady;
			const value = getSanitizedValue(newVal);
			if (value) {
				await editorjsInstance.value.render(value);
			} else {
				editorjsInstance.value.clear();
			}
		} catch (error) {
			window.console.warn('editorjs-extension: %s', error);
		}

		isInternalChange.value = false;
	}
);

async function emitValue(context: EditorJS.API, event: CustomEvent) {
	if (props.disabled || !context || !context.saver) return;
	isInternalChange.value = true;

	try {
		// Fixes deleting multiple blocks bug https://github.com/codex-team/editor.js/issues/1755#issuecomment-929550729
		await wait(200);
		const result: EditorJS.OutputData = await context.saver.save();

		if (!result || result.blocks.length < 1) {
			emit('input', props.nullable ? null : '{}');
			return;
		}

		if (isEqual(result.blocks, props.value?.blocks)) return;
		emit('input', result);
	} catch (error) {
		window.console.warn('editorjs-extension: %s', error);
	}
}

function getSanitizedValue(value: any): EditorJS.OutputData | null {
	if (!value || typeof value !== 'object' || !value.blocks || value.blocks.length < 1) return null;

	return cloneDeep({
		time: value?.time || Date.now(),
		version: value?.version || '0.0.0',
		blocks: value.blocks,
	});
}
</script>

<style lang="css" scoped>
.disabled {
	color: var(--foreground-subdued);
	background-color: var(--background-subdued);
	border-color: var(--border-normal);
	pointer-events: none;
}

.bordered {
	padding: var(--input-padding) 4px var(--input-padding) calc(var(--input-padding) + 8px) !important;
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
