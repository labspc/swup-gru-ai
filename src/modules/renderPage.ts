import { updateHistoryRecord, getCurrentUrl } from '../helpers.js';
import Swup from '../Swup.js';
import { PageData } from './fetchPage.js';

export const renderPage = async function (this: Swup, requestedUrl: string, page: PageData) {
	const { url } = page;

	document.documentElement.classList.remove('is-leaving');

	// do nothing if another page was requested in the meantime
	if (!this.isSameResolvedUrl(getCurrentUrl(), requestedUrl)) {
		return;
	}

	// update state if the url was redirected
	if (!this.isSameResolvedUrl(getCurrentUrl(), url)) {
		updateHistoryRecord(url);
		this.currentPageUrl = getCurrentUrl();
		this.context.to!.url = this.currentPageUrl;
	}

	await this.hooks.trigger('urlUpdated', { url: this.currentPageUrl });

	// only add for page loads with transitions
	if (this.context.transition.animate) {
		document.documentElement.classList.add('is-rendering');
	}

	// replace content: allow handlers and plugins to overwrite paga data and containers
	await this.hooks.trigger('replaceContent', { page }, ({ containers }, { page }) => {
		this.replaceContent(page, { containers });
	});

	await this.hooks.trigger('pageView', { url: this.currentPageUrl, title: document.title });

	// empty cache if it's disabled (in case preload plugin filled it)
	if (!this.options.cache) {
		this.cache.empty();
	}

	// Perform in transition
	this.enterPage();
};
