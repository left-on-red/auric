Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function index(obj, is, value) {
    try {
        if (typeof is == 'string') { return index(obj,is.split('.'), value) }
        else if (is.length == 1 && value !== undefined) { return obj[is[0]] = value }
        else if (is.length == 0) { return obj }
        else { return index(obj[is[0]], is.slice(1), value) }
    }

    catch(error) {}
}

var Discord = require('discord.js');

module.exports = {
    config: {
        permissions: [],
        description: 'gets a value from whatever you specify',
        hidden: false,
        nsfw: false,
        tags: ['management', 'utility'],
        params: [
            { type: 'string', required: true, name: 'path' },
            { type: 'string', required: true, name: 'value' }
        ]
    },

    command: async function(imports, parameters) {
        var embed = new Discord.MessageEmbed();
        embed.setColor(imports.local.guild.colors.accent);

        let obj = index(imports.sets.data, parameters[0]);

        if (obj != undefined) {
            if (typeof obj == 'object' && obj.function) {
                let authorized = true;
                for (let p = 0; p < obj.permissions.length; p++) {
                    let perms = await imports.core.command.hasPermission(obj.permissions[p], imports);
                    if (!perms.userPerms) { authorized = false }
                    /*let authorized = true;
                    for (let p = 0; p < value.permissions.length; p++) {
                        if (!(await imports.core.command.hasPermission(value.permissions[p], imports))) { authorized = false }
                    }
        
                    if (authorized) { embed.setDescription(`${value.function.constructor.name == 'AsyncFunction' ? await value.function(imports, parameters[0]) : value.function(imports, parameters[0])}`) }
                    else { embed.setDescription(`you don't have permission to view that property`) } */
                }

                if (authorized) {
                    if (imports.commands.methods[obj.type](parameters[1], imports).pass) {
                        let value = imports.commands.methods[obj.type](parameters[1], imports).value;
                        let set = obj.function.constructor.name == 'AsyncFunction' ? await obj.function(value, imports, parameters[0]) : obj.function(value, imports, parameters[0]);
                        embed.setDescription(`set \`${parameters[0]}\` to ${set}`);
                    }
                }

                else { embed.setDescription(`you don't have permission to change that property`) }
            }

            else { embed.setDescription(`\`${parameters[0]}\` does not exist`) }
        }

        else { embed.setDescription(`\`${parameters[0]}\` does not exist`) }
    
        imports.channel.send(embed);
    }
}