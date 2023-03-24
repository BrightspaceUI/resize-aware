import './test-lit-component-simple.js';
import { html, LitElement, nothing } from 'lit';

const _testComponents = [];

class NestedTestComponent extends LitElement {

	static get properties() {
		return {
			_hasChild1: { state: true },
			_hasChild2: { state: true }
		};
	}

	constructor() {
		super();
		this._hasChild1 = true;
		this._hasChild2 = false;
	}

	connectedCallback() {
		super.connectedCallback();
		_testComponents.push(this);
	}

	disconnectedCallback() {
		const i = _testComponents.indexOf(this);
		if (i >= 0) {
			_testComponents.splice(i, 1);
		}
		super.disconnectedCallback();
	}

	render() {
		return html`
			${this._hasChild1 ? html`<test-lit-component-simple></test-lit-component-simple>` : nothing}
			${this._hasChild2 ? html`<test-lit-component-simple></test-lit-component-simple>` : nothing}
		`;
	}

	addChildComponent() {
		this._hasChild2 = true;
	}

	removeChildComponent() {
		this._hasChild1 = false;
	}

}

customElements.define('test-lit-component-nested', NestedTestComponent);

export default _testComponents;
