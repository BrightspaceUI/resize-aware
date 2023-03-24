import { html, PolymerElement } from '@polymer/polymer';

const _testComponents = [];

class SimpleTestComponent extends PolymerElement {

	static get template() {
		const template = html`
			<style>
				#div {
					background-color: grey;
					width: 400px;
					height: 200px;
				}
			</style>
			<div id="div"></div>
		`;
		template.setAttribute('strip-whitespace', true);
		return template;
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

	resizeDiv(width, height) {
		this.$.div.style.width = width;
		this.$.div.style.height = height;
	}

}

customElements.define('test-polymer-component-simple', SimpleTestComponent);

export default _testComponents;
