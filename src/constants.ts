
export const MESSAGES = {
    PACKAGE_MANAGER_QUESTION: `Which package manager would you 💙 to use?`,
    PACKAGE_MANAGER_ERROR: 'Package manager selected is not installed',
    PACKAGE_MANAGER_NPM: 'npm',
    PACKAGE_MANAGER_YARN: 'yarn',
    PACKAGE_MANAGER_PNPM: 'pnpm',
    RUNNER_EXECUTION_ERROR: (command: string) => `\nFailed to execute command: ${command}`,
}