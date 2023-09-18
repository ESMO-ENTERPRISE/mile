import ora, {Ora, Spinner} from "ora";

export class Loader {
    private static instance: Loader;
    private ora: Ora;

    private constructor() {
        this.ora = ora();
    }

    public static getInstance() {
        if (!Loader.instance)
            return new Loader();

        return Loader.instance;
    }

    public start() {
        this.ora.start();
    }

    public stop() {
        this.ora.stop();
    }

    public info(text: string) {
        this.ora.info(text);
    }

    public success(text: string) {
        this.ora.info(this.ora.text);
        this.ora.succeed(text);
    }

    public error(text: string) {
        this.ora.fail(text);
    }

    public setText(text: string) {
        this.ora.text = text;
    }

    public setSpinner(spinner: Spinner) {
        this.ora.spinner = spinner;
    }
}