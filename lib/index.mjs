import figlet from 'figlet';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import ora from 'ora';
import 'jsonfile';
import { spawn } from 'child_process';
import { Logger } from 'tslog';

const MESSAGES = {
  APPLICATION_NAME_QUESTION: `What is the name of your application?`,
  PACKAGE_MANAGER_QUESTION: `Which package manager would you \u{1F499} to use?`,
  PACKAGE_MANAGER_ERROR: "Package manager selected is not installed",
  PACKAGE_MANAGER_NPM: "npm",
  PACKAGE_MANAGER_YARN: "yarn",
  PACKAGE_MANAGER_PNPM: "pnpm",
  RUNNER_EXECUTION_ERROR: (command) => `
Failed to execute command: ${command}`
};
const TYPESCRIPT_CONFIG_TEMPLATE = `
{
    "include": ["src", "rollup.config.ts"],
    "compilerOptions": {
        "target": "ES6" /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', or 'ESNEXT'. */,
        "declaration": true /* Generates corresponding '.d.ts' file. */,
        "outDir": "dist" /* Redirect output structure to the directory. */,
        
        /* Strict Type-Checking Options */
        "strict": true /* Enable all strict type-checking options. */,
        "noImplicitAny": true /* Raise error on expressions and declarations with an implied 'any' type. */,
        "strictNullChecks": true /* Enable strict null checks. */,
        "strictFunctionTypes": true /* Enable strict checking of function types. */,
        "strictBindCallApply": true /* Enable strict 'bind', 'call', and 'apply' methods on functions. */,
        "strictPropertyInitialization": true /* Enable strict checking of property initialization in classes. */,
        "noImplicitThis": true /* Raise error on 'this' expressions with an implied 'any' type. */,
        "alwaysStrict": true /* Parse in strict mode and emit "use strict" for each source file. */,

        /* Additional Checks */
        "noUnusedLocals": true /* Report errors on unused locals. */,
        "noUnusedParameters": true /* Report errors on unused parameters. */,
        "noImplicitReturns": true /* Report error when not all code paths in function return a value. */,
        "noFallthroughCasesInSwitch": true /* Report errors for fallthrough cases in switch statement. */,
        "noUncheckedIndexedAccess": true /* Include 'undefined' in index signature results */,

        /* Module Resolution Options */
        "moduleResolution": "node" /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */,
        "resolveJsonModule": true,
        "allowSyntheticDefaultImports": true /* Allow default imports from modules with no default export. This does not affect code emit, just typechecking. */,
        "esModuleInterop": true /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */,
        
        /* Advanced Options */
        "skipLibCheck": true /* Skip type checking of declaration files. */,
        "forceConsistentCasingInFileNames": true /* Disallow inconsistently-cased references to the same file. */
    }
  }
`;

const logger = new Logger({});

var __async$1 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const run = (command, args, collect = false) => __async$1(void 0, null, function* () {
  const cwd = process.cwd();
  const options = {
    cwd,
    stdio: collect ? "pipe" : "inherit",
    shell: true
  };
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args], options);
    if (collect) {
      child.stdout.on(
        "data",
        (data) => resolve(data.toString().replace(/\r\n|\n/, ""))
      );
      child.stderr.on("data", () => {
        logger.error(MESSAGES.PACKAGE_MANAGER_ERROR);
      });
    }
    child.on("close", (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        logger.error(MESSAGES.RUNNER_EXECUTION_ERROR(`${command}`));
        reject();
        process.exit(1);
      }
    });
  });
});

var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const init = () => __async(void 0, null, function* () {
  const { pm } = yield inquirer.prompt({
    name: "pm",
    type: "list",
    message: MESSAGES.PACKAGE_MANAGER_QUESTION,
    choices: [MESSAGES.PACKAGE_MANAGER_NPM, MESSAGES.PACKAGE_MANAGER_YARN, MESSAGES.PACKAGE_MANAGER_PNPM]
  });
  yield inquirer.prompt({
    name: "name",
    type: "input",
    message: MESSAGES.APPLICATION_NAME_QUESTION,
    default: path.basename(process.cwd())
  });
  const sources = {
    "npm": () => __async(void 0, null, function* () {
      yield run(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["-v"]);
      yield run("npm", ["init", "--y"], true);
    }),
    "pnpm": () => __async(void 0, null, function* () {
      yield run("pnpm", ["init"], true);
      writeFileSync("tsconfig.ts", TYPESCRIPT_CONFIG_TEMPLATE);
    }),
    "yarn": () => __async(void 0, null, function* () {
      yield run(/^win/.test(process.platform) ? "yarn.cmd" : "yarn", ["-v"]);
      yield run("yarn", ["init", "-y"], true);
    })
  };
  const spinner = ora({
    text: "Initializing project"
  }).start();
  if (existsSync("package.json"))
    logger.warn("A package.json already exists");
  const promise = new Promise((resolve) => {
    resolve(sources[pm]());
  });
  yield promise;
  spinner.stop();
});

const getHandler = (options) => {
  const handlers = {
    "init": () => init()
  };
  Object.keys(options).forEach((option) => handlers[option]());
};
const cli = () => {
  console.log(figlet.textSync("MILE"));
  const program = new Command();
  program.version("0.0.1").description("The simplest and fastest way to bundle your TypeScript libraries").option("-i, --init", "Initialize project with default config").parse(process.argv);
  getHandler(program.opts());
  if (!process.argv.slice(2).length)
    program.outputHelp();
};
cli();
//# sourceMappingURL=index.mjs.map
