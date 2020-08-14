var Discord = require('discord.js');

// TODO: role whitelists
module.exports = {
    config: {
        permissions: ['GUILD.MANAGE'],
        description: 'used for managing command whitelisting',
        hidden: false,
        nsfw: false,
        tags: ['management', 'admin'],
        params: [
            [
                { type: 'string', required: true, requiredValue: 'get' },
                { type: 'command', required: true },
            ],

            [
                { type: 'string', required: true, requiredValue: 'add' },
                { type: 'command', required: true },
                { type: 'mention', required: true, name: 'user' }
            ],

            [
                { type: 'string', required: true, requiredValue: 'remove' },
                { type: 'command', required: true },
                { type: 'mention', required: true, name: 'user' }
            ],

            [
                { type: 'string', required: true, requiredValue: 'clear' },
                { type: 'command', required: true }
            ]
        ]
    },

    command: [
        // get <command> <user>
        async function(imports, parameters) {
            var embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);

            if (imports.local.guild.whitelist[parameters[1]] && imports.local.guild.whitelist[parameters[1]].length > 0) {
                let members = [];
                for (let m = 0; m < imports.local.guild.whitelist[parameters[1]].length; m++) {
                    let member = await imports.guild.members.fetch(imports.local.guild.whitelist[parameters[1]][m]);
                    members.push(member.user.tag);
                }

                embed.setTitle(`${imports.local.guild.config.prefix}${parameters[1]} whitelist`);
                embed.setDescription(members.join(', '));
            }

            else { embed.setDescription(`that command doesn't have a whitelist`) }
        
            imports.channel.send(embed);
        },

        // add <command> <user>
        async function(imports, parameters) {
            var embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);

            let member = await imports.guild.members.fetch(parameters[2]);

            if (!imports.local.guild.whitelist[parameters[1]]) { imports.local.guild.whitelist[parameters[1]] = [] }

            if (!imports.local.guild.whitelist[parameters[1]].includes(parameters[2])) {
                imports.local.guild.whitelist[parameters[1]].push(parameters[2]);
                embed.setDescription(`**${member.user.tag}** has been added to the **${parameters[1]}** whitelist`);
            }

            else { embed.setDescription(`that command is already whitelisted for that user`) }
        
            imports.channel.send(embed);
        },

        // remove <command> <user>
        async function(imports, parameters) {
            var embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);

            if (imports.local.guild.whitelist[parameters[1]] && imports.local.guild.whitelist[parameters[1]].length > 0) {
                if (imports.local.guild.whitelist[parameters[1]].includes(parameters[2])) {
                    let member = await imports.guild.members.fetch(parameters[2]);
                    let index = imports.local.guild.whitelist[parameters[1]].indexOf(parameters[2]);
                    imports.local.guild.whitelist[parameters[1]].splice(index, 1);
                    if (imports.local.guild.whitelist[parameters[1]].length == 0) { delete imports.local.guild.whitelist[parameters[1]] }
                    embed.setDescription(`**${member.user.tag}** has been removed from the **${parameters[1]}** whitelist`);
                }

                else { embed.setDescription(`that command isn't whitelisted for that user`) }
            }

            else { embed.setDescription(`that command doesn't have a whitelist`) }
        
            imports.channel.send(embed);
        },

        // clear <command>
        async function(imports, parameters) {
            if (imports.local.guild.whitelist[parameters[1]]) {
                let embed1 = new Discord.MessageEmbed();
                embed1.setColor(imports.local.guild.colors.accent);
                embed1.setDescription(`confirm by typing \`${imports.local.guild.config.prefix}accept\``);
                let message = await imports.channel.send(embed1);
                let requestResponse = await imports.awaitRequest(imports.guild.id, imports.channel.id, imports.user.id);
                
                let embed2 = new Discord.MessageEmbed();
                embed2.setColor(imports.local.guild.colors.accent);
                if (requestResponse == -1) { embed2.setDescription(`you already have a pending request!`) }
                else if (requestResponse == 0) { embed2.setDescription(`the request had timed out!`) }
                else if (requestResponse == 1) {
                    delete imports.local.guild.whitelist[parameters[1]];
                    embed2.setDescription(`the **${parameters[1]}** whitelist has been cleared`);
                }

                message.edit(embed2);
            }

            else {
                let embed = new Discord.MessageEmbed();
                embed.setColor(imports.local.guild.colors.accent);
                embed.setDescription(`that command doesn't have a whitelist`);
                imports.channel.send(embed);
            }
        }
    ]
}