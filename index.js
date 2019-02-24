

/**
 * This class mimics native JavaScript standard built-in Promise object
 *
 * @type {module.Yap}
 */
module.exports = class Yap {

  /**
   * @returns {string}
   * @constructor
   */
  static get PENDING_STATE() {
    return 'pending';
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get RESOLVED_STATE() {
    return 'resolved';
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get REJECTED_STATE() {
    return 'rejected';
  }

  /**
   * @param arg
   * @returns {boolean}
   */
  static isObject(arg) {
    return typeof arg === 'object';
  }

  /**
   * @param arg
   * @returns {boolean}
   */
  static isString(arg) {
    return typeof arg === 'string';
  }

  /**
   * @param arg
   * @returns {boolean}
   */
  static isFunction(arg) {
    return typeof arg === 'function';
  }

  /**
   * @param arg
   * @returns {null}
   */
  static getThenable(arg) {
    if (arg && (Yap.isObject(arg) || Yap.isFunction(arg))) {
      const { then } = arg;
      return Yap.isFunction(then) ? then : null;
    }
    return null;
  }

  /**
   * @param iterable
   * @returns {module.Yap}
   */
  static all(iterable) {
    return new Yap((resolve, reject) => {

      if (Yap.isString(iterable)) {
        const promises = [];

        Object.values(iterable).forEach(value => {
          promises.push(Yap.resolve(value));
        });

        Yap.all(promises).then(
          resolveResults => {
            resolve(resolveResults);
          },
          rejectReason => {
            reject(rejectReason);
          },
        );
      } else {
        const results = [];
        Object.values(iterable).forEach(promise => {
          try {
            promise.then(result => {
              results.push(result);
              if (results.length === iterable.length) return resolve(results);
            }).catch(reject);
          } catch (e) {
            throw new Error(`UnhandledPromiseRejectionWarning: ${e}`);
          }
        });
      }
    });
  }

  /**
   * @param iterable
   * @returns {module.Yap}
   */
  static race(iterable) {
    return new Yap((resolve, reject) => {

      if (Yap.isString(iterable)) {
        Yap.resolve(iterable[0]).then(
          resolveResults => { resolve(resolveResults); },
          rejectReason => { reject(rejectReason); },
        );
      } else {
        Object.values(iterable).forEach(promise => {
          try {
            promise.then(result => {
              resolve(result);
            }).catch(reject);
          } catch (e) {
            throw new Error(`UnhandledPromiseRejectionWarning: ${e}`);
          }
        });
      }
    });
  }


  /**
   * @param reason
   * @returns {module.Yap}
   */
  static reject(reason) {
    return new Yap((resolve, reject) => {
      reject(reason);
    });
  }

  /**
   * @param value
   * @returns {module.Yap}
   */
  static resolve(value) {
    return new Yap((resolve, reject) => {
      try {
        if (Yap.getThenable(value)) {
          value.then(result => {
            resolve(result);
          }).catch(reject);
        } else {
          resolve(value);
        }

      } catch (error) {
        reject(error);
      }
    });
  }


  /**
   * @param executor
   */
  constructor(executor) {
    this.value = null;
    this.state = Yap.PENDING_STATE;
    this.handlers = [];

    this.__doResolve(executor, this.__resolve.bind(this), this.__reject.bind(this));
  }

  /**
   * @param executor
   * @param onResolve
   * @param onReject
   * @private
   */
  __doResolve(executor, onResolve, onReject) {
    let done = false;
    try {
      executor(
        value => {
          if (done) return;
          done = true;
          onResolve(value);
        },
        reason => {
          if (done) return;
          done = true;
          onReject(reason);
        },
      );
    } catch (error) {
      if (done) return;
      done = true;
      onReject(error);
    }

    return this;
  }

  /**
   * @param onResolve
   * @param onReject
   * @returns {module.Yap}
   */
  then(onResolve, onReject) {
    return new Yap((resolve, reject) => {
      return this.__done(
        result => {
          if (!Yap.isFunction(onResolve)) {
            return resolve(result);
          }

          try {
            return resolve(onResolve(result));
          } catch (ex) {
            return reject(ex);
          }
        },
        error => {
          if (!Yap.isFunction(onReject)) {
            return reject(error);
          }

          try {
            return resolve(onReject(error));
          } catch (ex) {
            return reject(ex);
          }
        });
    });
  }

  /**
   * @param onFinally
   * @returns {module.Yap}
   */
  finally(onFinally) {
    return new Yap((resolve, reject) => {
      return this.__done(
        result => {
          if (!Yap.isFunction(onFinally)) {
            return resolve(result);
          }

          try {
            onFinally();
            return resolve(result);
          } catch (ex) {
            return reject(ex);
          }
        },
        error => {
          try {
            return reject(error);
          } catch (ex) {
            return reject(ex);
          }
        });
    });
  }

  /**
   * @param onReject
   * @returns {module.Yap}
   */
  catch(onReject) {
    return Yap.isFunction(onReject) ? this.then(undefined, onReject) : this;
  }

  /**
   * @param onResolve
   * @param onReject
   * @private
   */
  __done(onResolve, onReject) {
    setTimeout(() => {
      this.__handle({ onResolve, onReject });
    }, 0);
  }

  /**
   * @param handler
   * @private
   */
  __handle(handler) {
    switch (true) {
      case (this.state === Yap.PENDING_STATE):
        this.handlers.push(handler);
        break;
      case ((this.state === Yap.RESOLVED_STATE) && Yap.isFunction(handler.onResolve)):
        handler.onResolve(this.value);

        break;
      case ((this.state === Yap.REJECTED_STATE) && Yap.isFunction(handler.onReject)):
        handler.onReject(this.value);
        break;
      default:
    }
  }

  /**
   * @param result
   * @private
   */
  __resolve(result) {
    try {
      const then = Yap.getThenable(result);

      if (then) {
        this.__doResolve(then.bind(result), this.__resolve, this.__reject);
        return;
      }

      this.state = Yap.RESOLVED_STATE;
      this.value = result;
      this.handlers.forEach(this.__handle.bind(this));
      this.handlers = null;

    } catch (error) {
      return this.__reject(error);
    }
  }

  /**
   * @param error
   * @private
   */
  __reject(error) {
    this.state = Yap.REJECTED_STATE;
    this.value = error;

    this.handlers.forEach(this.__handle.bind(this));
    this.handlers = null;
  }
};
