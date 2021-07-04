/**
 * Modified version of https://github.com/editor-js/image/blob/master/src/uploader.js
 */
export default class Uploader {
	constructor({ config, onUpload, onError }) {
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
			if (!this.config.uploader.getUploadFieldElement) {
				return;
			}

			try {
				this.config.uploader.getUploadFieldElement().onBrowseSelect({
					target: {
						files: [file],
					},
				});
			} catch (error) {}
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
		this.config.uploader.picker((file) => {
			if (file) {
				const response = {
					success: 1,
					file: {
						size: file.filesize,
						name: file.filename_download,
						title: file.title,
						extension: file.filename_download.split(".").pop(),
						fileId: file.id,
						fileURL: this.config.uploader.baseURL + "files/" + file.id,
						url: this.config.uploader.baseURL + "assets/" + file.id,
					},
				};
				onPreview(this.config.uploader.addTokenToURL(response.file.fileURL));
				this.onUpload(response);
			} else {
				this.onError({
					success: 0,
					message: "No file selected",
				});
			}
		});
	}
}
