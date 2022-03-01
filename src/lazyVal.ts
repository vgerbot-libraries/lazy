import { lazyProp } from './index';

export interface LazyValOption<R> {
    evaluate: () => R;
    resetBy: Array<() => unknown>;
}

export function lazyVal<R>(opts: LazyValOption<R> | (() => R)) {
    return lazyProp(
        {
            __val__: null
        } as {},
        '__val__',
        opts
    );
}
