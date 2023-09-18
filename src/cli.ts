#! /usr/bin/env node

import figlet from 'figlet';
import { Command, OptionValues } from 'commander';
import { build, init } from './handlers';

const getHandler = (options: OptionValues) => {
    const handlers: Record<string, () => void> = {
        'init': () => init(),
        'build': () => build()
    };

    Object.keys(options).forEach(option => handlers[option as string]());
}

const cli = () => {
    console.log(figlet.textSync('MILE'))

    const program = new Command();

    program
        .version('0.0.1')
        .description('The simplest and fastest way to bundle your TypeScript libraries')
        .option('-i, --init', 'Initialize project with default config')
        .option('-b, --build', 'Build project based on milefu.config.js')
        .parse(process.argv);

    getHandler(program.opts<{ init: string }>());

    if (!process.argv.slice(2).length)
        program.outputHelp();
}

export default cli();
