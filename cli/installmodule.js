let modules = require('./../modules.json');
const exec = require('./functions.js').exec;
let fs = require('fs-extra');

module.exports = async function(name) {
    name = name.toLowerCase();
    let destdir = process.cwd().split('\\').join('/');
    if (!(fs.existsSync(`${destdir}/src`) && fs.existsSync(`${destdir}/src/modules`))) { return console.log(`you must be in the root directory of an auric bot to install a module`) }
    if (modules[name]) {
        //console.log(`${destdir}/modules/`);
        await exec(`git clone ${modules[name]} ${destdir}/src/modules/${name}`);
        fs.removeSync(`${destdir}/src/modules/${name}/.git`)
        console.log(`successfully downloaded the "${name}" module`);
        await exec(`cd ${destdir}/src/modules/${name} && npm install`);
        console.log(`installed npm dependencies`);
    }

    else { console.log(`that module doesn't exist!`) }
}