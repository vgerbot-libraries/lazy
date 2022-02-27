import { LazyPropertyOptions } from './LazyPropertyOptions';
import { LazyEvaluateCallback } from './LazyEvaluateCallback';
import { lazyPropertyImpl } from './lazyPropertyImpl';
import { PropertyKey } from './PropertyKey';

export function lazyProp<T, K extends PropertyKey = keyof T, R extends T[keyof T] | unknown = T[keyof T]>(
    object: T,
    key: K,
    opts: LazyPropertyOptions<T, R> | LazyEvaluateCallback<T, R>
) {
    const getter = lazyPropertyImpl(object, key as unknown as keyof T, opts);
    return getter.call(object);
}
