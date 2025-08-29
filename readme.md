npm i

В разных терминалах:
node server.js
ngrok http 3000
npm run storybook

Нужно:
создать команду в пенпоте
скопировать полученный URL (ngrok http 3000) и вставить в вебхуки пенпота
скопировать penpot api и вставить в код
скопировать claude api key и вставить в код

Создать файлы:
File: .storybook/main.js
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

File: .storybook/preview.js
/** @type { import('@storybook/react').Preview } */
const preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
	},
};

export default preview;
