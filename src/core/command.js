var Discord = require('discord.js');

module.exports = {
    get: function(command, passthrough) { if (passthrough.commands.configs[command]) { return passthrough.commands.configs[command] } },
    hasPermission: async function(permission, passthrough) {
        var toReturn;
        async function recur(obj, perm) {
            var path = perm.split('.');
            path = path.filter(Boolean);
            if (obj[path[0]]) {
                if (obj[path[0]] instanceof Function) {
                    if (path[1]) { toReturn = await obj[path[0]](path[1], passthrough) }
                    else { toReturn = await obj[path[0]](path[0], passthrough) }
                }

                else { var shifted = path.shift(); await recur(obj[shifted], path.join('.')) }
            }
        }

        await recur(passthrough.commands.permissions, permission);
        return toReturn;
    },

    status: async function(command, passthrough) {
        let config = passthrough.commands.configs[command.name];
        if (config) {
            var required = config.permissions;
            var missingPerm = false;
            var userUsable = true;
            var botUsable = true;
            var visible = true;
            var nsfw = false;
            var blacklisted = false;
            var whitelisted = true;
            var master = false;
            var cooldown = false;

            var blacklist = [];
            if (passthrough.local.guild.blacklist[passthrough.member.id]) { blacklist = passthrough.local.guild.blacklist[passthrough.member.id] }
            var whitelist = [];
            if (passthrough.local.guild.whitelist[command.name]) { whitelist = passthrough.local.guild.whitelist[command.name] }

            for (b in blacklist) { if (blacklist[b] == command.name) { blacklisted = true } }
            if (whitelist.length != 0) { if (!whitelist.includes(passthrough.member.id)) { whitelisted = false } }

            for (r in required) {
                var permission = await this.hasPermission(required[r], passthrough);
                if (!permission.userPerms) { missingPerm = true }
                if (!permission.botPerms) { botUsable = false }
                if (permission.master) { master = true }

                if (Discord.Permissions.FLAGS[required[r]]) {
                    if (!passthrough.member.hasPermission(Discord.Permissions.FLAGS[required[r]])) { missingPerm = true }
                    if (!passthrough.guild.me.hasPermission(Discord.Permissions.FLAGS[required[r]])) { botUsable = false }
                }
            }

            if (blacklisted || !whitelisted || missingPerm ) { userUsable = false }
            if (missingPerm) { userUsable = false }
            if (config.cooldown) {
                if (!passthrough.local.user.cooldowns[command.name]) { passthrough.local.user.cooldowns[command.name] = -1 }
                var usedWhen = passthrough.local.user.cooldowns[command.name];
                var date = new Date();
                var now = date.getTime();
                if (usedWhen != -1) {
                    var difference = now - usedWhen;

                    if (difference < config.cooldown) { cooldown = true; userUsable = false; }
                }
            }

            if (config.hidden) { visible = false }
            if (config.nsfw) { nsfw = true }

            if (nsfw && !passthrough.channel.nsfw) { userUsable = false }

            return {
                userUsable: userUsable,
                botUsable: botUsable,

                visible: visible,
                nsfw: nsfw,

                missingPerm: missingPerm,

                blacklisted: blacklisted,
                whitelisted: whitelisted,
                cooldown: cooldown,
                master: master
            }
        }
    },

    evalulateParams: function(inputs, params, passthrough) {
        let toReturn = [];
        for (let i = 0; i < inputs.length; i++) { toReturn.push(passthrough.commands.methods[params[i].type](inputs[i], passthrough).value) }
        return toReturn;
    },

    check: function(name, parameters, passthrough) {
        var config = passthrough.commands.configs[name];
        if (config && config.params.length > 0) {
            var requirements = [];
            for (let i = 0; i < config.params.length; i++) {
                requirements.push(0);
                for (let p = 0; p < config.params[i].length; p++) { if (config.params[i][p].required) { requirements[i]++ } }
            }

            let toReturn = -1;

            let params = config.params;
            for (let i = 0; i < params.length; i++) {
                let error = false;
                if (params[i].length != 0) {
                    if (parameters.length == 0 && params[i][0].required) { error = true }
                    if (parameters.length > params[i].length) { error = true }
                    if (requirements[i] > parameters.length) { error = true }

                    if (parameters.length <= params[i].length) {
                        for (let p = 0; p < parameters.length; p++) {
                            if (p == parameters.length - 1) { if (!(parameters.length >= requirements[i])) { error = true } }
                        }
                    }
                }

                if (parameters.length <= params[i].length) {
                    for (let p = 0; p < parameters.length; p++) {
                        if (params[i][p].requiredValue && params[i][p].requiredValue != parameters[p]) { error = true }
                        if (!passthrough.commands.methods[params[i][p].type](parameters[p], passthrough).pass) { error = true }
                    }
                }

                else { error = true }
                if (!error) { toReturn = i; break; }
            }

            return toReturn;
        }

        else { return 0; }
    },

    syntax: function(prefix, command, passthrough) {
        var config = passthrough.commands.configs[command];
        if (config) {
            let syntax = config.params.length == 0 ? [[`${prefix + command}`]] : [];
            if (config.params && config.params.length > 0) {
                for (let p = 0; p < config.params.length; p++) {
                    syntax.push([`${prefix + command}`]);
                    for (let pp = 0; pp < config.params[p].length; pp++) {
                        let insert = config.params[p][pp].type;
                        if (config.params[p][pp].name) { insert = config.params[p][pp].name }
                        if (config.params[p][pp].requiredValue != undefined && typeof config.params[p][pp].requiredValue == 'string') {
                            if (config.params[p][pp].required) { syntax[p].push(config.params[p][pp].requiredValue) }
                            else { syntax[p].push(`${config.params[p][pp].requiredValue}?`) }
                        }

                        else {
                            if (config.params[p][pp].required) { syntax[p].push(`<${insert}>`) }
                            else { syntax[p].push(`[${insert}]`) }
                        }
                    }
                }
            }

            let arr = [];
            for (let s = 0; s < syntax.length; s++) { arr.push(syntax[s].join(' ')) }

            return arr.join('\n');
        }
    }
}