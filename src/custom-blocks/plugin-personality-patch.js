import Personality from '@editorjs/personality'
import Uploader from '../editorjs-uploader'

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/personality/blob/master/src/index.js
 */
export default class extends Personality {
	constructor(args) {
		super(args)
		this.uploader = new Uploader({
			config: {
				...args.config,
				...this.config,
			},
			onUpload: (response) => this.onUpload({ body: response }),
			onError: (error) => this.uploadingFailed(error),
		})
	}
}
