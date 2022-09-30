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
	 * Handle clicks on the upload file button
	 * Fires ajax.transport()
	 *
	 * @param {Function} onPreview - callback fired when preview is ready
	 */
	uploadSelectedFile({ onPreview }) {
		this.config.uploader.openImageDrawer();

		this.config.uploader.setFileHandler(async (selectedImage: EditorJsImage) => {
			if (!selectedImage) {
				this.onError({
					success: 0,
					message: this.config.uploader.t.no_file_selected,
				});
				return;
			}

			const response = {
				success: 1,
				file: {
					...selectedImage,
					rokkaHash:
						selectedImage.rokkaHash || (await this.config.uploader.getRokkaHash(selectedImage.fileId)),
				},
			};

			onPreview(this.config.uploader.getImagePreviewUrl(response.file.url));
			this.onUpload(response);
			// Need to call dispatchChange so that editing an existing image triggers an onChange() of the editor
			this.dispatchChange();
		});
	}
}
