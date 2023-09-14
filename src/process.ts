import jsonfile from 'jsonfile';
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
                process.exit(1);
            }
        });
    });
}

export const editPackageJson = ({
    parent,
    key,
    value,
    force
}: {
    parent?: string,
    key: string,
    value: string,
    force?: boolean
}) => {
    force = force || false;

    try {
        let packaged = jsonfile.readFileSync('package.json')
        if(parent) {
            if (!packaged[parent]) {
                packaged[parent] = {}
            }
            if (!force && packaged[parent][key]) {
                const message = `Attempted to update ` + parent + '.' + key + ` with "` + value + `"`
                throw new Error(message)
            }
    
            packaged[parent][key] = value.replace(/\+/g, ' ');
        } else {
            packaged[key] = value.replace(/\+/g, ' ');
        }
    jsonfile.writeFileSync('package.json', packaged, {spaces: 4})
    } catch (e) {
        process.stdout.write('An exception occurred:\n')
        if (e instanceof Error) process.stdout.write('    ' + e.message)
        process.stdout.write('\n')
        process.exit(1)
    }
}