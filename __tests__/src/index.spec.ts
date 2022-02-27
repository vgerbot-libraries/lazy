import { lazyMember, lazyMemberOfClass, lazyProp, lazyVal } from '../../src';
import { generateFunctionalTester, generatePropertyTester, lazyPropertyImpl } from '../../src/lazyPropertyImpl';

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
            const evaluator = lazyVal(fn);
            const value1 = evaluator.get();
            expect(evaluator.get()).toBe(value1);
            expect(fn).toBeCalledTimes(1);
        });
        it('should reset the computed value', () => {
            const fn = jest.fn(() => Math.random());
            const evaluator = lazyVal(fn);
            expect(evaluator.isPresent()).toBeFalsy();
            const value1 = evaluator.get();
            expect(evaluator.isPresent()).toBeTruthy();
            evaluator.reset();
            expect(evaluator.isPresent()).toBeFalsy();
            const value2 = evaluator.get();
            expect(evaluator.isPresent()).toBeTruthy();
            expect(value1).not.toBe(value2);
            expect(fn).toBeCalledTimes(2);
        });
    });
    describe('lazyProp', () => {
        it('should lazy load the property value', () => {
            const obj = {} as {
                k: number;
            };
            const fn = jest.fn(() => Math.random());
            const evaluator = lazyProp(obj, 'k', fn);
            expect(evaluator.isPresent()).toBeFalsy();
            const value = obj.k;
            expect(evaluator.isPresent()).toBeTruthy();
            expect(evaluator.get()).toBe(value);
            expect(fn).toBeCalledTimes(1);
        });
        it('should throw error when trying to overwrite unconfigurable property', () => {
            const obj = {} as {
                k: number;
            };
            Object.defineProperty(obj, 'k', {
                value: -1,
                configurable: false
            });
            expect(
                jest.fn(() => {
                    lazyProp(obj, 'k', () => 0);
                })
            ).toThrow();
        });
        it('should reset the computed  property value', () => {
            const obj = {} as {
                k: number;
            };
            const fn = jest.fn(() => Math.random());
            const evaluator = lazyProp(obj, 'k', fn);
            expect(evaluator.isPresent()).toBeFalsy();
            const value1 = obj.k;
            expect(evaluator.isPresent()).toBeTruthy();
            evaluator.reset();
            expect(evaluator.isPresent()).toBeFalsy();
            const value2 = obj.k;
            expect(evaluator.isPresent()).toBeTruthy();
            expect(value1).not.toBe(value2);
            expect(fn).toBeCalledTimes(2);
        });
    });
    describe('lazyMember', () => {
        it('should lazy load the property value only once', () => {
            const fn = jest.fn(() => Math.random());
            class TestLazyMember {
                @lazyMember<TestLazyMember, 'lazyMember'>(fn)
                lazyMember!: number;
            }
            const obj = new TestLazyMember();
            const value1 = obj.lazyMember;
            const value2 = obj.lazyMember;
            expect(value1).toBe(value2);
            expect(fn).toBeCalledTimes(1);
        });
        it('should different instances of the same class do not affect each other', () => {
            const fn = jest.fn(() => Math.random());
            class TestLazyMember {
                @lazyMember<TestLazyMember, 'lazyMember'>(fn)
                lazyMember!: number;
            }
            const obj = new TestLazyMember();
            const obj2 = new TestLazyMember();
            const value1 = obj.lazyMember;
            const value2 = obj2.lazyMember;
            expect(value1).not.toBe(value2);
            expect(fn).toBeCalledTimes(2);
        });
    });
    describe('lazyMemberOfClass', () => {
        it('should lazy load the property value', () => {
            class TestLazyMemberClass {
                k!: number;
            }
            const fn = jest.fn(() => Math.random());
            lazyMemberOfClass(TestLazyMemberClass, 'k', fn);
            const obj = new TestLazyMemberClass();
            const value1 = obj.k;
            const value2 = obj.k;
            expect(value1).toBe(value2);
            expect(fn).toBeCalledTimes(1);
        });
        it('should different instances of the same class do not affect each other', () => {
            const fn = jest.fn(() => Math.random());
            class TestLazyMemberClass {
                k!: number;
            }
            lazyMemberOfClass(TestLazyMemberClass, 'k', fn);
            const obj = new TestLazyMemberClass();
            const obj2 = new TestLazyMemberClass();
            const value1 = obj.k;
            const value2 = obj2.k;
            expect(value1).not.toBe(value2);
            expect(fn).toBeCalledTimes(2);
        });
    });
    describe('evaluator options', () => {
        it('should reset testers(property name) work correctly', () => {
            type ObjType = { k: number; v: number };
            const obj = {
                v: 1
            } as ObjType;
            const fn = jest.fn((o: ObjType) => o.v);
            lazyPropertyImpl(obj, 'k', {
                evaluate: fn,
                resetBy: ['v']
            });
            expect(obj.k).toBe(obj.v);
            expect(fn).toBeCalledTimes(1);
            obj.v = 2;
            expect(obj.k).toBe(obj.v);
            expect(fn).toBeCalledTimes(2);
        });
        it('should reset testers(tester function) work correctly', () => {
            type ObjType = { k: number; v: number };
            const obj = {
                v: 1
            } as ObjType;
            const fn = jest.fn((o: ObjType) => o.v);
            const tester = jest.fn((obj: ObjType) => obj.v);
            lazyPropertyImpl(obj, 'k', {
                evaluate: fn,
                resetBy: [tester]
            });
            expect(obj.k).toBe(obj.v);
            expect(fn).toBeCalledTimes(1);
            obj.v = 2;
            expect(obj.k).toBe(obj.v);
            expect(fn).toBeCalledTimes(2);
        });
        it('should un-enumerable property cannot be obtained by Objecy.keys', () => {
            const obj = {
                k: 0
            };

            expect(Object.keys(obj)).toContain('k');

            lazyPropertyImpl(obj, 'k', {
                evaluate: () => Math.random(),
                enumerable: false
            });
            expect(Object.keys(obj)).not.toContain('k');
        });
    });
});
