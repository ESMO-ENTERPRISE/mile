import inquirer from 'inquirer'
import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import ora from 'ora';

import { MESSAGES, TYPESCRIPT_CONFIG_TEMPLATE } from './constants'
import { editPackageJson, run } from './process'
import { logger } from './logger';

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
            writeFileSync('tsconfig.ts', TYPESCRIPT_CONFIG_TEMPLATE);
        },
        'yarn': async () => {
            await run(/^win/.test(process.platform) ? 'yarn.cmd' : 'yarn', ['-v']);
            await run('yarn', ['init', '-y'], true);
            // await run('yarn', ['install', '@vira/milefu', '-D'], true);
        },
    };

    
    const spinner = ora({
        text: 'Initializing project',
    }).start();
    
    if (existsSync('package.json')) logger.warn('A package.json already exists')
    const promise = new Promise<void>((resolve) => {
        resolve(sources[pm as string]())
    })

    await promise
    // else await sources[pm as string];

    // editPackageJson({key: 'name', value: name, force: true})
    // editPackageJson({parent: 'scripts', 'key': 'build', value: 'npx milefu build'})

    spinner.stop();
}