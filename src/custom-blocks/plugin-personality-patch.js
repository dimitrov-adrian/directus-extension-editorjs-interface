import Personality from '@editorjs/personality';
import Uploader from '../editorjs-uploader';

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/personality/blob/master/src/index.js
 */
export default class extends Personality {
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
	preparePhotoUrl() {
		let imageUrl = this.uploader.config.uploader.urlSigner(this.data.photo);
		imageUrl += '&key=system-medium-cover';
		return imageUrl;
	}
	showFullImage() {
		setTimeout(() => {
			this.nodes.photo.classList.remove(this.CSS.loader);
			this.nodes.photo.style.background = `url('${this.preparePhotoUrl(
				this.data.photo
			)}') center center / cover no-repeat`;
		}, 500);
	}
	render() {
		const { name, description, photo, link } = this.data;

		this.nodes.wrapper = this.make('div', this.CSS.wrapper);

		this.nodes.name = this.make('div', this.CSS.name, {
			contentEditable: true,
		});

		this.nodes.description = this.make('div', this.CSS.description, {
			contentEditable: true,
		});

		this.nodes.link = this.make('div', this.CSS.link, {
			contentEditable: true,
		});

		this.nodes.photo = this.make('div', this.CSS.photo);

		if (photo) {
			const preparedPhoto = this.preparePhotoUrl(photo);
			this.nodes.photo.style.background = `url('${preparedPhoto}') center center / cover no-repeat`;
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

		this.nodes.photo.addEventListener('click', () => {
			this.uploader.uploadSelectedFile({
				onPreview: () => {
					this.addLoader();
				},
			});
		});

		this.nodes.wrapper.appendChild(this.nodes.photo);
		this.nodes.wrapper.appendChild(this.nodes.name);
		this.nodes.wrapper.appendChild(this.nodes.description);
		this.nodes.wrapper.appendChild(this.nodes.link);

		return this.nodes.wrapper;
	}
}
