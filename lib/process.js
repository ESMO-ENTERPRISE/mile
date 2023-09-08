var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spawn } from "child_process";
import { MESSAGES } from "./constants";
import { logger } from "./logger";
export const run = (command, args, collect = false) => __awaiter(void 0, void 0, void 0, function* () {
    const cwd = process.cwd();
    const options = {
        cwd,
        stdio: collect ? 'pipe' : 'inherit',
        shell: true,
    };
    return new Promise((resolve, reject) => {
        const child = spawn(command, [...args], options);
        if (collect) {
            child.stdout.on('data', (data) => resolve(data.toString().replace(/\r\n|\n/, '')));
            child.stderr.on('data', () => {
                logger.error(MESSAGES.PACKAGE_MANAGER_ERROR);
            });
        }
        child.on('close', (code) => {
            if (code === 0) {
                resolve(null);
            }
            else {
                logger.error(MESSAGES.RUNNER_EXECUTION_ERROR(`${command}`));
                reject();
            }
        });
    });
});
