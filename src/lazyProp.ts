import { LazyPropertyOptions } from './LazyPropertyOptions';
import { LazyEvaluateCallback } from './LazyEvaluateCallback';
import { lazyPropertyImpl } from './lazyPropertyImpl';

export function lazyProp<T, K extends keyof T = keyof T, R = T[K]>(
    object: T,
    key: K,
    opts: LazyPropertyOptions<T, R> | LazyEvaluateCallback<T, R>
) {
    const getter = lazyPropertyImpl(object, key, opts);
    return getter.call(object);
}
