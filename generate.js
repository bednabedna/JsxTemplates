const path = require('path')

const htmlTags = new Set(["nav", "fragment", "body", "footer", "input", "hr", "small", "meta", "ul", "li", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "html", "link", "head", "script", "title", "img", "p", "div", "table", "tbody", "tr", "th", "td", "a", "b", "span", "br", "i", "em"]);
const autoClosingTags = new Set(['img', 'br', 'meta', 'input', 'hr'])

if (process.argv.length < 5) {
	console.error("Expected at least 2 line arguments")
	process.exit(-1)
}

let jsxPath = process.argv[2];
let jsPath = process.argv[3];
let mainJsx = process.argv[4];


const jsxFileToJsFile = (filePath) => {
	let tagPathJsx = path.join(filePath)
	let tagRelPathJsx = path.relative(jsxPath, tagPathJsx);
	return path.join(jsPath, tagRelPathJsx)
}

const createElement = (tag, attributes, ...children) => {
	attributes = attributes || {}

	while (children.some(Array.isArray))
		children = children.flat()

	if (tag === "fragment")
		return children.map(c => c.tag ? createElement(c.tag, c.attributes, c.children) : c)

	if (typeof tag === "string") {
		if (!htmlTags.has(tag)) {
			console.error("Unknown html tag '" + tag + "'");
			console.error(`At ${attributes.__source.fileName} line ${attributes.__source.lineNumber}`)
			process.exit(-1)
		}
		return { tag, attributes, children }
	}


	return tag(attributes, ...children)
}

function htmlToString(root) {
	if (typeof root === "string")
		return root

	if (!root)
		return ''

	let attr = "";

	for (let key in root.attributes) {
		if (key !== '__source') {
			let value = root.attributes[key]
			if (value)
				attr += " " + key + "=" + JSON.stringify(value)
		}
	}
	let content = "";

	if (typeof root.children === "string")
		content = root.children
	else if (Array.isArray(root.children))
		content = root.children.map(htmlToString).join('\n')

	if (!htmlTags.has(root.tag))
		throw `tag ${root.tag} non è un tag HTML\nIn file ${attributes.__source.fileName} line ${attributes.__source.lineNumber}`

	if (autoClosingTags.has(root.tag)) {
		if (content && content.trim())
			throw `il tag ${root.tag} deve essere auto chiudente ma contiene della roba\nIn file ${attributes.__source.fileName} line ${attributes.__source.lineNumber}`;
		return `<${root.tag + attr}/>`
	}

	return `<${root.tag + attr}>${content}</${root.tag}>`
}

const minify = require('html-minifier').minify;


global.createElement = createElement;
global.elementToHtml = htmlToString;
global.minifyHtml = html => minify(html, { removeEmptyAttributes: true, minifyURLs: true, minifyJS: true, minifyCSS: true, collapseWhitespace: true, });
global.$ = {};


require(jsxFileToJsFile(mainJsx))



