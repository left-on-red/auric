let Discord = require('discord.js');
let moment = require('moment');

module.exports = {
    config: {
        permissions: [],
        description: 'gets information related to a user',
        hidden: false,
        nsfw: false,
        tags: ['information', 'utility'],
        params: [
            [ { type: 'mention', required: false, name: 'user' } ],
            [
                { type: 'string', required: true, requiredValue: 'permissions' },
                { type: 'mention', required: false, name: 'user' }
            ]
        ]
    },

    command: [
        async function(imports, parameters) {
            var embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);
        
            let member = imports.member;
            if (parameters[0]) { member = await imports.guild.members.fetch(parameters[0]) }
        
            embed.setTitle(member.user.tag);
            embed.addField('id', member.id, true);
            if (member.nickname) { embed.addField('nickname', member.nickname, true) }

            embed.addField('joined', moment(member.joinedAt).format('llll'));
            embed.addField('created', moment(member.user.createdAt).format('llll'));
            
            embed.setThumbnail(member.user.avatarURL({ format: 'png' }));
    
            imports.channel.send(embed);
        },

        async function(imports, parameters) {
            var embed = new Discord.MessageEmbed();
            embed.setColor(imports.local.guild.colors.accent);
        
            let member = imports.member;
            if (parameters[1]) { member = await imports.guild.members.fetch(parameters[1]) }

            embed.setAuthor(`${member.user.tag} - permissions`, member.user.avatarURL({ format: 'png' }));

            let permArr = [];
            let discordPerms = member.permissions.serialize();
            for (let d in discordPerms) { if (discordPerms[d]) { permArr.push(`\`DISCORD.${d}\``) } }
    
            embed.setDescription(permArr.join(', '));

            imports.channel.send(embed);
        }
    ]
}