/**
 * Modified version of https://github.com/editor-js/image/blob/master/src/uploader.js
 */
export default class Uploader {
	constructor({ config, getCurrentFile, onUpload, onError }) {
		this.getCurrentFile = getCurrentFile;
		this.config = config;
		this.onUpload = onUpload;
		this.onError = onError;
	}

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

	uploadSelectedFile({ onPreview }) {
		if (this.getCurrentFile) {
			const currentPreview = this.getCurrentFile();
			if (currentPreview) {
				this.config.uploader.setCurrentPreview(
					this.config.uploader.addTokenToURL(currentPreview) + '&key=system-large-contain'
				);
			}
		}

		this.config.uploader.setFileHandler((file) => {
			if (!file) {
				this.onError({
					success: 0,
					message: this.config.t.no_file_selected,
				});
				return;
			}

			const response = {
				success: 1,
				file: {
					width: file.width,
					height: file.height,
					size: file.filesize,
					name: file.filename_download,
					title: file.title,
					extension: file.filename_download.split('.').pop(),
					fileId: file.id,
					fileURL: this.config.uploader.baseURL + 'files/' + file.id,
					url: this.config.uploader.baseURL + 'assets/' + file.id,
				},
			};

			onPreview(this.config.uploader.addTokenToURL(response.file.fileURL));
			this.onUpload(response);
		});
	}
}
