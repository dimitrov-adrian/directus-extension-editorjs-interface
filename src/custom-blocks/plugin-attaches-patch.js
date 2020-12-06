import AttachesTool from '@editorjs/attaches';
import Uploader from '../editorjs-uploader';

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/attaches/blob/master/src/index.js
 */
export default class extends AttachesTool {
	constructor(args) {
		super(args);
		this.uploader = new Uploader({
			config: {
				...args.config,
				...this.config,
			},
			onUpload: (response) => this.onUpload({ body: response }),
			onError: (error) => this.uploadingFailed(error),
		});
	}
	showFileData() {
		super.showFileData();
		if (this.data.file && this.data.file.url) {
			const downloadButton = this.nodes.wrapper.querySelector('a.cdx-attaches__download-button');
			if (downloadButton) {
				downloadButton.href = this.uploader.config.uploader.urlSigner(this.data.file.url);
			}
		}
	}
}
