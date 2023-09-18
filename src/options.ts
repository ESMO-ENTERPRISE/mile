export type BuildOptions = {
    format: ('esm' | 'cjs')[],
    output: string,
    input: string,
    typescript: boolean,
    sourcemap: boolean,
    mimify: boolean
}