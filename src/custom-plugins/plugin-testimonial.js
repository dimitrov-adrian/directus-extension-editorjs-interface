export default class TestimonialTool {
	constructor({data, api, config, block}) {
		this.data = data
		this.api = api;
		this.config = config;
		this.block = block
	}

	static get toolbox() {
		return {
			title: 'Testimonial',
			icon: '<svg width="13" height="14" xmlns="http://www.w3.org/2000/svg">\n' +
				'    <path d="M5.27 7.519a3.114 3.114 0 0 1-1.014-.44 3.354 3.354 0 0 1-.973-1.002C2.865 5.42 2.65 4.62 2.65 3.8c0-.82.215-1.62.633-2.277.251-.394.574-.737.973-1.002a3.094 3.094 0 0 1 3.438 0c.399.265.722.608.973 1.002.418.657.633 1.456.633 2.277 0 .82-.215 1.62-.633 2.277a3.353 3.353 0 0 1-.973 1.002c-.31.206-.655.357-1.023.442.93.054 1.826.212 2.591.45.503.155.95.345 1.324.576.27.167.511.358.725.6a2.441 2.441 0 0 1-.109 3.408c-.25.247-.525.424-.828.568-.38.181-.816.311-1.32.413-.853.172-1.937.264-3.079.264-1.142 0-2.226-.092-3.078-.264-.505-.102-.941-.232-1.321-.413a2.969 2.969 0 0 1-.828-.568 2.449 2.449 0 0 1-.13-3.384c.21-.246.45-.441.717-.61a5.63 5.63 0 0 1 1.316-.587c.77-.243 1.675-.403 2.618-.455zM5.974 5.5c.594 0 1.075-.761 1.075-1.7s-.481-1.7-1.075-1.7S4.9 2.861 4.9 3.8s.481 1.7 1.075 1.7zm0 6.05c2.057 0 3.725-.336 3.725-.75S8.007 9.75 5.95 9.75s-3.7.636-3.7 1.05c0 .414 1.668.75 3.725.75z" id="a"/>\n' +
				'</svg>'
		};
	}

	render() {
		const wrapper = document.createElement('div');
		const button = document.createElement('button');
		const header = document.createElement('h4');
		const description = document.createElement('p');
		const externalLinkIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>'

		wrapper.classList.add('cdx-personality')
		header.classList.add('cdx-personality__name')
		description.classList.add('cdx-personality__description')
		button.classList.add(this.api.styles.button);

		wrapper.appendChild(header);
		wrapper.appendChild(description);
		wrapper.appendChild(button);
		wrapper.dataset.id = this.data && this.data.value ? this.data.value : '';

		this.getRelation('testimonials', wrapper.dataset.id).then(item => {
			header.innerHTML = item.data.data.author ? item.data.data.author : 'Author title';
			description.innerHTML = item.data.data.testimonial ? item.data.data.testimonial : '«Testimonial quote»';
			button.innerHTML = item.data.data.testimonial ? `Change testimonial ${externalLinkIcon}` : `Select a testimonial ${externalLinkIcon}`
			if (item.data.data.testimonial) {
				button.classList.add('secondary')
			} else {
				button.classList.remove('secondary')
			}
		})

		button.addEventListener('click', () => {
			this.config.relationSelector.setSelectionSaveHandler((selection) => {
				wrapper.dataset.id = selection
				this.block.save().then((state) => {
					this.api.blocks.update(state.id, state.data);
				});
			})

			if (wrapper.dataset.id !== undefined && wrapper.dataset.id !== null) {
				this.config.relationSelector.setCurrentSelection([Number(wrapper.dataset.id)])
			}

			this.config.relationSelector.toggleSelector();
		});

		return wrapper;
	}


	save(blockContent) {
		const relationId = blockContent.dataset.id;
		return {
			value: relationId
		}
	}

	async getRelation(relation, id) {
		return await this.config.relationSelector.api.get(`/items/${relation}/${encodeURIComponent(id)}`)
			.then(response => {
				return response
			}).catch(error => {
				console.error(error)
			});
	}
}
