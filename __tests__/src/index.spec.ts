import { lazyVal } from '../../src';
import { generateFunctionalTester, generatePropertyTester } from '../../src/lazyPropertyImpl';

describe('root', () => {
    describe('generatePropertyTester', () => {
        it('should returning true if property value has been changed', () => {
            const object = {
                key: 0
            };
            const tester = generatePropertyTester<typeof object>('key');
            expect(tester(object)).toBeTruthy();
            expect(tester(object)).toBeFalsy();
            object.key = 1;
            expect(tester(object)).toBeTruthy();
            expect(tester(object)).toBeFalsy();
        });
    });

    describe('generateFunctionalTester', () => {
        it('should returning true if the result returned from the function has been changed', () => {
            let value = 0;
            const tester = generateFunctionalTester<void>(() => {
                return value;
            });
            expect(tester()).toBeTruthy();
            expect(tester()).toBeFalsy();

            value = 1;

            expect(tester()).toBeTruthy();
            expect(tester()).toBeFalsy();
        });
    });

    describe('lazyVal', () => {
        it('should lazily load the value', () => {
            const lv = lazyVal(() => Math.random());
            expect(lv.isPresent()).toBeFalsy();
            lv.get();
            expect(lv.isPresent()).toBeTruthy();
        });
        it('should evaluator be called only once', () => {
            const fn = jest.fn(() => Math.random());
            const lv = lazyVal(fn);
            const value1 = lv.get();
            expect(lv.get()).toBe(value1);
            expect(fn).toBeCalledTimes(1);
        });
        it('should reset the computed value', () => {
            const fn = jest.fn(() => Math.random());
            const lv = lazyVal(fn);
            expect(lv.isPresent()).toBeFalsy();
            const value1 = lv.get();
            expect(lv.isPresent()).toBeTruthy();
            lv.reset();
            expect(lv.isPresent()).toBeFalsy();
            const value2 = lv.get();
            expect(lv.isPresent()).toBeTruthy();
            expect(value1).not.toBe(value2);
            expect(fn).toBeCalledTimes(2);
        });
    });
});
