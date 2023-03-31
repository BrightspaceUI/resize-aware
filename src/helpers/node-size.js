class DOMRectReadOnlyPolyfill {

	constructor(x, y, width, height) {
		this.__x = x;
		this.__y = y;
		this.__width = width;
		this.__height = height;
	}

	get bottom() { return this.__y + this.__height; }
	get height() { return this.__height; }
	get left() { return this.__x; }
	get right() { return this.__x + this.__width; }
	get top() { return this.__y; }
	get width() { return this.__width; }
	get x() { return this.__x; }
	get y() { return this.__y; }

}

const toReadOnlyDOMRect = function(domRect) {
	if (window.DOMRectReadOnly && domRect instanceof DOMRectReadOnly) {
		return domRect;
	}

	if (
		window.DOMRectReadOnly &&
		DOMRectReadOnly.fromRect &&
		domRect.x !== undefined &&
		domRect.y !== undefined
	) {
		return DOMRectReadOnly.fromRect(domRect);
	}

	return new DOMRectReadOnlyPolyfill(
		domRect.left || domRect.x || 0,
		domRect.top || domRect.y || 0,
		domRect.width,
		domRect.height
	);
};

export const getNodeContentRect = function(node) {
	if (window.SVGGraphicsElement && node instanceof SVGGraphicsElement) {
		return toReadOnlyDOMRect(node.getBBox());
	}

	const resolvedStyle = window.getComputedStyle(node);
	return toReadOnlyDOMRect({
		x: resolvedStyle['padding-left'] || 0,
		y: resolvedStyle['padding-top'] || 0,
		width: resolvedStyle.width,
		height: resolvedStyle.height
	});
};

export const getNodeClientBoundingBox = function(node) {
	return toReadOnlyDOMRect(node.getBoundingClientRect());
};
