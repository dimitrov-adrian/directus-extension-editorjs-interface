import AttachesTool from '@editorjs/attaches'
import Uploader from '../editorjs-uploader'

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/attaches/blob/master/src/index.js
 */
export default class extends AttachesTool {
	constructor(args) {
		super(args)
		this.uploader = new Uploader({
			config: {
				...args.config,
				...this.config,
				returnFileUrl: true,
			},
			onUpload: (response) => this.onUpload({ body: response }),
			onError: (error) => this.uploadingFailed(error),
		})
	}
}
