import inquirer from 'inquirer'
import { MESSAGES } from './constants'
import { run } from './process'

// init typescript project, and install mile
export const init = async () => {
    const { pm } = await inquirer.prompt({
        name: 'pm',
        type: 'list',
        message: MESSAGES.PACKAGE_MANAGER_QUESTION,
        choices: [MESSAGES.PACKAGE_MANAGER_NPM, MESSAGES.PACKAGE_MANAGER_YARN, MESSAGES.PACKAGE_MANAGER_PNPM]
    });

    const sources: Record<string, () => void> = {
        'npm': async () => {
            await run(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['-v']);
            await run('npm', ['init', '--y'], true);
        }
    };

    sources[pm as string]();
}