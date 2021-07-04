import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import vue from "rollup-plugin-vue";
import postcss from "rollup-plugin-postcss";

export default {
	input: "src/index.js",
	output: {
		format: "es",
		file: "dist/extensions/interfaces/editorjs/index.js",
	},
	external: ["vue", "@directus/extension-sdk"],
	plugins: [
		vue({ preprocessStyles: true }),
		postcss(),
		nodeResolve(),
		commonjs(),
		process.env.NOTERSER ? null : terser(),
	],
};
