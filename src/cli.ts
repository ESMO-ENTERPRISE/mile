#! /usr/bin/env node

import { textSync } from 'figlet';
import { Command, OptionValues } from 'commander';
import { init } from './handlers';

const getHandler = (options: OptionValues) => {
    const handlers: Record<string, () => void> = {
        'init': () => init()
    };

    Object.keys(options).forEach(option => handlers[option as string]());
}

const cli = () => {
    console.log(textSync('MILE'))

    const program = new Command();

    program
        .version('0.0.1')
        .description('The simplest and fastest way to bundle your TypeScript libraries')
        .option('-i, --init', 'Initialize project with default config')
        .parse(process.argv);

    getHandler(program.opts<{ init: string }>());

    if (!process.argv.slice(2).length)
        program.outputHelp();
}

export default cli();
