import { PolymerElement, html } from '@polymer/polymer';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import D2LResizeObserver from './d2l-resize-observer.js';

class D2LResizeAware extends PolymerElement {
	
	static get is() {
		return 'd2l-resize-aware';
	}
	
	static get template() {
		const template = html`
			<style>
				:host {
					display: inline-block;
				}
			</style>
			<slot id="slot"></slot>
		`;
		template.setAttribute('strip-whitespace', true);
		return template;
	}
	
	static get properties() {
		return {
			positionAware: {
				type: Boolean,
				value: false
			},
			
			_hasNativeResizeObserver: Boolean,
			_isSafari: Boolean,
			_usingSafariWorkaround: Boolean,
			_lastSize: Object,
			_observer: Object
		};
	}
	
	constructor() {
		super();
		
		this._hasNativeResizeObserver =
			window.ResizeObserver &&
			window.ResizeObserver.toString().indexOf( '[native code]' ) >= 0;
		
		this._isSafari =
			window.navigator.userAgent.indexOf( 'Safari/' ) >= 0 &&
			window.navigator.userAgent.indexOf( 'Chrome/' ) === -1;
			
		this._onPossibleResize = this._onPossibleResize.bind( this );
	}
	
	connectedCallback() {
		super.connectedCallback();
		this._lastSize = this.getBoundingClientRect();
		afterNextRender( this, this._initialize.bind( this ) );
		this._onResize();
	}
	
	disconnectedCallback() {
		if( this._observer ) {
			this._observer.unobserve( this );
			this._observer = null;
		}
		super.disconnectedCallback();
	}
	
	_initialize() {
		if( this._observer ) {
			return;
		}
		
		this._usingSafariWorkaround = false;
		if( this._hasNativeResizeObserver && !this.positionAware ) {
			/* Use native ResizeObserver */
			this._observer = new window.ResizeObserver( this._onPossibleResize );
		} else {
			/* Use polyfill */
			const checkIfSafariWorkaroundIsRequired = function( hasTextArea ) {
				if( !this._isSafari ) return;
				this._changeSafariWorkaroundStatus( hasTextArea );
			}.bind( this );
			
			this._observer = new D2LResizeObserver( this._onPossibleResize, this.positionAware, checkIfSafariWorkaroundIsRequired );
		}
		this._observer.observe( this );
	}
	
	_onPossibleResize() {
		const newSize = this.getBoundingClientRect();
		if(
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
	
	_changeSafariWorkaroundStatus( useWorkaround ) {
		if( this._usingSafariWorkaround === !!useWorkaround ) {
			return;
		}
		
		/* Safari's MutationObserver does not detect resizes on native textareas
		 * that occur as a result of the user dragging the resizer, so we just
		 * have to poll for changes in this case, but only on frames where the
		 * user could be resizing the textbox. Putting a mousemove event
		 * listener on this element won't work because the textbox lags behind
		 * the cursor, but we can at least only do a resize check when the mouse
		 * is moving instead of on every frame.
		 *
		 * This workaround is only used if there is a textarea element somewhere
		 * inside this element that does not have 'resize: none' in its styling,
		 * and only if the browser is Safari.
		 */
		if( useWorkaround ) {
			window.addEventListener( 'mousemove', this._onPossibleResize );
			window.addEventListener( 'touchmove', this._onPossibleResize );
		} else {
			window.removeEventListener( 'mousemove', this._onPossibleResize );
			window.removeEventListener( 'touchmove', this._onPossibleResize );
		}
		this._usingSafariWorkaround = !!useWorkaround;
	}
	
}

customElements.define( D2LResizeAware.is, D2LResizeAware );
