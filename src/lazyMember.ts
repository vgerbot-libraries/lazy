import { LazyPropertyOptions } from './LazyPropertyOptions';
import { LazyEvaluateCallback } from './LazyEvaluateCallback';
import { lazyPropertyImpl } from './lazyPropertyImpl';

export function lazyMember<T extends Object, K extends keyof T = keyof T, R extends T[K] = T[K]>(
    opts: LazyPropertyOptions<T, R> | LazyEvaluateCallback<T, R>
): PropertyDecorator {
    return (prototype: Object, propertyKey: string | symbol) => {
        lazyPropertyImpl(prototype as T, propertyKey as keyof T, opts);
    };
}
