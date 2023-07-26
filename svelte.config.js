import adapter from '@sveltejs/adapter-static';
import svelte_preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		svelte_preprocess({
			scss: {
				prependData: `
				@import 'src/styles/var.scss';
				`,
			},
		}),
	],
	onwarn: (warning, handler) => {
		if (warning.code.startsWith('a11y-')) return;
		handler(warning);
	},

	kit: {
		adapter: adapter({
			fallback: 'index.html',
		}),
		alias: {
			$routes: './src/routes',
			$fn: './src/lib/functions',
			$comp: './src/lib/components',
			$cfg: './src/lib/configs',
		},
		prerender: { entries: [] },
	},
};

export default config;
