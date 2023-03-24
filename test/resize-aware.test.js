import '../d2l-resize-aware.js';
import './test-component-slotted.js';
import { fixture, html, oneEvent } from '@open-wc/testing';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import NestedTestComponents from './test-component-nested.js';
import SimpleTestComponents from './test-component-simple.js';

function afterNextRenderAsPromise(elem) {
	return new Promise(resolve => {
		afterNextRender(elem, () => resolve());
	});
}

describe('d2l-resize-aware', () => {

	let component;
	let root;

	const setup = async function(testFixture) {
		root = await fixture(testFixture);
		if (root.tagName === 'D2L-RESIZE-AWARE') {
			component = root;
		} else {
			component = root.querySelector('d2l-resize-aware');
		}
		await afterNextRenderAsPromise(component);
		await afterNextRenderAsPromise(component);
	};

	describe('contains native HTML elements', () => {

		beforeEach(async() => {
			await setup(html`<d2l-resize-aware><div class="box">stuff</div></d2l-resize-aware>`);
		});

		it('element resized', async() => {
			setTimeout(() => component.querySelector('.box').style.width = '600px');
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

		it('element added', async() => {
			setTimeout(() => {
				const textDiv = document.createElement('div');
				textDiv.textContent = 'Text.';
				component.appendChild(textDiv);
			});
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

		it('element removed', async() => {
			setTimeout(() => component.removeChild(component.querySelector('.box')));
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

		it('resizer itself changed', async() => {
			setTimeout(() => {
				component.style.display = 'block';
				component.style.width = '600px';
			});
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

	});

	describe('contains simple webcomponent', () => {

		beforeEach(async() => {
			await setup(html`<d2l-resize-aware><test-component-simple></test-component-simple></d2l-resize-aware>`);
		});

		it('webcomponent resized', async() => {
			setTimeout(() => SimpleTestComponents[0].resizeDiv('200px', '600px'));
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

	});

	describe('contains slotted webcomponent', () => {

		beforeEach(async() => {
			await setup(html`
				<d2l-resize-aware>
					<test-component-slotted>
						<test-component-simple></test-component-simple>
					</test-component-slotted>
				</d2l-resize-aware>
			`);
		});

		it('webcomponent resized', async() => {
			setTimeout(() => SimpleTestComponents[0].resizeDiv('200px', '600px'));
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

		it('element added to slot', async() => {
			setTimeout(() => {
				const textDiv = document.createElement('div');
				textDiv.textContent = 'Text.';
				component.querySelector('test-component-slotted').appendChild(textDiv);
			});
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

		it('element removed from slot', async() => {
			setTimeout(() => {
				const slottedComponent = component.querySelector('test-component-slotted');
				slottedComponent.removeChild(slottedComponent.querySelector('test-component-simple'));
			});
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

	});

	describe('contains nested webcomponent', () => {

		beforeEach(async() => {
			await setup(html`<d2l-resize-aware><test-component-nested></test-component-nested></d2l-resize-aware>`);
		});

		it('nested webcomponent resized', async() => {
			setTimeout(() => SimpleTestComponents[0].resizeDiv('200px', '600px'));
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

		it('nested webcomponent removed', async() => {
			setTimeout(() => NestedTestComponents[0].removeChildComponent());
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

		it('nested webcomponent added', async() => {
			setTimeout(() => NestedTestComponents[0].addChildComponent());
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

		it('element resized after being added to component', async() => {
			setTimeout(() => NestedTestComponents[0].addChildComponent());
			await oneEvent(component, 'd2l-resize-aware-resized');
			setTimeout(() => SimpleTestComponents[1].resizeDiv('200px', '600px'));
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

	});

	describe('position aware', () => {

		beforeEach(async() => {
			await setup(html`
				<div>
					<div class="spacer" style="display: inline-block"></div>
					<d2l-resize-aware position-aware></d2l-resize-aware>
				</div>
			`);
		});

		it('component moved', async() => {
			setTimeout(() => root.querySelector('.spacer').style.width = '100px');
			await oneEvent(component, 'd2l-resize-aware-resized');
		});

	});

});
