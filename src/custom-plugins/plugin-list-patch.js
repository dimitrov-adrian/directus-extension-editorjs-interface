import ListTool from "editorjs-list";

/**
 * Patch allows readonly mode until get https://github.com/4rw44z/editorJs-list/pull/1
 * https://github.com/4rw44z/editorJs-list/blob/master/src/index.js
 */
export default class extends ListTool {
	static get isReadOnlySupported() {
		return true;
	}

	constructor(args) {
		super(args);
		this.readOnly = !!args.readOnly;
	}

	render() {
		// Clear events.
		if (this.readOnly) {
			return super.render().cloneNode(true);
		}

		return super.render();
	}

	_make(...args) {
		const result = super._make(...args);
		if (this.readOnly && result.contentEditable) {
			result.contentEditable = false;
		}
		return result;
	}
}
