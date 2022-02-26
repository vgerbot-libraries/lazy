import { LazyPropertyOptions } from './LazyPropertyOptions';
import { LazyEvaluateCallback } from './LazyEvaluateCallback';
import { lazyPropertyImpl } from './lazyPropertyImpl';

export function lazyMember<T, R extends T[keyof T]>(opts: LazyPropertyOptions<T, R> | LazyEvaluateCallback<T, R>) {
    return (prototype: T, propertyKey: keyof T) => {
        lazyPropertyImpl(prototype, propertyKey, opts);
    };
}
