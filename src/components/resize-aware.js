import { css, html, LitElement } from 'lit';
import { ExtendedResizeObserver } from '../helpers/resize-observer.js';
import hasNativeResizeObserver from '../helpers/has-native-resize-observer.js';

class D2LResizeAware extends LitElement {

	static get properties() {
		return {
			positionAware: { type: Boolean, attribute: 'position-aware' }
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
		`;
	}

	constructor() {
		super();
		this.positionAware = false;
	}

	connectedCallback() {
		super.connectedCallback();
		this._lastSize = this.getBoundingClientRect();

		requestAnimationFrame(() => this._initialize());

		this._onResize();
	}

	disconnectedCallback() {
		if (this._observer) {
			this._observer.unobserve(this);
			this._observer = null;
		}
		super.disconnectedCallback();
	}

	render() {
		return html`<slot id="slot"></slot>`;
	}

	_initialize() {
		if (this._observer) {
			return;
		}

		this._usingSafariWorkaround = false;
		if (hasNativeResizeObserver && !this.positionAware) {
			/* Use native ResizeObserver */
			this._observer = new window.ResizeObserver(() => this._onPossibleResize());
		} else {
			/* Use polyfill */
			this._observer = new ExtendedResizeObserver(() => this._onPossibleResize(), this.positionAware, true);
		}
		this._observer.observe(this);
	}

	_onPossibleResize() {
		const newSize = this.getBoundingClientRect();
		if (
			newSize.width !== this._lastSize.width ||
			newSize.height !== this._lastSize.height ||
			this.positionAware && (
				newSize.left !== this._lastSize.left ||
				newSize.top !== this._lastSize.top
			)
		) {
			this._onResize();
		}
	}

	_onResize() {
		const newSize = this.getBoundingClientRect();
		this.dispatchEvent(
			new CustomEvent(
				'd2l-resize-aware-resized',
				{
					target: this,
					detail: {
						previous: this._lastSize,
						current: newSize
					}
				}
			)
		);
		this._lastSize = newSize;
	}

}

customElements.define('d2l-resize-aware', D2LResizeAware);
