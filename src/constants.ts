export const SOURCE_DIRECTORY_NAME = 'src';
export const TYPESCRIPT_CONFIG_FILE = 'tsconfig.json';
export const MILEFU_CONFIG_FILE = 'milefu.config.js';
export const PACKAGE_JSON_CONFIG_FILE = 'package.json';

export const MESSAGES = {
  APPLICATION_NAME_QUESTION: `What is the name of your application?`,
  PACKAGE_MANAGER_QUESTION: `Which package manager would you 💙 to use?`,
  PACKAGE_MANAGER_ERROR: 'Package manager selected is not installed',
  PACKAGE_MANAGER_NPM: 'npm',
  PACKAGE_MANAGER_YARN: 'yarn',
  PACKAGE_MANAGER_PNPM: 'pnpm',
  PROJECT_CREATION_STATUS: (name: string) => `Creating project ${name}`,
  PROJECT_CREATION_SUCCESS: (name: string) => `Project ${name} created. Files: ${MILEFU_CONFIG_FILE}, ${TYPESCRIPT_CONFIG_FILE}, ${PACKAGE_JSON_CONFIG_FILE} added or changed`,
  PROJECT_BUILD_STATUS: `Building project with options included in ${MILEFU_CONFIG_FILE}`,
  PROJECT_BUILD_ERROR: (error: string) => `Cannot build project. ${error}`,
  PROJECT_BUILD_SUCCESS: 'Project built successfully',
  RUNNER_EXECUTION_ERROR: (command: string) => `\nFailed to execute command: ${command}`,
}

export const TYPESCRIPT_CONFIG_TEMPLATE = `
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

export const MILEFU_CONFIG_TEMPLATE = `module.exports = {
  format: ['esm', 'cjs'],
  output: 'lib',
  input: 'src/index.ts',
  sourcemap: true,
  typescript: true,
  mimify: true
}
`

export const INDEX_FILE_TEMPLATE = `
const app = () => {
  console.log('Hello World');
}

app();
`