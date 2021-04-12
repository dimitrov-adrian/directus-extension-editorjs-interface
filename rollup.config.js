import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import vue from "rollup-plugin-vue";

export default {
	input: "src/index.js",
	output: {
		format: "es",
		file: "dist/extensions/editorjs-interface/index.js"
	},
	plugins: [
		process.env.NOTERSER ? null : terser(),
		resolve(),
		commonjs(),
		vue()
	]
};
