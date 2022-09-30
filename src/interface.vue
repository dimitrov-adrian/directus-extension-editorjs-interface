<template>
	<div ref="editorElement" :class="{ [font]: true, disabled, bordered }"></div>

	<v-drawer
		v-model="imageDrawerOpen"
		:title="t('upload_from_device')"
		:persistent="true"
		icon="image"
		@cancel="closeImageDrawer"
	>
		<div class="uploader-drawer-content">
			<template v-if="selectedImage && selectedImagePreviewUrl">
				<div class="grid">
					<div class="field">
						<div class="file-preview">
							<div class="image">
								<v-image
									:src="selectedImagePreviewUrl"
									:width="selectedImage.width"
									:height="selectedImage.height"
									:alt="selectedImage.title"
								/>
							</div>
						</div>
					</div>
					<div class="field">
						<div class="type-label">{{ t('title') }}</div>
						<v-input v-model="selectedImage.title" />
					</div>
					<div class="field">
						<div class="type-label">{{ t('description') }}</div>
						<v-textarea v-model="selectedImage.description" />
					</div>
					<div class="field half">
						<div class="type-label">{{ t('width') }}</div>
						<v-input
							v-model="selectedImage.displayWidth"
							type="number"
							@update:model-value="matchDisplayHeight"
						/>
					</div>
					<div class="field half-right">
						<div class="type-label">{{ t('height') }}</div>
						<v-input
							v-model="selectedImage.displayHeight"
							type="number"
							@update:model-value="matchDisplayWidth"
						/>
					</div>
					<div class="field">
						<div class="type-label">Rokka Hash</div>
						<v-input v-model="selectedImage.rokkaHash" />
					</div>
				</div>
			</template>
			<v-upload v-else :multiple="false" from-library from-url :folder="folder" @input="onImageSelect" />
		</div>

		<template #actions>
			<v-button v-tooltip.bottom="t('save_image')" icon rounded @click="handleFile(selectedImage)">
				<v-icon name="check" />
			</v-button>
		</template>
	</v-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, withDefaults } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApi, useStores } from '@directus/extensions-sdk';
import EditorJS, { API, OutputData } from '@editorjs/editorjs';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import useDirectusToken from './use-directus-token';
import useImage from './useImage';
import getTools from './get-tools';
import getTranslations from './translations';
import { wait } from './wait';

const props = withDefaults(
	defineProps<{
		disabled?: boolean;
		nullable?: boolean;
		autofocus?: boolean;
		value?: object;
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
		tools: () => [
			'header',
			'paragraph',
			'nestedlist',
			'quote',
			'image',
			'embed',
			'inlinesmall',
			'inverteddelimiter',
			'button',
			'iframe',
			'raw',
		],
		font: 'sans-serif',
	}
);

const emit = defineEmits(['input']);

const { t } = useI18n();
const api = useApi();
const { addTokenToURL } = useDirectusToken(api);
const { useCollectionsStore } = useStores();
const collectionStore = useCollectionsStore();
const {
	imageDrawerOpen,
	selectedImage,
	selectedImagePreviewUrl,
	closeImageDrawer,
	openImageDrawer,
	onImageSelect,
	onImageEdit,
	fileHandler,
	setFileHandler,
	handleFile,
	getImagePreviewUrl,
	getRokkaHash,
} = useImage(api, addTokenToURL);
const editorjsInstance = ref<EditorJS>();
const editorElement = ref<HTMLElement>();
const haveFilesAccess = Boolean(collectionStore.getCollection('directus_files'));
const isInternalChange = ref<boolean>(false);

const tools = getTools(
	{
		addTokenToURL,
		baseURL: api.defaults.baseURL,
		setFileHandler,
		t: {
			no_file_selected: t('no_file_selected'),
		},
		selectedImage,
		openImageDrawer,
		closeImageDrawer,
		onImageEdit,
		onImageSelect,
		getImagePreviewUrl,
		getRokkaHash,
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
		onChange: (context: API, event: CustomEvent) => emitValue(context, event),
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

function matchDisplayHeight(width) {
	if (!selectedImage.value || !selectedImage.value.width || !selectedImage.value.height) {
		return;
	}
	selectedImage.value.displayHeight = Math.round((selectedImage.value.height / selectedImage.value.width) * width);
}

function matchDisplayWidth(height) {
	if (!selectedImage.value || !selectedImage.value.width || !selectedImage.value.height) {
		return;
	}
	selectedImage.value.displayWidth = Math.round((selectedImage.value.width / selectedImage.value.height) * height);
}

async function emitValue(context: API, event: CustomEvent) {
	if (props.disabled || !context || !context.saver) return;
	isInternalChange.value = true;

	try {
		// Fixes deleting multiple blocks bug https://github.com/codex-team/editor.js/issues/1755#issuecomment-929550729
		await wait(200);
		const result: OutputData = await context.saver.save();

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

function getSanitizedValue(value: any): OutputData | null {
	if (!value || typeof value !== 'object' || !value.blocks || value.blocks.length < 1) return null;

	return cloneDeep({
		time: value?.time || Date.now(),
		version: value?.version || '0.0.0',
		blocks: value.blocks,
	});
}
</script>

<style lang="scss" scoped>
@import './form-grid';

.grid {
	@include form-grid;
}

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

// Source: https://github.com/directus/directus/blob/main/app/src/views/private/components/file-preview.vue
.file-preview {
	position: relative;
	max-width: calc((var(--form-column-max-width) * 2) + var(--form-horizontal-gap));

	img {
		display: block;
		z-index: 1;
		margin: 0 auto;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 400px;
		object-fit: contain;
		border-radius: var(--border-radius);
		background-color: var(--background-normal);
	}

	.image {
		background-color: var(--background-normal);
		border-radius: var(--border-radius);
	}
}
</style>

<style src="./editorjs-ui.css"></style>
<style src="./editorjs-components.css"></style>
<style src="./editorjs-content-reset.css"></style>
