process.argv.shift(); // node entry point
process.argv.shift(); // node.exe
let args = process.argv;

let command = null;

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

async function start() {
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
        for (let c in commands) { commandArr.push(`${c} (${commands[c]})`) };

        let flagsArr = [];
        for (let f in flags) { flagsArr.push(`${f} (${flags[f]}) - ${desc[f]}`) }

        return console.log(`\nusage: auric <command> [flags]\n\ncommands: ${commandArr.join(', ')}\n\nflags:\n    ${flagsArr.join(',\n    ')}`);
    }

    if (command == 'init') {
        if (active.b && active.m) { return console.log(`you cannot initialize with both the --bot and --module flag active`) }
        if (!active.b && !active.m) { return console.log(`you need to specify what you want to initialize using either the --bot flag or the --module flag`) }
        
        if (active.b) { require('./cli/initbot.js')(active) }
        if (active.m) { require('./cli/initmodule.js')(active) }
    }

    else if (command == 'install') {
        
    }
}

start();