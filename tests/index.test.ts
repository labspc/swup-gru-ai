import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	query,
	queryAll,
	nextTick,
	isPromise,
	runAsPromise,
	forceReflow,
	getContextualAttr
} from '../src/utils/index';

// Setting up jsdom to simulate a DOM environment
import { JSDOM } from 'jsdom';

beforeEach(() => {
	const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
	global.document = dom.window.document;
	global.window = dom.window;
	global.HTMLElement = dom.window.HTMLElement;
	global.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 0);
});

describe('query', () => {
	it('should return an element matching the selector', () => {
		document.body.innerHTML = '<div class="test"></div>';
		const element = query('.test');
		expect(element).toBeInstanceOf(HTMLElement);
		expect(element?.classList.contains('test')).toBe(true);
	});

	it('should return null if no element matches the selector', () => {
		document.body.innerHTML = '';
		const element = query('.non-existent');
		expect(element).toBeNull();
	});
});

describe('queryAll', () => {
	it('should return an array of elements matching the selector', () => {
		document.body.innerHTML = '<div class="test"></div><div class="test"></div>';
		const elements = queryAll('.test');
		expect(elements).toHaveLength(2);
		elements.forEach((element) => {
			expect(element).toBeInstanceOf(HTMLElement);
			expect(element.classList.contains('test')).toBe(true);
		});
	});

	it('should return an empty array if no elements match the selector', () => {
		document.body.innerHTML = '';
		const elements = queryAll('.non-existent');
		expect(elements).toEqual([]);
	});
});

describe('nextTick', () => {
	it('should resolve after the next event loop', async () => {
		const mockFn = vi.fn();
		await nextTick().then(mockFn);
		expect(mockFn).toHaveBeenCalled();
	});
});

describe('isPromise', () => {
	it('should return true for a Promise object', () => {
		expect(isPromise(Promise.resolve())).toBe(true);
	});

	it('should return false for non-Promise objects', () => {
		expect(isPromise({})).toBe(false);
		expect(isPromise(null)).toBe(false);
		expect(isPromise(undefined)).toBe(false);
		expect(isPromise(() => {})).toBe(false);
	});
});

describe('runAsPromise', () => {
	it('should resolve with the value of a synchronous function', async () => {
		const result = await runAsPromise(() => 42);
		expect(result).toBe(42);
	});

	it('should resolve with the resolved value of a Promise-returning function', async () => {
		const result = await runAsPromise(() => Promise.resolve(42));
		expect(result).toBe(42);
	});

	it('should reject with the error of a Promise-returning function', async () => {
		await expect(runAsPromise(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
	});

	it('should reject if a synchronous function throws an error', async () => {
		await expect(
			runAsPromise(() => {
				throw new Error('fail');
			})
		).rejects.toThrow('fail');
	});
});

describe('forceReflow', () => {
	it('should force a reflow on the given element', () => {
		const element = document.createElement('div');
		document.body.appendChild(element);
		const spy = vi.spyOn(element, 'getBoundingClientRect');
		forceReflow(element);
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});

	it('should force a reflow on the body if no element is provided', () => {
		const spy = vi.spyOn(document.body, 'getBoundingClientRect');
		forceReflow();
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});
});

describe('getContextualAttr', () => {
	it('should return the attribute value from the closest element', () => {
		document.body.innerHTML = '<div data-test="value"><span id="child"></span></div>';
		const child = document.getElementById('child');
		const attrValue = getContextualAttr(child, 'data-test');
		expect(attrValue).toBe('value');
	});

	it('should return true if the attribute is present without a value', () => {
		document.body.innerHTML = '<div data-test><span id="child"></span></div>';
		const child = document.getElementById('child');
		const attrValue = getContextualAttr(child, 'data-test');
		expect(attrValue).toBe(true);
	});

	it('should return undefined if no element with the attribute is found', () => {
		document.body.innerHTML = '<div><span id="child"></span></div>';
		const child = document.getElementById('child');
		const attrValue = getContextualAttr(child, 'data-test');
		expect(attrValue).toBeUndefined();
	});
});
