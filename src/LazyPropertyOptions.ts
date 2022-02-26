import { LazyEvaluateCallback } from './LazyEvaluateCallback';
import { DetectResetCallback } from './DetectResetCallback';

export interface LazyPropertyOptions<T, R> {
    evaluate: LazyEvaluateCallback<T, R>;
    resetBy?: Array<DetectResetCallback<T> | keyof T>;
    enumerable?: boolean;
}
