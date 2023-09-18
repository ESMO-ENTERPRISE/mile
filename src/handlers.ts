import { existsSync, mkdirSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { RollupBuild, rollup } from 'rollup';

import { buildBundleConfig, buildPreBundleConfig, generateOutputs } from './build';
import { INDEX_FILE_TEMPLATE, MESSAGES, MILEFU_CONFIG_FILE, MILEFU_CONFIG_TEMPLATE, SOURCE_DIRECTORY_NAME, TYPESCRIPT_CONFIG_FILE, TYPESCRIPT_CONFIG_TEMPLATE } from './constants';
import { editPackageJson } from './json';
import { Loader } from './loader';
import { logger } from './logger';
import { BuildOptions } from './options';
import { run } from './process';

// init typescript project, and install mile
export const init = async () => {
    const { pm } = await inquirer.prompt({
        name: 'pm',
        type: 'list',
        message: MESSAGES.PACKAGE_MANAGER_QUESTION,
        choices: [MESSAGES.PACKAGE_MANAGER_NPM, MESSAGES.PACKAGE_MANAGER_YARN, MESSAGES.PACKAGE_MANAGER_PNPM]
    });

    const { name } = await inquirer.prompt({
        name: 'name',
        type: 'input',
        message: MESSAGES.APPLICATION_NAME_QUESTION,
        default: path.basename(process.cwd())
    });

    const sources: Record<string, () => void> = {
        'npm': async () => {
            await run(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['-v']);
            await run('npm', ['init', '--y'], true);
            // await run('npm', ['install', '@vira/milefu', '-D'], true);
        },
        'pnpm': async () => {
            // await run(/^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm', ['-v']);
            await run('pnpm', ['init'], true);
            // await run('pnpm', ['install', '@vira/milefu', '-D'], true);
            // await run('pnpm', ['install', 'typescript', '-D'], true);
        },
        'yarn': async () => {
            await run(/^win/.test(process.platform) ? 'yarn.cmd' : 'yarn', ['-v']);
            await run('yarn', ['init', '-y'], true);
            // await run('yarn', ['install', '@vira/milefu', '-D'], true);
        },
    };

    const spinner = Loader.getInstance();
    spinner.setText(MESSAGES.PROJECT_CREATION_STATUS(name));
    spinner.start();

    if (existsSync('package.json')) logger.warn('A package.json already exists')
    const promise = new Promise<void>((resolve) => {
        resolve(sources[pm as string]())
    })

    await promise

    editPackageJson({ key: 'name', value: name, force: true })
    editPackageJson({ parent: 'scripts', key: 'build', value: 'npx milefu build' })
    editPackageJson({ key: 'main', value: `lib/${name}.mjs` })
    editPackageJson({ key: 'module', value: `lib/${name}.mjs` })
    editPackageJson({ key: 'typings', value: `lib/${name}.d.ts` })

    if (!existsSync(TYPESCRIPT_CONFIG_FILE)) writeFileSync(TYPESCRIPT_CONFIG_FILE, TYPESCRIPT_CONFIG_TEMPLATE);
    if (!existsSync(MILEFU_CONFIG_FILE)) writeFileSync(MILEFU_CONFIG_FILE, MILEFU_CONFIG_TEMPLATE);
    if (!existsSync(SOURCE_DIRECTORY_NAME)) {
        mkdirSync(SOURCE_DIRECTORY_NAME)
        writeFileSync('src/index.ts', INDEX_FILE_TEMPLATE);
    }

    spinner.success(MESSAGES.PROJECT_CREATION_SUCCESS(name));
}

export const build = async () => {
    let bundle: RollupBuild;
    let buildFailed = false;
    const spinner = Loader.getInstance();

    try {
        spinner.setText(MESSAGES.PROJECT_BUILD_STATUS);
        spinner.start();

        const options: BuildOptions = JSON.parse(JSON.stringify(await import(path.resolve(process.cwd(), MILEFU_CONFIG_FILE)))).default;
        // create a bundle
        bundle = await rollup(buildPreBundleConfig(options));

        await generateOutputs(bundle, buildBundleConfig(options));

        if (bundle) {
          // closes the bundle
          await bundle.close();
        }
    } catch (error) {
        buildFailed = true;

        if (error instanceof Error) spinner.error(error.message)
    }

    spinner.success(MESSAGES.PROJECT_BUILD_SUCCESS);
    process.exit(buildFailed ? 1 : 0);
}

