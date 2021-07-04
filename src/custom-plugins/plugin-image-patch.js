import ImageTool from "@editorjs/image";
import Uploader from "../editorjs-uploader";

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/image/blob/master/src/index.js
 */
export default class extends ImageTool {
	constructor(args) {
		super(args);

		this.uploader = new Uploader({
			config: {
				...args.config,
				...this.config,
			},
			onUpload: (response) => this.onUpload(response),
			onError: (error) => this.uploadingFailed(error),
		});
	}

	set image(file) {
		this._data.file = file || {};
		if (file && file.url) {
			const imageUrl =
				this.config.uploader.addTokenToURL(file.url) +
				"&key=system-large-contain";
			this.ui.fillImage(imageUrl);
		}
	}
}
