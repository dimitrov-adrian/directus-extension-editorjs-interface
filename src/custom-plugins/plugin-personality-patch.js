import Personality from '@editorjs/personality';
import Uploader from './editorjs-uploader.js';

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/personality/blob/master/src/index.js
 */

const LOADER_DELAY = 500;

export default class extends Personality {
	constructor(params) {
		super(params);

		this.config.uploader = params.config.uploader;
		this.uploader = new Uploader({
			config: this.config,
			getCurrentFile: () => this.data.photo,
			onUpload: (response) => this.onUpload({ body: response }),
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

	setFullImageSource(image) {
		const imageUrlWithToken = this.uploader.config.uploader.addTokenToURL(image) + '&key=system-medium-cover';
		this.nodes.photo.style.background = `url('${imageUrlWithToken}') center center / cover no-repeat`;
	}

	showFullImage() {
		setTimeout(() => {
			this.nodes.photo.classList.remove(this.CSS.loader);
			this.setFullImageSource(this.data.photo);
		}, LOADER_DELAY);
	}

	render() {
		const result = super.render();
		if (this.data.photo) {
			this.setFullImageSource(this.data.photo);
		}

		return result;
	}
}
