import jsonfile from 'jsonfile';

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
        if (parent) {
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

        jsonfile.writeFileSync('package.json', packaged, { spaces: 4 })
    } catch (e) {
        process.stdout.write('An exception occurred:\n')
        if (e instanceof Error) process.stdout.write('    ' + e.message)
        process.stdout.write('\n')
        process.exit(1)
    }
}
