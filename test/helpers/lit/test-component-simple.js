import { css, html, LitElement } from 'lit';

const _testComponents = [];

class SimpleTestComponent extends LitElement {

	static get styles() {
		return css`
			#div {
				background-color: grey;
				width: 400px;
				height: 200px;
			}
		`;
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
		return html`<div id="div"></div>`;
	}

	resizeDiv(width, height) {
		const div = this.shadowRoot.querySelector('#div');

		div.style.width = width;
		div.style.height = height;
	}

}

customElements.define('test-lit-component-simple', SimpleTestComponent);

export default _testComponents;
