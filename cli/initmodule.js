const fs = require('fs-extra');
const term = require('terminal-kit').terminal;
const prompt = require('./functions.js').prompt;
const exec = require('./functions.js').exec;
let variables = require('./variables');

module.exports = async function(yes) {
    let fulldir = process.cwd().split('\\').join('/');
    let dir = fulldir.split('/')[fulldir.split('/').length-1];

    let splitDir = __dirname.split('\\');
    splitDir.pop();
    let actualdirfull = splitDir.join('/');

    if (!(fs.existsSync(`${fulldir}/src`) && fs.existsSync(`${fulldir}/src/modules`))) { console.log(`you can only initialize a module when you're in the root directory of an auric bot`) }
    else {
        let moduleName = 'auric-module';
        let version = '1.0.0';
        let description = '';
        let author = '';

        if (!yes) {
            console.log(variables.banner);
            console.log(`${variables.github}\n\n\n`);
            let isModule = false;
            while (!isModule) {
                let response = await prompt(`module name: (${moduleName}) `);
                if (response == '') { response = moduleName }
                if (response.includes(' ') || response.includes('$') ||
                response.includes('&') || response.includes('+') ||
                response.includes(',') || response.includes('/') ||
                response.includes(':') || response.includes(';') ||
                response.includes('=') || response.includes('?') ||
                response.includes('@') || response.includes('#')) {
                    console.log('the module name can only contain url friendly characters!');
                }

                else if (fs.existsSync(`${fulldir}/src/modules/${response}`)) { console.log('a module with that name already exists in this bot') }
                else { moduleName = response; isModule = true; break; }
            }
            
            let isVersion = false;
            while (!isVersion) {
                let response = await prompt(`version: (${version}) `);
                if (response.length != 0) { version = response }
                isVersion = true;
            }
            
            description = await prompt(`description: `);
            author = await prompt(`author: `);
        }

        fs.copySync(`${actualdirfull}/src/modules/template`, `${fulldir}/src/modules/${moduleName}`);
        term.eraseLine();
        term.left(10000);
        console.log('copied all files');

        await exec(`cd ${fulldir}/src/modules/${moduleName} && npm init -y`);

        let config = JSON.parse(fs.readFileSync(`${fulldir}/src/modules/${moduleName}/package.json`));
        config.name = moduleName;
        config.version = version;
        config.description = description;
        config.author = author;
        fs.writeFileSync(`${fulldir}/src/modules/${moduleName}/package.json`, JSON.stringify(config, null, 4));
        console.log('initialized npm project');
        console.log(`the module was successfully initialized and it's now in /src/modules/${moduleName}`);
    }
}