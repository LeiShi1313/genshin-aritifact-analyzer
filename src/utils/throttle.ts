type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
}

function throttle(func: Function, wait: number, options: ThrottleOptions = {}): Function {
  let leading = true;
  let trailing = true;

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  if (options.leading !== undefined) {
    leading = options.leading;
  }

  if (options.trailing !== undefined) {
    trailing = options.trailing;
  }

  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: any[] | null = null;
  let lastThis: any;

  const invokeFunc = () => {
    if (lastArgs) {
      func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  };

  const throttled = (...args: any[]) => {
    if (timeout !== null) {
      lastArgs = args;
      lastThis = this;
      return;
    }

    if (leading) {
      func.apply(this, args);
    }

    timeout = setTimeout(() => {
      timeout = null;

      if (trailing && lastArgs) {
        invokeFunc();
      }
    }, wait);
  };

  throttled.cancel = () => {
    clearTimeout(timeout!);
    timeout = null;
    lastArgs = null;
    lastThis = null;
  };

  return throttled;
}

export default throttle;