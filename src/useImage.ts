import { Ref, ref } from 'vue';

export type UploaderHandler = (selectedImage: EditorJsImage) => void;

type UsableImage = {
	imageDrawerOpen: Ref<boolean>;
	selectedImage: Ref<EditorJsImage | null>;
	selectedImagePreviewUrl: Ref<string>;
	closeImageDrawer: () => void;
	openImageDrawer: () => void;
	onImageSelect: (image: DirectusFile) => void;
	onImageEdit: (image: EditorJsImage) => void;
	fileHandler: Ref<UploaderHandler | null>;
	setFileHandler: (handler: UploaderHandler) => void;
	handleFile: (selectedImage: EditorJsImage) => void;
	getImagePreviewUrl: (imageUrl: string) => string;
};

type DirectusFile = {
	id: string;
	filename_download: string;
	title: string;
	type: string;
	filesize: number;
	width: number;
	height: number;
	description: string;
	rokka_hash: string;
};

export type EditorJsImage = {
	fileId: string;
	name: string;
	title: string;
	description: string;
	type: string;
	size: number;
	width: number;
	height: number;
	fileURL: string;
	url: string;
	rokkaHash: string;
};

export default function useImage(
	apiBaseUrl: string,
	addTokenToURL: (url: string, token?: string) => string
): UsableImage {
	const imageDrawerOpen = ref(false);
	const selectedImage = ref<EditorJsImage | null>(null);
	const selectedImagePreviewUrl = ref<string>('');
	const fileHandler = ref<UploaderHandler | null>(null);

	return {
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
	};

	function closeImageDrawer() {
		selectedImage.value = null;
		selectedImagePreviewUrl.value = '';
		imageDrawerOpen.value = false;
		unsetFileHandler();
	}

	function openImageDrawer() {
		imageDrawerOpen.value = true;
	}

	/**
	 * When an image is selected
	 */
	function onImageSelect(image: DirectusFile) {
		const editorJsImage = directusFileToEditorJsImage(image);
		selectedImage.value = editorJsImage;
		selectedImagePreviewUrl.value = getImagePreviewUrl(editorJsImage.url);
	}

	/**
	 * When an image is edited
	 */
	function onImageEdit(image: EditorJsImage) {
		selectedImage.value = image;
		selectedImagePreviewUrl.value = getImagePreviewUrl(image.url);
	}

	function getImagePreviewUrl(imageUrl: string): string {
		return `${addTokenToURL(imageUrl)}&key=system-large-contain`;
	}

	function unsetFileHandler() {
		fileHandler.value = null;
	}

	function setFileHandler(handler: UploaderHandler) {
		fileHandler.value = handler;
	}

	function handleFile(newSelectedImage: EditorJsImage) {
		if (fileHandler.value) {
			fileHandler.value(newSelectedImage);
		}

		closeImageDrawer();
	}

	function directusFileToEditorJsImage(file: DirectusFile): EditorJsImage {
		return {
			fileId: file.id,
			name: file.filename_download,
			title: file.title,
			description: file.description,
			type: file.type,
			size: file.filesize,
			width: file.width,
			height: file.height,
			fileURL: getFileUrl(file.id),
			url: getImageUrl(file.id),
			rokkaHash: file.rokka_hash,
		};
	}

	function getImageUrl(fileId: string): string {
		return `${apiBaseUrl}assets/${fileId}`;
	}

	function getFileUrl(fileId: string): string {
		return `${apiBaseUrl}files/${fileId}`;
	}
}
