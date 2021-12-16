const hasNativeResizeObserver =
	!!window.ResizeObserver &&
	/^\s*function ResizeObserver\(\) \{\s+\[native code\]\s+\}\s*$/.test(window.ResizeObserver.toString());

export default hasNativeResizeObserver;
