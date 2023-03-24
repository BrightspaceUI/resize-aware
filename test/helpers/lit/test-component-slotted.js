import { html, LitElement } from 'lit';

class SlottedTestComponent extends LitElement {

	render() {
		return html`<slot></slot>`;
	}

}

customElements.define('test-lit-component-slotted', SlottedTestComponent);
