type Timer = ReturnType<typeof setTimeout>;

/**
 * 通用节流函数（立即执行版）- 之前写的，保留
 * @param fn - 要节流的函数
 * @param delay - 节流延迟时间，默认300ms
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: Timer | null = null;
  return (...args: Parameters<T>) => {
    if (timer) return;
    fn(...args);
    timer = setTimeout(() => {
      timer = null;
    }, delay);
  };
}

/**
 * 通用防抖函数（支持立即执行/手动取消）
 * @param fn - 要防抖的函数
 * @param delay - 防抖延迟时间，默认300ms
 * @param immediate - 是否立即执行，默认false（非立即执行）
 * @returns 防抖后的函数（挂载cancel方法，可手动取消）
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300,
  immediate = false
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timer: Timer | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);

    if (immediate) {
      const callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, delay);
      if (callNow) fn(...args);
    } else {
      timer = setTimeout(() => {
        fn(...args);
        timer = null;
      }, delay);
    }
  }) as ((...args: Parameters<T>) => void) & { cancel: () => void };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  return debounced;
}