// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/vsLight");
const darkCodeTheme = require("prism-react-renderer/themes/vsDark");

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: "next-safe-action",
	tagline: "Typesafe Server Actions for Next.js 13 using Zod",
	favicon: "img/favicon.ico",

	// Set the production url of your site here
	url: "https://next-safe-action.dev",
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: "/",

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: "TheEdoRan", // Usually your GitHub org/user name.
	projectName: "next-safe-action", // Usually your repo name.

	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",

	// Even if you don't use internalization, you can use this field to set useful
	// metadata like html lang. For example, if your site is Chinese, you may want
	// to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},

	presets: [
		[
			"classic",
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: require.resolve("./sidebars.js"),
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl:
						"https://github.com/TheEdoRan/next-safe-action/tree/main/packages/website/",
					remarkPlugins: [
						[require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
					],
				},
				blog: false,
				theme: {
					customCss: require.resolve("./src/css/custom.css"),
				},
			}),
		],
	],

	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			// Replace with your project's social card
			// image: "img/docusaurus-social-card.jpg",
			navbar: {
				title: "next-safe-action",
				logo: {
					alt: "next-safe-action",
					src: "img/logo.svg",
				},
				items: [
					{
						type: "docSidebar",
						sidebarId: "docsSidebar",
						position: "left",
						label: "Docs",
					},
					{
						href: "https://github.com/TheEdoRan/next-safe-action",
						label: "GitHub",
						position: "right",
					},
				],
			},
			footer: {
				style: "light",
				copyright: `<a href="https://vercel.com" target="_blank"><img src="/img/powered-by-vercel.svg" style="width: 214px; height: 44px" alt="Powered by Vercel" /></a>`,
			},
			prism: {
				theme: lightCodeTheme,
				darkTheme: darkCodeTheme,
			},
		}),
};

module.exports = config;