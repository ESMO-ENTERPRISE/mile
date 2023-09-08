#! /usr/bin/env node
import { textSync } from 'figlet';
import { Command } from 'commander';
import { init } from './handlers';
const getHandler = (options) => {
    const handlers = {
        'init': () => init()
    };
    Object.keys(options).forEach(option => handlers[option]());
};
const cli = () => {
    console.log(textSync('MILE'));
    const program = new Command();
    program
        .version('0.0.1')
        .description('The simplest and fastest way to bundle your TypeScript libraries')
        .option('-i, --init', 'Initialize project with default config')
        .parse(process.argv);
    getHandler(program.opts());
    if (!process.argv.slice(2).length)
        program.outputHelp();
};
export default cli();
