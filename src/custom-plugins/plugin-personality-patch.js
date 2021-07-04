import Personality from "@editorjs/personality";
import Uploader from "../editorjs-uploader";

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/personality/blob/master/src/index.js
 */
export default class extends Personality {
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

	setFullImageSource(image) {
		const imageUrlWithToken =
			this.uploader.config.uploader.addTokenToURL(image) +
			"&key=system-medium-cover";
		this.nodes.photo.style.background = `url('${imageUrlWithToken}') center center / cover no-repeat`;
	}

	showFullImage() {
		setTimeout(() => {
			this.nodes.photo.classList.remove(this.CSS.loader);
			this.setFullImageSource(this.data.photo);
		}, 500);
	}

	static get isReadOnlySupported() {
		return true;
	}

	render() {
		const result = super.render();

		// Clear events.
		if (this.readOnly) {
			this.nodes.photo.replaceWith(this.nodes.photo.cloneNode(true));
		}

		if (this.data.photo) {
			this.setFullImageSource(this.data.photo);
		}

		return result;
	}

	make(...args) {
		const result = super.make(...args);
		if (this.readOnly && result.contentEditable) {
			result.contentEditable = false;
		}
		return result;
	}
}
