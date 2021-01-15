import Personality from '@editorjs/personality';
import Uploader from '../editorjs-uploader';

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
	setFullImageSource(photo) {
		let photoSignedUrl = this.uploader.config.uploader.urlSigner(photo);
		photoSignedUrl += '&key=system-medium-cover';
		this.nodes.photo.style.background = `url('${photoSignedUrl}') center center / cover no-repeat`;
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
		const { name, description, photo, link } = this.data;

		this.nodes.wrapper = this.make('div', this.CSS.wrapper);

		this.nodes.name = this.make('div', this.CSS.name, {
			contentEditable: !this.readOnly,
		});

		this.nodes.description = this.make('div', this.CSS.description, {
			contentEditable: !this.readOnly,
		});

		this.nodes.link = this.make('div', this.CSS.link, {
			contentEditable: !this.readOnly,
		});

		this.nodes.photo = this.make('div', this.CSS.photo);

		if (photo) {
			this.setFullImageSource(photo);
		}

		if (description) {
			this.nodes.description.textContent = description;
		} else {
			this.nodes.description.dataset.placeholder = this.config.descriptionPlaceholder;
		}

		if (name) {
			this.nodes.name.textContent = name;
		} else {
			this.nodes.name.dataset.placeholder = this.config.namePlaceholder;
		}

		if (link) {
			this.nodes.link.textContent = link;
		} else {
			this.nodes.link.dataset.placeholder = this.config.linkPlaceholder;
		}

		if (!this.readOnly) {
			this.nodes.photo.addEventListener('click', () => {
				this.uploader.uploadSelectedFile({
					onPreview: () => {
						this.addLoader();
					},
				});
			});
		}

		this.nodes.wrapper.appendChild(this.nodes.photo);
		this.nodes.wrapper.appendChild(this.nodes.name);
		this.nodes.wrapper.appendChild(this.nodes.description);
		this.nodes.wrapper.appendChild(this.nodes.link);

		return this.nodes.wrapper;
	}
}
