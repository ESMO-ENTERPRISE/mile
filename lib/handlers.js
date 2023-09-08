var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import inquirer from 'inquirer';
import { MESSAGES } from './constants';
import { run } from './process';
// init typescript project, and install mile
export const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const { pm } = yield inquirer.prompt({
        name: 'pm',
        type: 'list',
        message: MESSAGES.PACKAGE_MANAGER_QUESTION,
        choices: [MESSAGES.PACKAGE_MANAGER_NPM, MESSAGES.PACKAGE_MANAGER_YARN, MESSAGES.PACKAGE_MANAGER_PNPM]
    });
    const sources = {
        'npm': () => __awaiter(void 0, void 0, void 0, function* () {
            yield run(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['-v']);
            yield run('npm', ['init', '--y'], true);
        })
    };
    sources[pm]();
});
