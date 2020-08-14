var Discord = require('discord.js');

async function parse(imports, name) {
    var status = await imports.core.command.status({ name: name }, imports);
    if (status) {
        if (status.userUsable && status.visible && !status.blacklisted && status.whitelisted) {
            if (status.nsfw && !imports.channel.nsfw) { return false }
            else { return true }
        }

        else { return false }
    }

    else { return false }
}

module.exports = {
    config: {
        permissions: [],
        hidden: false,
        nsfw: false,
        params: [
            [
                { type: 'number', required: false, name: 'page' }
            ],

            [
                { type: 'command', required: true, name: 'command' }
            ],

            [
                { type: 'string', required: true, name: 'search terms' },
                { type: 'string', required: false, name: 'page' }
            ]
        ]
    },

    command: [
        // help [page]
        async function(imports, parameters) {
            let command = imports.core.command;
            let embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);
    
            let page = parameters[0] ? parameters[0] - 1 : 0;
            let configs = imports.commands.configs;
            let arr = [];
            for (let c in configs) { 
                if (await parse(imports, c)) { arr.push([c, configs[c]]) }
            }

            var max = Math.ceil(arr.length / 10) - 1;
            if (page > max) {
                if (arr.length == 0) { embed.setDescription(`no commands were found`) }
                else { embed.setDescription(`please specify a smaller page number`) }
            }

            else {
                for (var i = 0; i < 10; i++) {
                    if (arr[(page * 10) + i]) {
                        var syntax = command.syntax(imports.local.guild.prefix, arr[(page * 10) + i][0], imports);
                        embed.addField(arr[(page * 10) + i][0], `\`${syntax}\``);
                    }
                }

                embed.setFooter(`page ${page + 1}/${max + 1}`);
            }

            imports.channel.send(embed);
        },

        // help <command>
        async function(imports, parameters) {
            let command = imports.core.command;
            let embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);
    
            let config = imports.commands.configs[parameters[0]];
            if (!await parse(imports, parameters[0])) { embed.setDescription(`you don't have permission to view that command`) }
            //if (config.permissions.includes('BOT.MASTER') && imports.config.master != imports.user.id) { embed.setDescription(`you don't have permission to view that command`) }
            else {
                embed.addField('description', config.description, true);
                embed.addField('usage', `\`${command.syntax(imports.local.guild.prefix, parameters[0], imports)}\``, true);
                if (config.tags) { embed.addField('tags', config.tags.join(', '), true) }
                if (config.permissions.length > 0) {
                    let arr = [];
                    for (let p = 0; p < config.permissions.length; p++) { arr.push(`\`${config.permissions[p]}\``) }
                    embed.addField('permissions', arr.join(', '));
                }
                embed.addField('nsfw', config.nsfw, true);
            }
            
            imports.channel.send(embed);
        },

        // help <search terms> [page]
        async function(imports, parameters) {
            let command = imports.core.command;
            let embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);
    
            let page = parameters[1] ? parameters[1] - 1 : 0;
    
            let configs = imports.commands.configs;
            let list = {};

            for (c in configs) { if (await parse(imports, c) && configs[c].tags && configs[c].tags.includes(parameters[0])) { list[c] = configs[c] } }
            let arr = [];

            for (l in list) { arr.push([l, list[l]]) }
            let max = Math.ceil(arr.length / 10) - 1;
            if (page > max) {
                if (arr.length == 0) { embed.setDescription('no commands were found') }
                else { embed.setDescription('please specify a smaller page number') }
            }

            else {
                for (let i = 0; i < 10; i++) {
                    if (arr[(page * 10) + i]) {
                        let syntax = command.syntax(imports.local.guild.prefix, arr[(page * 10) + i][0], imports);
                        embed.addField(arr[(page * 10) + i][0], `\`${syntax}\``);
                    }
                }

                embed.setFooter(`page ${page + 1}/${max + 1}`);
            }

            imports.channel.send(embed);
        }
    ]
}