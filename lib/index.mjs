import figlet from 'figlet';
import { Command } from 'commander';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { rollup } from 'rollup';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import jsonfile from 'jsonfile';
import ora from 'ora';
import { Logger } from 'tslog';
import { spawn } from 'child_process';

var __async$2 = (__this, __arguments, generator) => {
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
const buildPreBundleConfig = (options) => ({
  input: options.input,
  external: (id) => !/^[./]/.test(id),
  logLevel: "silent"
});
const buildBundleConfig = (options) => {
  const config = [];
  const json = JSON.parse(readFileSync(path.resolve(process.cwd(), "package.json")).toString());
  if (options.typescript)
    config.push({
      plugins: [dts()],
      file: `${path.join(process.cwd(), options.output, json.name)}.d.ts`,
      format: "es"
    });
  if (options.format.includes("cjs"))
    config.push({
      file: `${path.join(process.cwd(), options.output, json.name)}.js`,
      format: "cjs",
      sourcemap: options.sourcemap,
      mimify: options.mimify,
      plugins: [typescript(), terser()]
    });
  if (options.format.includes("esm"))
    config.push({
      file: `${path.join(process.cwd(), options.output, json.name)}.mjs`,
      format: "es",
      sourcemap: options.sourcemap,
      mimify: options.mimify,
      plugins: [typescript(), terser()]
    });
  return config;
};
function generateOutputs(bundle, options) {
  return __async$2(this, null, function* () {
    for (const outputOptions of options) {
      yield bundle.write(outputOptions);
    }
  });
}

const SOURCE_DIRECTORY_NAME = "src";
const TYPESCRIPT_CONFIG_FILE = "tsconfig.json";
const MILEFU_CONFIG_FILE = "milefu.config.js";
const PACKAGE_JSON_CONFIG_FILE = "package.json";
const MESSAGES = {
  APPLICATION_NAME_QUESTION: `What is the name of your application?`,
  PACKAGE_MANAGER_QUESTION: `Which package manager would you \u{1F499} to use?`,
  PACKAGE_MANAGER_ERROR: "Package manager selected is not installed",
  PACKAGE_MANAGER_NPM: "npm",
  PACKAGE_MANAGER_YARN: "yarn",
  PACKAGE_MANAGER_PNPM: "pnpm",
  PROJECT_CREATION_STATUS: (name) => `Creating project ${name}`,
  PROJECT_CREATION_SUCCESS: (name) => `Project ${name} created. Files: ${MILEFU_CONFIG_FILE}, ${TYPESCRIPT_CONFIG_FILE}, ${PACKAGE_JSON_CONFIG_FILE} added or changed`,
  PROJECT_BUILD_STATUS: `Building project with options included in ${MILEFU_CONFIG_FILE}`,
  PROJECT_BUILD_ERROR: (error) => `Cannot build project. ${error}`,
  PROJECT_BUILD_SUCCESS: "Project built successfully",
  RUNNER_EXECUTION_ERROR: (command) => `
Failed to execute command: ${command}`
};
const TYPESCRIPT_CONFIG_TEMPLATE = `
{
    "include": ["src", "rollup.config.ts"],
    "compilerOptions": {
        "target": "ES6" /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', or 'ESNEXT'. */,
        "declaration": true /* Generates corresponding '.d.ts' file. */,
        "outDir": "lib" /* Redirect output structure to the directory. */,
        
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
const MILEFU_CONFIG_TEMPLATE = `module.exports = {
  format: ['esm', 'cjs'],
  output: 'lib',
  input: 'src/index.ts',
  sourcemap: true,
  typescript: true,
  mimify: true
}
`;
const INDEX_FILE_TEMPLATE = `
const app = () => {
  console.log('Hello World');
}

app();
`;

const editPackageJson = ({
  parent,
  key,
  value,
  force
}) => {
  force = force || false;
  try {
    let packaged = jsonfile.readFileSync("package.json");
    if (parent) {
      if (!packaged[parent]) {
        packaged[parent] = {};
      }
      if (!force && packaged[parent][key]) {
        const message = `Attempted to update ` + parent + "." + key + ` with "` + value + `"`;
        throw new Error(message);
      }
      packaged[parent][key] = value.replace(/\+/g, " ");
    } else {
      packaged[key] = value.replace(/\+/g, " ");
    }
    jsonfile.writeFileSync("package.json", packaged, { spaces: 4 });
  } catch (e) {
    process.stdout.write("An exception occurred:\n");
    if (e instanceof Error)
      process.stdout.write("    " + e.message);
    process.stdout.write("\n");
    process.exit(1);
  }
};

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _Loader = class _Loader {
  constructor() {
    __publicField(this, "ora");
    this.ora = ora();
  }
  static getInstance() {
    if (!_Loader.instance)
      return new _Loader();
    return _Loader.instance;
  }
  start() {
    this.ora.start();
  }
  stop() {
    this.ora.stop();
  }
  info(text) {
    this.ora.info(text);
  }
  success(text) {
    this.ora.info(this.ora.text);
    this.ora.succeed(text);
  }
  error(text) {
    this.ora.fail(text);
  }
  setText(text) {
    this.ora.text = text;
  }
  setSpinner(spinner) {
    this.ora.spinner = spinner;
  }
};
__publicField(_Loader, "instance");
let Loader = _Loader;

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
  const { name } = yield inquirer.prompt({
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
    }),
    "yarn": () => __async(void 0, null, function* () {
      yield run(/^win/.test(process.platform) ? "yarn.cmd" : "yarn", ["-v"]);
      yield run("yarn", ["init", "-y"], true);
    })
  };
  const spinner = Loader.getInstance();
  spinner.setText(MESSAGES.PROJECT_CREATION_STATUS(name));
  spinner.start();
  if (existsSync("package.json"))
    logger.warn("A package.json already exists");
  const promise = new Promise((resolve) => {
    resolve(sources[pm]());
  });
  yield promise;
  editPackageJson({ key: "name", value: name, force: true });
  editPackageJson({ parent: "scripts", key: "build", value: "npx milefu build" });
  editPackageJson({ key: "main", value: `lib/${name}.mjs` });
  editPackageJson({ key: "module", value: `lib/${name}.mjs` });
  editPackageJson({ key: "typings", value: `lib/${name}.d.ts` });
  if (!existsSync(TYPESCRIPT_CONFIG_FILE))
    writeFileSync(TYPESCRIPT_CONFIG_FILE, TYPESCRIPT_CONFIG_TEMPLATE);
  if (!existsSync(MILEFU_CONFIG_FILE))
    writeFileSync(MILEFU_CONFIG_FILE, MILEFU_CONFIG_TEMPLATE);
  if (!existsSync(SOURCE_DIRECTORY_NAME)) {
    mkdirSync(SOURCE_DIRECTORY_NAME);
    writeFileSync("src/index.ts", INDEX_FILE_TEMPLATE);
  }
  spinner.success(MESSAGES.PROJECT_CREATION_SUCCESS(name));
});
const build = () => __async(void 0, null, function* () {
  let bundle;
  let buildFailed = false;
  const spinner = Loader.getInstance();
  try {
    spinner.setText(MESSAGES.PROJECT_BUILD_STATUS);
    spinner.start();
    const options = JSON.parse(JSON.stringify(yield import(path.resolve(process.cwd(), MILEFU_CONFIG_FILE)))).default;
    bundle = yield rollup(buildPreBundleConfig(options));
    yield generateOutputs(bundle, buildBundleConfig(options));
    if (bundle) {
      yield bundle.close();
    }
  } catch (error) {
    buildFailed = true;
    if (error instanceof Error)
      spinner.error(error.message);
  }
  spinner.success(MESSAGES.PROJECT_BUILD_SUCCESS);
  process.exit(buildFailed ? 1 : 0);
});

const getHandler = (options) => {
  const handlers = {
    "init": () => init(),
    "build": () => build()
  };
  Object.keys(options).forEach((option) => handlers[option]());
};
const cli = () => {
  console.log(figlet.textSync("MILE"));
  const program = new Command();
  program.version("0.0.1").description("The simplest and fastest way to bundle your TypeScript libraries").option("-i, --init", "Initialize project with default config").option("-b, --build", "Build project based on milefu.config.js").parse(process.argv);
  getHandler(program.opts());
  if (!process.argv.slice(2).length)
    program.outputHelp();
};
cli();
//# sourceMappingURL=index.mjs.map
