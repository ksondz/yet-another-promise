
const Yap = require('./index');


describe('Constructor method tests', () => {

  test('Test constructor returned object', () => {
    const value = 'test';
    const promise = new Yap(resolve => {
      setTimeout(() => {
        resolve(value);
      },
      100,
      );
    });

    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [] });

    return promise.then(result => {
      expect(result).toEqual(value);
    });

  });

  test('Test constructor resolve', () => {
    const result = 'test value';
    return new Yap(resolve => {
      setTimeout(() => { resolve(result); }, 30);
    })
      .then(val => {
        expect(val).toBe(result);
      });
  });

  test('Test constructor reject', () => {
    const result = 'test value';
    return new Yap((resolve, reject) => {
      setTimeout(() => { reject(result); }, 30);
    })
      .catch(val => {
        expect(val).toBe(result);
      });
  });
});


describe('Static state methods tests', () => {

  test('Test get pending state', () => {
    expect(Yap.PENDING_STATE).toEqual('pending');
  });

  test('Test get resolved state', () => {
    expect(Yap.RESOLVED_STATE).toEqual('resolved');
  });

  test('Test get rejected state', () => {
    expect(Yap.REJECTED_STATE).toEqual('rejected');
  });
});


describe('Static methods check argument type tests', () => {

  test('Test argument is object. Positive case.', () => {
    expect(Yap.isObject({})).toBe(true);
  });

  test('Test argument is object. Negative case.', () => {
    expect(Yap.isObject('string')).toBe(false);
  });

  test('Test argument is function. Positive case.', () => {
    expect(Yap.isFunction(() => {})).toBe(true);
  });

  test('Test argument is function. Negative case.', () => {
    expect(Yap.isFunction('string')).toBe(false);
  });

  test('Test argument is string. Positive case.', () => {
    expect(Yap.isString('string')).toBe(true);
  });

  test('Test argument is string. Negative case.', () => {
    expect(Yap.isString([])).toBe(false);
  });
});


describe('Static Thenable method tests', () => {

  test('Test get thenable. Positive case', () => {
    const then = () => {};
    const test = { then };
    expect(Yap.getThenable(test)).toEqual(then);
  });

  test('Test get thenable. Negative case', () => {
    expect(Yap.getThenable({})).toEqual(null);
    expect(Yap.getThenable({ then: 'test' })).toEqual(null);
  });
});


describe('Static Race promise methods tests', () => {

  test('Test all promises with array', () => {
    const values = ['test1', 'test2'];

    const promise = Yap.all([Yap.resolve(values[0]), Yap.resolve(values[1])]);
    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [] });

    return promise.then(results => {
      expect(results).toEqual(values);
      expect(promise).toEqual({ value: values, state: Yap.RESOLVED_STATE, __handlers: null });
    });
  });

  test('Test all promises with string', () => {
    const value = 'test';
    const resultValue = ['t', 'e', 's', 't'];

    const promise = Yap.all(value);
    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [] });

    return promise.then(results => {
      expect(results).toEqual(resultValue);
      expect(promise).toEqual({ value: resultValue, state: Yap.RESOLVED_STATE, __handlers: null });
    });
  });

  test('Test reject all promises', () => {
    const values = ['test1', 'test2'];
    const rejectValue = 'fail';

    return Yap.all([
      new Yap(resolve => { setTimeout(() => { resolve(values[0]); }, 30); }),
      new Yap((resolve, reject) => { setTimeout(() => { reject(rejectValue); }, 20); }),
    ]).catch(error => {
      expect(error).toEqual(rejectValue);
    });
  });
});


describe('Static Race promise methods tests', () => {

  test('Test race promises', () => {
    const values = ['test1', 'test2'];

    const promise = Yap.race([Yap.resolve(values[0]), Yap.resolve(values[1])]);
    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [] });

    return promise.then(result => {
      expect(result).toEqual(values[0]);
    });
  });

  test('Test race promises with timeouts', () => {
    const values = ['test1', 'test2'];

    return Yap.race([
      new Yap(resolve => { setTimeout(() => { resolve(values[0]); }, 30); }),
      new Yap(resolve => { setTimeout(() => { resolve(values[1]); }, 20); }),
    ]).then(result => {
      expect(result).toEqual(values[1]);
    });
  });

  test('Test reject race promises', () => {
    const values = ['test1', 'test2'];
    const rejectValue = 'fail';

    return Yap.race([
      new Yap(resolve => { setTimeout(() => { resolve(values[0]); }, 30); }),
      new Yap((resolve, reject) => { setTimeout(() => { reject(rejectValue); }, 20); }),
    ]).catch(error => {
      expect(error).toEqual(rejectValue);
    });
  });
});


describe('Static Resolve and Reject promise methods tests', () => {

  test('Test promise reject', () => {
    const value = 'test reject';

    const promise = Yap.reject(value);

    expect(promise).toEqual({ value, state: Yap.REJECTED_STATE, __handlers: null });

    return promise.catch(error => {
      expect(error).toEqual(value);
    });
  });

  test('Test promise resolve', () => {
    const value = 'test resolve';

    const promise = Yap.resolve(value);
    expect(promise).toEqual({ value, state: Yap.RESOLVED_STATE, __handlers: null });

    return promise.then(result => {
      expect(result).toEqual(value);
    });

  });
});


describe('Then method tests', () => {

  test('Test then method', () => {
    const value = 'test value';

    const promise = Yap.resolve(value);
    expect(promise).toEqual({ value, state: Yap.RESOLVED_STATE, __handlers: null });

    return promise.then(result => {
      expect(result).toEqual(value);
    });
  });

  test('Test several then methods', () => {
    const value = 'test value';
    const secondValue = 'test second value';

    const promise = Yap.resolve(value);
    return promise.then(result => {
      expect(result).toEqual(value);
      return secondValue;
    }).then(secondResult => {
      expect(secondResult).toEqual(secondValue);
    });
  });

  test('Test several then methods with empty result', () => {
    const value = 'test value';

    const promise = Yap.resolve(value);
    return promise.then(result => {
      expect(result).toEqual(value);
    }).then(secondResult => {
      expect(secondResult).toBeUndefined();
    });
  });
});


describe('Catch method tests', () => {

  test('Test catch method', () => {
    const value = 'test value';

    const promise = Yap.reject(value);
    expect(promise).toEqual({ value, state: Yap.REJECTED_STATE, __handlers: null });

    return promise.catch(error => {
      expect(error).toEqual(value);
    });
  });
});


describe('Finally method tests', () => {

  test('Test finally method', () => {
    const value = 'test value';

    const promise = Yap.resolve(value);
    expect(promise).toEqual({ value, state: Yap.RESOLVED_STATE, __handlers: null });

    return promise.finally(result => {
      expect(result).toBeUndefined();
    }).then(resolveResult => {
      expect(resolveResult).toEqual(value);
    });
  });
});


describe('Do Resolve method tests', () => {

  test('Test doResolve onResolve method', () => {
    const value = 'test value';

    const promise = Yap.resolve(value);

    const resolveValue = 'resolve value';
    const rejectValue = 'reject value';

    promise.__doResolve(
      (onResolve, onReject) => {
        expect(onResolve(resolveValue)).toEqual(resolveValue);
        expect(onReject(rejectValue)).toBeUndefined();
      },
      result => { return result; },
      error => { return error; },
    );
  });

  test('Test doResolve onReject method', () => {
    const value = 'test value';

    const promise = Yap.resolve(value);

    const resolveValue = 'resolve value';
    const rejectValue = 'reject value';

    promise.__doResolve(
      (onResolve, onReject) => {
        expect(onReject(rejectValue)).toEqual(rejectValue);
        expect(onResolve(resolveValue)).toBeUndefined();
      },
      result => { return result; },
      error => { return error; },
    );
  });

  test('Test doResolve catch method', () => {
    const value = 'test value';

    const promise = Yap.resolve(value);
    const errorValue = new Error('test error');

    promise.__doResolve(
      () => {
        throw errorValue;
      },
      result => { return result; },
      error => {
        expect(error).toEqual(errorValue);
      },
    );
  });
});


describe('Done method tests', () => {

  test('Test done method', () => {
    return new Yap((resolve) => {

      const handler = {
        onResolve: result => {
          return result;
        },
        onReject: error => {
          return error;
        },
      };

      const value = 'test value';
      const promise = Yap.resolve(value);

      promise.__handle = jest.fn().mockImplementation(handlerResult => {
        expect(handlerResult).toEqual(handler);
        resolve();
      });

      promise.__done(handler.onResolve, handler.onReject);
    });
  });
});


describe('Handle method tests', () => {

  test('Test handle method with pending state', () => {
    const value = 'test value';

    const promise = new Yap(resolve => {
      setTimeout(() => { resolve(value); }, 100);
    });

    const handler = {
      onResolve: () => {},
      onReject: () => {},
    };

    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [] });
    expect(promise.__handlers).not.toEqual(expect.arrayContaining([handler]));

    promise.__handle(handler);

    expect(promise.__handlers).toEqual(expect.arrayContaining([handler]));
    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [handler] });
  });

  test('Test handle method with resolved state', () => {
    const value = 'test value';

    const promise = Yap.resolve(value);

    const handler = {
      onResolve: result => {
        expect(result).toEqual(value);
      },
      onReject: () => {},
    };

    expect(promise).toEqual({ value, state: Yap.RESOLVED_STATE, __handlers: null });

    promise.__handle(handler);

    expect(promise).toEqual({ value, state: Yap.RESOLVED_STATE, __handlers: null });
  });

  test('Test handle method with rejected state', () => {
    const errorResult = new Error('test value');

    const promise = Yap.reject(errorResult);

    const handler = {
      onResolve: () => { },
      onReject: error => {
        expect(error).toEqual(errorResult);
      },
    };

    expect(promise).toEqual({ value: errorResult, state: Yap.REJECTED_STATE, __handlers: null });

    promise.__handle(handler);

    expect(promise).toEqual({ value: errorResult, state: Yap.REJECTED_STATE, __handlers: null });
  });
});


describe('Resolve method tests', () => {

  test('Test resolve method', () => {
    const value = 'test value';

    const promise = new Yap(resolve => {
      setTimeout(() => { resolve(value); }, 100);
    });

    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [] });

    promise.__resolve(value);

    expect(promise).toEqual({ value, state: Yap.RESOLVED_STATE, __handlers: null });
  });

  test('Test resolve method with thenable', () => {
    const value = {
      then: result => { return result; },
    };

    const promise = new Yap(resolve => {
      setTimeout(() => { resolve(value); }, 100);
    });

    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [] });

    promise.__doResolve = jest.fn().mockImplementation(executor => {
      expect(executor).toEqual(value.then);
    });

    promise.__resolve(value);
  });

  test('Test resolve method with catch error', () => {
    const errorResult = new Error('error value');
    const value = {
      then: () => { throw errorResult; },
    };

    const promise = new Yap(resolve => {
      setTimeout(() => { resolve(value); }, 100);
    });

    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [] });

    promise.__resolve(value);

    expect(promise).toEqual({ value: errorResult, state: Yap.REJECTED_STATE, __handlers: null });
  });
});


describe('Reject method tests', () => {

  test('Test reject method', () => {
    const errorResult = new Error('error value');

    const promise = new Yap(resolve => {
      setTimeout(() => { resolve(value); }, 100);
    });

    expect(promise).toEqual({ value: null, state: Yap.PENDING_STATE, __handlers: [] });

    promise.__reject(errorResult);

    expect(promise).toEqual({ value: errorResult, state: Yap.REJECTED_STATE, __handlers: null });
  });
});
