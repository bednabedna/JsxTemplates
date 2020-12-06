
const { argv } = require('yargs')
const path = require("path")

if (!argv.compile) {
    console.error("Flag --compile is required")
    process.exit(-1)
}

if (!argv.execute) {
    console.error("Flag --execute is required")
    process.exit(-1)
}

if (argv.execute.indexOf(".") === -1) {
    console.error("--compile should receive a folder")
    process.exit(-1)
}

let jsxFolder = argv.compile
let jsxMainFile = argv.execute



let originalMainFile = jsxMainFile

let jsFolder = argv.compiled || "compiled"

jsxMainFile = jsxMainFile.substr(0, jsxMainFile.lastIndexOf(".")) + ".js"

if (!path.isAbsolute(jsxFolder))
    jsxFolder = path.join(process.cwd(), jsxFolder)
if (!path.isAbsolute(jsFolder))
    jsFolder = path.join(process.cwd(), jsFolder)

jsxPath = jsxFolder
jsPath = jsFolder

jsxMainFile = path.join(jsFolder, path.basename(jsxMainFile))

componentsPath = path.join(jsFolder, 'components')

let babelCompile = path.join(__dirname, "node_modules/@babel/cli/bin/babel.js")
let babelConfigs = path.join(__dirname, ".babelrc")

const { spawn, exec } = require('child_process');

const args = [babelCompile, jsxFolder, '-D', '-d', jsFolder, '--config-file', babelConfigs, '--watch']

const ls = spawn(
    `node`,
    args
);

ls.stdout.on('data', (data) => {
    console.log("\n" + data.toString());
    exec(`node ${path.join(__dirname, "generate.js")} ${jsxPath} ${jsPath} ${jsxMainFile}`, function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        }
        if (stdout)
            console.log(stdout);
        if (stderr)
            console.error(stderr);
    });
});

ls.stderr.on('data', (data) => {
    console.error(data.toString());
});
