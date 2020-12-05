import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import vue from "rollup-plugin-vue";

export default {
  input: "src/index.js",
  output: {
    format: "es",
    file: "dist/index.js",
  },
  plugins: [terser(), resolve(), commonjs(), vue()],
};
