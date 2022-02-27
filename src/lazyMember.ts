import { LazyPropertyOptions } from './LazyPropertyOptions';
import { LazyEvaluateCallback } from './LazyEvaluateCallback';
import { lazyPropertyImpl } from './lazyPropertyImpl';

export function lazyMember<T, K extends keyof T = keyof T, R extends T[K] = T[K]>(
    opts: LazyPropertyOptions<T, R> | LazyEvaluateCallback<T, R>
) {
    return (prototype: T, propertyKey: keyof T) => {
        lazyPropertyImpl(prototype, propertyKey, opts);
    };
}
