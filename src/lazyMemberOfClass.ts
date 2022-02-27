import { ClassType } from './ClassType';
import { LazyPropertyOptions } from './LazyPropertyOptions';
import { LazyEvaluateCallback } from './LazyEvaluateCallback';
import { lazyPropertyImpl } from './lazyPropertyImpl';

export function lazyMemberOfClass<T, K extends keyof T = keyof T, R extends T[keyof T] = T[keyof T]>(
    clazz: ClassType<T>,
    key: K,
    opts: LazyPropertyOptions<T, R> | LazyEvaluateCallback<T, R>
) {
    lazyPropertyImpl(clazz.prototype, key as keyof T, opts);
}
