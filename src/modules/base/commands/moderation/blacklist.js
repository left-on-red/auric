var Discord = require('discord.js');

// TODO: role blacklists
module.exports = {
    config: {
        permissions: ['GUILD.MANAGE'],
        description: 'used for managing command blacklisting',
        hidden: false,
        nsfw: false,
        tags: ['management', 'admin'],
        params: [
            [
                { type: 'string', required: true, requiredValue: 'get' },
                { type: 'mention', required: true, name: 'user' }
            ],

            [
                { type: 'string', required: true, requiredValue: 'add' },
                { type: 'mention', required: true, name: 'user' },
                { type: 'command', required: true, name: 'command' }
            ],

            [
                { type: 'string', required: true, requiredValue: 'remove' },
                { type: 'mention', required: true, name: 'user' },
                { type: 'command', required: true, name: 'command' }
            ],

            [
                { type: 'string', required: true, requiredValue: 'clear' },
                { type: 'mention', required: true, name: 'user' }
            ]
        ]
    },

    command: [
        // get <user>
        async function(imports, parameters) {
            let embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);
            
            let member = await imports.guild.members.fetch(parameters[1]);

            if (!imports.local.guild.blacklist[parameters[1]] || imports.local.guild.blacklist[parameters[1]].length == 0) { embed.setDescription(`**${member.user.tag}** doesn't have any commands blacklisted`) }
            else {
                embed.setTitle(`${member.user.tag}'s blacklist`);
                embed.setDescription(imports.local.guild.blacklist[parameters[1]].join(',\n'));
            }
    
            imports.channel.send(embed);
        },

        // add <user> <command>
        async function(imports, parameters) {
            let embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);
        
            let member = await imports.guild.members.fetch(parameters[1]);
            if (!imports.local.guild.blacklist[parameters[1]]) { imports.local.guild.blacklist[parameters[1]] = [] }
            if (imports.local.guild.blacklist[parameters[1]].includes(parameters[2])) { embed.setDescription(`**${member.user.tag}** is already blacklisted from using **${parameters[2]}**`) }
            else {
                imports.local.guild.blacklist[parameters[1]].push(parameters[2]);
                embed.setDescription(`**${member.user.tag}** has been blacklisted from using the **${parameters[2]}** command`);
            }
    
            imports.channel.send(embed);
        },

        // remove <user> <command>
        async function(imports, parameters) {
            let embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);

            let member = await imports.guild.members.fetch(parameters[1]);
            if (!imports.local.guild.blacklist[parameters[1]]) { imports.local.guild.blacklist[parameters[1]] = [] }
            if (imports.local.guild.blacklist[parameters[1]].includes(parameters[2])) {
                let index = imports.local.guild.blacklist[parameters[1]].indexOf(parameters[2]);
                imports.local.guild.blacklist[parameters[1]].splice(index, 1);
                if (imports.local.guild.blacklist[parameters[1]].length == 0) { delete imports.local.guild.blacklist[parameters[1]] }
                embed.setDescription(`**${member.user.tag}** is nolonger blacklisted from using the **${parameters[2]}** command`);
            }

            else { embed.setDescription(`that command isn't blacklisted`) }
    
            imports.channel.send(embed);
        },

        // clear <user>
        async function(imports, parameters) {
            let member = await imports.guild.members.fetch(parameters[1]);
            if (imports.local.guild.blacklist[parameters[1]]) {
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
                    delete imports.local.guild.blacklist[parameters[1]];
                    embed2.setDescription(`**${member.user.tag}**'s blacklist has been cleared`);
                }

                message.edit(embed2);
            }

            else {
                let embed = new Discord.MessageEmbed();
                embed.setDescription(imports.local.guild.colors.accent);
                embed.setDescription(`**${member.user.tag}** has no blacklisted commands`);
                imports.channel.send(embed);
            }
        }
    ]
}