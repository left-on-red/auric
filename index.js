#!/usr/bin/env node

process.argv.shift(); // node entry point
process.argv.shift(); // node.exe
let args = process.argv;

let command = null;

let variables = require('./cli/variables');

let commands = {
    init: 'init',
    i: 'install'
}

let flags = {
    y: 'yes',
    b: 'bot',
    m: 'module'
}

let active = {};

let desc = {
    y: 'answer yes to every prompt',
    b: 'specify scope as "bot" for commands',
    m: 'specify scope as "module" for commands'
}

function getFlags() {
    let arr = [];
    let toRemove = [];
    for (let a = 0; a < args.length; a++) {
        if (args[a].startsWith('--')) {
            let name = args[a].slice(2);
            let found = false;
            for (let f in flags) { if (flags[f] == name) { found = true; break; } }
            if (found) { arr.push(name) }
            toRemove.push(args[a]);
        }

        else if (args[a].startsWith('-')) {
            let short = args[a].slice(1);
            if (flags[short]) { arr.push(flags[short]) }
            toRemove.push(args[a]);
        }
    }

    for (let t = 0; t < toRemove.length; t++) { args.splice(arr.indexOf(toRemove[t]), 1) }

    return arr;
}

(async function() {
    if (args.length > 0) {
        let command = null;
        for (let c in commands) {
            if (commands[c] == args[0] || c == args[0]) { command = commands[c] }
        }

        if (!command) { return console.log(`unknown command: "${args[0]}"`) }
        let flags = getFlags();
        args.splice(0, 1);

        if (command == 'init') {
            if (flags.includes('bot') && flags.includes('module')) { return console.log(`you cannot initialize with both the --bot and --module flag active`) }
            if (!flags.includes('bot') && !flags.includes('module')) { return console.log(`you need to specify what you want to initialize using either the --bot flag or the --module flag`) }
            if (flags.includes('bot')) { return require('./cli/initbot.js')(flags.includes('yes')) }
            if (flags.includes('module')) { return require('./cli/initmodule.js')() }
        }

        if (command == 'install') {
            let rest = args.join(' ');
            if (rest == '') { return console.log(`you need to include the name of the module that you wish to install`) }
            return require('./cli/installmodule.js')(rest);
        }
    }

    else {
        let commandsArr = [];
        for (let c in commands) {
            if (commands[c] == c) { commandsArr.push(c) }
            else { commandsArr.push(`${c} (${commands[c]})`) }
        }

        let flagsArr = [];
        for (let f in flags) { flagsArr.push(`-${f} (--${flags[f]})`) }

        // in the future, replace "testModule" in the usage examples to a module that actually exists in the master auric modules list
        let examples = [
            'auric init -b',
            'auric init --bot',
            'auric init -b -y',
            '',
            'auric init -m',
            'auric init --module',
            'auric init -m -y',
            '',
            'auric i testModule',
            'auric install testModule'
        ];

        let help = `${variables.banner}\n${variables.github}` +
        `\n\ncommands:\n    ${commandsArr.join(`\n    `)}` +
        `\n\nflags:\n    ${flagsArr.join(`\n    `)}` +
        `\n\nusage: auric <command> <flags>` + 
        `\n\nexamples:\n    ${examples.join('\n    ')}\n`

        console.log(help);

    }
})();

/*async function start() {
    for (let f in flags) { active[f] = false }
    for (let a = 0; a < args.length; a++) {
        args[a] = args[a].toLowerCase();
        if (args[a].startsWith('--')) {
            let flag = args[a].substring(2);
            let valid = false;
            for (let f in flags) {
                if (flags[f] == flag) {
                    valid = true;
                    active[f] = true;
                }
            }

            if (!valid) { return console.log(`unknown flag "--${flag}"`) }
        }

        else if (args[a].startsWith('-')) {
            let flag = args[a].substring(1);
            let valid = flags[flag] ? true : false;
            if (valid) { active[flag] = true }
            else { return console.log(`unknown flag "-${flag}"`) }
        }

        else {
            if (commands[args[a]]) {
                if (!command) { command = commands[args[a]] }
                else { return console.log(`only one command is permitted: unexpected "${commands[args[a]]}"`) }
            }

            else {
                let valid = false;
                for (let c in commands) {
                    if (args[a] == commands[c]) {
                        valid = true;
                        if (!command) { command = commands[c] }
                        else { return console.log(`only one command is permitted: unexpected "${commands[c]}"`) }
                    }
                }

                if (!valid) { return console.log(`unknown command "${args[a]}"`) }
            }
        }
    }

    if (!command) {
        let commandArr = [];
        for (let c in commands) {
            if (c == commands[c]) { commandArr.push(`${c}`) }
            else { commandArr.push(`${c} (${commands[c]})`) }
        }

        let flagsArr = [];
        for (let f in flags) { flagsArr.push(`${f} (${flags[f]}) - ${desc[f]}`) }
        let toLog = `

            ${variables.banner}
            ${variables.github}


            usage: auric <command> [flags]

            commands: ${commandArr.join(', ')}

            flags:
            \t${flagsArr.join(',\n\t')}
        `;

        return console.log(toLog);
    }

    if (command == 'init') {
        if (active.b && active.m) { return console.log(`you cannot initialize with both the --bot and --module flag active`) }
        if (!active.b && !active.m) { return console.log(`you need to specify what you want to initialize using either the --bot flag or the --module flag`) }
        
        if (active.b) { require('./cli/initbot.js')(active) }
        if (active.m) { require('./cli/initmodule.js')(active) }
    }

    else if (command == 'install') {
        console.log(process.argv);
    }
}*/