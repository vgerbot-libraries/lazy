import { ClassType } from './ClassType';
import { LazyPropertyOptions } from './LazyPropertyOptions';
import { LazyEvaluateCallback } from './LazyEvaluateCallback';
import { lazyPropertyImpl } from './lazyPropertyImpl';

export function lazyMemberOfClass<T, K extends keyof T = keyof T, R = T[K]>(
    clazz: ClassType<T>,
    key: K,
    opts: LazyPropertyOptions<T, R> | LazyEvaluateCallback<T, R>
) {
    lazyPropertyImpl(clazz.prototype, key, opts);
}
