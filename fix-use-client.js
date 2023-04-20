// This is needed because Next.js files with server functions must have
// the "use server" directive at the start of file.

const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const main = () => {
	const fixFile = (path) => {
		let rows = readFileSync(path).toString().split("\n");
		rows.unshift('"use client";');
		writeFileSync(path, rows.join("\n"));

		console.log("Fixed", path);
	};

	fixFile(join(__dirname, "dist", "hook.mjs"));
};

main();