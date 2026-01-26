/**
 * 通用节流函数（立即执行版）- 之前写的，保留
 * @param fn - 要节流的函数
 * @param delay - 节流延迟时间，默认300ms
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  return (...args) => {
    if (timer) return;
    fn.apply(this, args);
    timer = setTimeout(() => { timer = null; }, delay);
  };
}

/**
 * 通用防抖函数（支持立即执行/手动取消）
 * @param fn - 要防抖的函数
 * @param delay - 防抖延迟时间，默认300ms
 * @param immediate - 是否立即执行，默认false（非立即执行）
 * @returns 防抖后的函数（挂载cancel方法，可手动取消）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timer: NodeJS.Timeout | null = null; // 定时器标识

  // 防抖核心函数
  const debounced = (...args: Parameters<T>) => {
    // 每次触发，先清除之前的定时器，重置延迟
    if (timer) clearTimeout(timer);

    // 立即执行模式：无定时器时，马上执行原函数
    if (immediate) {
      const callNow = !timer;
      // 设置新定时器，延迟后清空标识，允许下次执行
      timer = setTimeout(() => { timer = null; }, delay);
      // 无定时器时立即执行
      if (callNow) fn.apply(this, args);
    } else {
      // 非立即执行模式：每次触发都重新设置定时器，只执行最后一次
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };

  // 手动取消防抖：清除定时器，重置标识（组件卸载/场景切换时用）
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  return debounced;
}
