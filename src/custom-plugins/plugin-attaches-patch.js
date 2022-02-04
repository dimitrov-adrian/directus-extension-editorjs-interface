import AttachesTool from '@editorjs/attaches';
import Uploader from './editorjs-uploader.js';

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/attaches/blob/master/src/index.js
 */
export default class extends AttachesTool {
	constructor(params) {
		super(params);

		this.config.uploader = params.config.uploader;
		this.uploader = new Uploader({
			config: this.config,
			onUpload: (response) => this.onUpload(response),
			onError: (error) => this.uploadingFailed(error),
		});

		// Until get https://github.com/editor-js/attaches/issues/50 solved, this is required.
		this.onUpload = (response) => {
			super.onUpload(response);
			params.block.save().then((state) => {
				params.api.blocks.update(state.id, state.data);
			});
		};
	}

	showFileData() {
		super.showFileData();
		if (this.data.file && this.data.file.url) {
			const downloadButton = this.nodes.wrapper.querySelector('a.cdx-attaches__download-button');
			if (downloadButton) {
				downloadButton.href = this.uploader.config.uploader.addTokenToURL(this.data.file.url);
			}
		}
	}
}
