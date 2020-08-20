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
    let actualdir = actualdirfull.split('/')[actualdirfull.split('/').length-1];

    let botName = dir.replace(/\s/g, '-').replace(/\$/g, '')
                    .replace(/&/g, '').replace(/\+/g, '')
                    .replace(/,/g, '').replace(/\//g, '')
                    .replace(/:/g, '').replace(/;/g, '')
                    .replace(/=/g, '').replace(/\?/g, '')
                    .replace(/@/g, '').replace(/#/g, '');
    
    let prefix = '?';
    let color = '#ffcf5e';
    let token = '';
    let version = '1.0.0';
    let description = '';
    let tags = [];
    let author = '';

    if (fs.readdirSync(fulldir).length == 0) {
        if (!yes) {
            console.log(variables.banner);
            console.log(`${variables.github}\n\n\n`);
            let isBot = false;
            while (!isBot) {
                let response = await prompt(`bot name: (${botName}) `);
                if (response == '') { isBot = true; break; }
                else {
                    if (response.includes(' ') || response.includes('$') ||
                    response.includes('&') || response.includes('+') ||
                    response.includes(',') || response.includes('/') ||
                    response.includes(':') || response.includes(';') ||
                    response.includes('=') || response.includes('?') ||
                    response.includes('@') || response.includes('#')) {
                        console.log('the bot name can only contain url friendly characters!');
                    }
        
                    else { botName = response; isBot = true; break; }
                }
            }
            
            let isPrefix = false;
            while (!isPrefix) {
                let response = await prompt(`command prefix: (${prefix}) `);
                response = response.split(' ').join('');
                if (response.length > 3) { console.log('the command prefix cannot exceed 3 characters in length!') }
                else if (response.length != 0) { prefix = response; isPrefix = true; }
                else { isPrefix = true; }
            }
        
            let isColor = false;
            while (!isColor) {
                let response = await prompt(`color: (${color}) `);
                response = response.split('#').join('');
                if (response.length != 0) {
                    if (/[0-9A-Fa-f]{6}/g.test(response)) { color = `#${response}`; isColor = true; }
                    else { console.log('color needs to be a valid hexadecimal color!') }
                }
            
                else { isColor = true }
            }
            
            token = await prompt(`discord bot token: `);
            
            let isVersion = false;
            while (!isVersion) {
                let response = await prompt(`version: (${version}) `);
                if (response.length != 0) { version = response }
                isVersion = true;
            }
            
            description = await prompt(`description: `);
            let tagsResponse = await prompt(`tags: (seperated by comma) `);
            let tagsDirty = tagsResponse.split(',');
            for (let i = 0; i < tagsDirty.length; i++) { tags.push(tagsDirty[i].trim().split(' ').join('-')) }    
            author = await prompt(`author: `);
        }
        
        let excluded = [
            'node_modules',
            'docs',
            'cli',
            '.git',
            '.gitignore',
            'src\\modules\\base\\node_modules',
            'src\\modules\\jewel-data',
            'src\\modules\\tenor',
            'src\\modules\\tenor-reactions',
            'src\\modules\\template',
            'rethink\\data',
            'LICENSE',
            'README.md',
            'index.js'
        ]
    
        function filter(source, destination) {
            let toReturn = true;
            for (let e = 0; e < excluded.length; e++) { if (source.endsWith(`${actualdir}\\${excluded[e]}`)) { toReturn = false } }

            if (toReturn) {
                term.left(10000);
                term.eraseLine();
                process.stdout.write(`copying ${source.slice(source.indexOf(actualdir))}`);
            }
    
            return toReturn;
        }

        fs.copySync(actualdirfull, './', filter);
        term.eraseLine();
        term.left(10000);
        console.log('copied all files');
        fs.renameSync(`${fulldir}/start.js`, `${fulldir}/index.js`);
        
        let configFiles = fs.readdirSync(`${fulldir}/src/config/`);
        for (let c = 0; c < configFiles.length; c++) {
            if (configFiles[c].endsWith('.example.json')) {
                if (fs.existsSync(`${fulldir}/src/config/${`${configFiles[c].split('.example.json')[0]}.json`}`)) { fs.unlinkSync(`${fulldir}/src/config/${`${configFiles[c].split('.example.json')[0]}.json`}`) }
                fs.renameSync(`${fulldir}/src/config/${configFiles[c]}`, `${fulldir}/src/config/${`${configFiles[c].split('.example.json')[0]}.json`}`);
            }
        }

        let config = JSON.parse(fs.readFileSync(`${fulldir}/bot.example.json`));
        config.name = botName;
        config.token = token;
        config.version = version;
        config.description = description;
        config.tags = tags;
        config.author = author;
        fs.writeFileSync(`${fulldir}/bot.json`, JSON.stringify(config, null, 4));
        
        let defaults = JSON.parse(fs.readFileSync(`${fulldir}/src/config/defaults.json`));
        defaults.guild.prefix = prefix;
        defaults.guild.colors.accent = color;
        fs.writeFileSync(`${fulldir}/src/config/defaults.json`, JSON.stringify(defaults, null, 4));

        await exec('npm install');
        console.log(`installed master npm dependencies`);
        let modules = fs.readdirSync(`${fulldir}/src/modules`);
        let toInstall = ['base'];
        await exec(`git clone https://github.com/shadeRed/auric-base-module.git src/modules/base`);
        for (let m = 0; m < modules.length; m++) { if (fs.existsSync(`${fulldir}/src/modules/${modules[m]}/package.json`)) { toInstall.push(modules[m]) } }
        for (let t = 0; t < toInstall.length; t++) {
            await exec(`cd src/modules/${toInstall[t]} && npm install && cd ../../../`);
            console.log(`installed npm dependencies for "${toInstall[t]}" module`);
        }
    }
    
    else { console.log(`you need to be in an empty directory to initialze a bot!`) }
}