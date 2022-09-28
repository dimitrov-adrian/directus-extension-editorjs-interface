/**
 * Modified version of https://github.com/editor-js/image/blob/master/src/uploader.js
 *
 * Module for file uploading. Handle 3 scenarios:
 *  1. Select file from device and upload
 *  2. Upload by pasting URL
 *  3. Upload by pasting file from Clipboard or by Drag'n'Drop
 */
import { EditorJsImage } from '../useImage';

export default class Uploader {
	/**
	 * @param {object} params - uploader module params
	 * @param {ImageConfig} params.config - image tool config
	 * @param {Function} params.onUpload - one callback for all uploading (file, url, d-n-d, pasting)
	 * @param {Function} params.onError - callback for uploading errors
	 */
	constructor({ config, onUpload, onError, dispatchChange }) {
		this.config = config;
		this.onUpload = onUpload;
		this.onError = onError;
		this.dispatchChange = dispatchChange;
	}

	/**
	 * Handle copy/paste and drag&drop
	 * Fires ajax.post()
	 *
	 * @param {File} file - file pasted by drag-n-drop
	 * @param {object} params - uploader module params
	 * @param {Function} params.onPreview - ???
	 */
	uploadByFile(file, { onPreview }) {
		// Right now the only option is to open the picker.
		this.uploadSelectedFile({ onPreview });

		onPreview();

		// @TODO Very ugly, but until found better way.
		setTimeout(() => {
			if (!this.config.uploader.getUploadFieldElement) return;

			try {
				this.config.uploader.getUploadFieldElement().onBrowseSelect({
					target: {
						files: [file],
					},
				});
			} catch (error) {
				window.console.warn('editorjs-interface: Cannot get browsing component - %s', error);
			}
		}, 500);
	}

	uploadByUrl(url) {
		this.onUpload({
			success: 1,
			file: {
				url: url,
			},
		});
	}

	/**
	 * Handle clicks on the upload file button
	 * Fires ajax.transport()
	 *
	 * @param {Function} onPreview - callback fired when preview is ready
	 */
	uploadSelectedFile({ onPreview }) {
		this.config.uploader.openImageDrawer();

		this.config.uploader.setFileHandler((selectedImage: EditorJsImage) => {
			console.log('in fileHandler / selectedImage:', selectedImage)
			if (!selectedImage) {
				this.onError({
					success: 0,
					message: this.config.t.no_file_selected,
				});
				return;
			}

			const response = {
				success: 1,
				file: selectedImage,
			};

			onPreview(this.config.uploader.getImagePreviewUrl(response.file.url));
			this.onUpload(response);
			// Need to call dispatchChange so that editing an existing image triggers an onChange() of the editor
			this.dispatchChange();
		});
	}
}
