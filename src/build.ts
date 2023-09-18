import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";
import path from "path";
import { RollupBuild, RollupOptions } from "rollup";
import { dts } from "rollup-plugin-dts";
import { BuildOptions } from "./options";

export const buildPreBundleConfig = (options: BuildOptions): RollupOptions => ({
    input: options.input,
    external: (id: any) => !/^[./]/.test(id),
    logLevel: 'silent'
})

export const buildBundleConfig = (options: BuildOptions) => {
    const config: any[] = [];
    const json = JSON.parse(readFileSync(path.resolve(process.cwd(), 'package.json')).toString());

    if (options.typescript)
        config.push({
            plugins: [dts()],
            file: `${path.join(process.cwd(), options.output, json.name)}.d.ts`,
            format: 'es',
        })
    
    if (options.format.includes("cjs"))
        config.push({
            file: `${path.join(process.cwd(), options.output, json.name)}.js`,
            format: 'cjs',
            sourcemap: options.sourcemap,
            mimify: options.mimify,
            plugins: [typescript(), terser()]
        })

    if (options.format.includes("esm"))
        config.push({
            file: `${path.join(process.cwd(), options.output, json.name)}.mjs`,
            format: 'es',
            sourcemap: options.sourcemap,
            mimify: options.mimify,
            plugins: [typescript(), terser()]
        })

    return config;
}

export async function generateOutputs(bundle: RollupBuild, options: any[]) {
    for (const outputOptions of options) {
        await bundle.write(outputOptions);
    }
}

