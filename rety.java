public class Retryable<T> {
    private Supplier<T> action = () -> null;
    private Predicate<T> successCondition = ($) -> true;
    private int numberOfTries = 3;
    private long delay = 1000L;
    private Supplier<T> fallback = () -> null;

    public static <A> Retryable<A> of(Supplier<A> action) {
        return new Retryable<A>().run(action);
    }

    public Retryable<T> run(Supplier<T> action) {
        this.action = action;
        return this;
    }

    public Retryable<T> successIs(Predicate<T> successCondition) {
        this.successCondition = successCondition;
        return this;
    }

    public Retryable<T> retries(int numberOfTries) {
        this.numberOfTries = numberOfTries;
        return this;
    }

    public Retryable<T> delay(long delay) {
        this.delay = delay;
        return this;
    }

    public Retryable<T> orElse(Supplier<T> fallback) {
        this.fallback = fallback;
        return this;
    }

    public T execute() {
        for (int i = 0; i < numberOfTries; i++) {
            T t = action.get();
            if (successCondition.test(t)) {
                return t;
            }

            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                // do nothing
            }
        }
        return fallback.get();
    }
}

public Optional<String> doSomething() {
    return Retryable
        .of(() -> actualDoSomething())
        .successIs(Optional::isPresent)
        .retries(3)
        .delay(1000L)
        .orElse(Optional::empty)
        .execute();
}