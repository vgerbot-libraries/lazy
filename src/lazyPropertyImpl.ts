import { LazyPropertyOptions } from './LazyPropertyOptions';
import { LazyEvaluateCallback } from './LazyEvaluateCallback';
import { LazyEvaluator } from './LazyEvaluator';
import { DetectResetCallback } from './DetectResetCallback';

type LazyRecord<T, R> = Record<PropertyKey, LazyEvaluator<T, R>>;

export interface LazyContext<T, R> {
    __lazy__: LazyRecord<T, R>;
}

export function lazyPropertyImpl<T, K extends keyof T = keyof T, R = T[K]>(
    object: T,
    propertyKey: K,
    opts: LazyPropertyOptions<T, R> | LazyEvaluateCallback<T, R>
) {
    let options: LazyPropertyOptions<T, R>;
    if (typeof opts === 'function') {
        options = {
            evaluate: opts
        };
    } else {
        options = {
            ...opts
        };
    }
    const desc = Object.getOwnPropertyDescriptor(object, propertyKey);
    if (desc && !desc.configurable) {
        throw new Error(`Cannot override override property: ${String(propertyKey)}`);
    }
    const enumerable = typeof options.enumerable === 'boolean' ? options.enumerable : desc?.enumerable || true;
    const resetBy = options.resetBy || [];

    const evaluatorGetter = function (this: T) {
        return getEvaluator<T, R>(this as unknown as LazyContext<T, R>, propertyKey, options.evaluate, resetBy);
    };
    Object.defineProperty(object, propertyKey, {
        configurable: true,
        enumerable: enumerable,
        get() {
            const evaluator = evaluatorGetter.call(this);
            return evaluator.get();
        }
    });
    return evaluatorGetter;
}

function getEvaluator<T, R>(
    context: LazyContext<T, R>,
    key: PropertyKey,
    evaluate: LazyEvaluateCallback<T, R>,
    tester: Array<DetectResetCallback<T> | keyof T>
) {
    if (!context.__lazy__) {
        Object.defineProperty(context, '__lazy__', {
            value: {},
            enumerable: false,
            writable: false,
            configurable: false
        });
    }
    const lazyRecord = context.__lazy__;
    if (!lazyRecord[key]) {
        const resetTesters = tester.map(it => {
            if (typeof it === 'string' || typeof it === 'number' || typeof it === 'symbol') {
                return generatePropertyTester<T>(it);
            }
            return generateFunctionalTester(it);
        });
        lazyRecord[key] = new LazyEvaluator<T, R>({
            target: context as unknown as T,
            evaluate,
            resetTesters: resetTesters
        });
    }
    return lazyRecord[key];
}

export function generateFunctionalTester<T>(callback: DetectResetCallback<T>) {
    let prevValue: unknown;
    return (context: T) => {
        const currentValue = callback(context);
        const changed = currentValue !== prevValue;
        prevValue = currentValue;
        return changed;
    };
}

export function generatePropertyTester<T>(key: keyof T) {
    let prevValue: unknown;
    return (context: T) => {
        const currentValue = context[key];
        const changed = currentValue !== prevValue;
        prevValue = currentValue;
        return changed;
    };
}
