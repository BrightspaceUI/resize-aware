const resizeObserverRegex = /^\s*function ResizeObserver\(\) \{\s+\[native code\]\s+\}\s*$/;

export const hasNativeResizeObserver = !!window.ResizeObserver &&
	resizeObserverRegex.test(window.ResizeObserver.toString());
