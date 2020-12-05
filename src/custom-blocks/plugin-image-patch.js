import ImageTool from '@editorjs/image'
import Uploader from '../editorjs-uploader'

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/image/blob/master/src/index.js
 */
export default class extends ImageTool {
  constructor(args) {
    super(args)
    this.uploader = new Uploader({
      config: {
        ...args.config,
        ...this.config,
      },
      onUpload: (response) => this.onUpload(response),
      onError: (error) => this.uploadingFailed(error),
    })
  }
}
