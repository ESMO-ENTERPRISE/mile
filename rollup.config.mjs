import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import resolve from "@rollup/plugin-node-resolve";

// const name = require('./package.json').main.replace(/\.js$/, '')

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
})

export default [
  bundle({
    plugins: [esbuild(), resolve()],
    output: [
      {
        file: `lib/index.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `lib/index.d.ts`,
      format: 'es',
    },
  }),
]