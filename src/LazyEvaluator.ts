import { LazyEvaluateCallback } from './LazyEvaluateCallback';

interface LazyEvalutatorOptions<T, R> {
    target: T;
    evaluate: LazyEvaluateCallback<T, R>;
    resetTesters: Array<(instance: T) => boolean>;
}
function noop() {
    // EMPTY
}

const NOT_INITIALIZED_OBJECT = {};

export class LazyEvaluator<T, R> {
    private context: T;
    private computeFn: (instance: T) => R;
    private evaluateResult: R = NOT_INITIALIZED_OBJECT as R;
    private resetTester: Array<(context: T) => boolean>;
    constructor(options: LazyEvalutatorOptions<T, R>) {
        this.context = options.target;
        this.computeFn = options.evaluate;
        this.resetTester = options.resetTesters;
    }
    release(): void {
        this.reset(noop as unknown as (i: T) => R);
    }
    reset(evaluate?: (instance: T) => R): void {
        this.evaluateResult = NOT_INITIALIZED_OBJECT as R;
        this.computeFn = evaluate || this.computeFn;
    }
    evaluate(): void {
        if (!this.isPresent() || this.needReset()) {
            this.evaluateResult = this.computeFn.call(this.context, this.context);
        }
    }
    get(): R {
        this.evaluate();
        return this.evaluateResult;
    }
    isPresent(): boolean {
        return this.evaluateResult !== NOT_INITIALIZED_OBJECT;
    }
    needReset() {
        return this.resetTester.some(it => it(this.context));
    }
}
