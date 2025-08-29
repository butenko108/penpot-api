/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
	stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
	addons: ["@storybook/addon-essentials"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
};
export default config;
