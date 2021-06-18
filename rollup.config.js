import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import vue from "rollup-plugin-vue";
import postcss from "rollup-plugin-postcss";

export default {
	input: "src/index.js",
	output: {
		format: "es",
		file: "dist/extensions/interfaces/editorjs/index.js"
	},
	plugins: [
		vue({
			preprocessStyles: true
		}),
		postcss(),
		nodeResolve(),
		commonjs(),
		replace({
			"process.env.NODE_ENV": JSON.stringify("production"),
			preventAssignment: true
		}),
		process.env.NOTERSER ? null : terser()
	]
};
