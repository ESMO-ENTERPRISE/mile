import { ChildProcess, SpawnOptions, spawn } from "child_process";
import { MESSAGES } from "./constants";
import { logger } from "./logger";

export const run = async (command: string, args: string[], collect = false): Promise<null | string> => {
    const cwd: string = process.cwd();
    const options: SpawnOptions = {
        cwd,
        stdio: collect ? 'pipe' : 'inherit',
        shell: true,
    };
    return new Promise<null | string>((resolve, reject) => {
        const child: ChildProcess = spawn(command, [...args], options);
        if (collect) {
            child.stdout!.on('data', (data) =>
                resolve(data.toString().replace(/\r\n|\n/, '')),
            );
            child.stderr!.on('data', () => {
                logger.error(MESSAGES.PACKAGE_MANAGER_ERROR);
            })
        }
        child.on('close', (code) => {
            if (code === 0) {
                resolve(null);
            } else {
                logger.error(MESSAGES.RUNNER_EXECUTION_ERROR(`${command}`));
                reject();
            }
        });
    });
}