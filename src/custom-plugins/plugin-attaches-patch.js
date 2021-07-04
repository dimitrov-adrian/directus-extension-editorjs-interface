import AttachesTool from "@editorjs/attaches";
import Uploader from "../editorjs-uploader";

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/attaches/blob/master/src/index.js
 */
export default class extends AttachesTool {
	static get isReadOnlySupported() {
		return true;
	}

	constructor(args) {
		super(args);
		this.readOnly = !!args.readOnly;
		this.uploader = new Uploader({
			config: {
				...args.config,
				...this.config,
			},
			onUpload: (response) => this.onUpload({ body: response }),
			onError: (error) => this.uploadingFailed(error),
		});
	}

	prepareUploadButton() {
		if (!this.readOnly) {
			super.prepareUploadButton();
		}
	}

	showFileData() {
		super.showFileData();
		if (this.data.file && this.data.file.url) {
			const downloadButton = this.nodes.wrapper.querySelector(
				"a.cdx-attaches__download-button"
			);
			if (downloadButton) {
				downloadButton.href = this.uploader.config.uploader.addTokenToURL(
					this.data.file.url
				);
			}
		}
		if (this.readOnly && this.nodes.title) {
			this.nodes.title.contentEditable = false;
		}
	}
}
