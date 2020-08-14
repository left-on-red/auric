var Discord = require('discord.js');

// detects whether or not an object is circular (cannot JSON.stringify circular objects)
function isCyclic(obj) {
    let seenObjects = [];
  
    function detect(obj) {
        if (obj && typeof obj === 'object') {
            if (seenObjects.indexOf(obj) !== -1) { return true }
            seenObjects.push(obj);
            for (var key in obj) { if (obj.hasOwnProperty(key) && detect(obj[key])) { return true } }
        }
        
        return false;
    }
  
    return detect(obj);
}

module.exports = {
    config: {
        permissions: ['BOT.MASTER'],
        description: 'evaluates the given statement and returns the output',
        hidden: false,
        nsfw: false,
        tags: ['management', 'utility'],
        params: [
            { type: 'string', required: true }
        ]
    },

    command: async function(imports, parameters) {
        let embed = new Discord.MessageEmbed();
        embed.setColor(imports.local.guild.colors.accent);

        try {
            var result = await eval(parameters[0]);
            if (result != undefined) {
                if (typeof result == 'object' || !isCyclic(result)) {
                    var object = JSON.stringify(result, null, 4);
                    if (object.length > 1990) {
                        object = new Buffer(object);
                        var attachment = new Discord.Attachment(object, 'eval.json');
                        imports.channel.send(attachment);
                    }

                    else { embed.setDescription(`\`\`\`json\n${object}\n\`\`\``) }
                }

                else { embed.setDescription('undefined') }
            }
        }

        catch(error) { embed.setDescription(`\`\`\`${error.stack}\`\`\``) }

        if (embed.description != 'undefined') { imports.channel.send(embed) }

        /*if (parameters[0].startsWith('object')) {
            var object = JSON.stringify(eval(parameters[0].replace('object', '')), null, 4);
            
            if (object.length > 2000) {
                object = new Buffer(object);
                var attachment = new Discord.Attachment(object, 'eval.json');
                imports.channel.send(attachment);
            }
        
            else {
                imports.channel.send('```json\n' + object + '\n```');
            }
        }
    
        else if (parameters[0].startsWith('return')) {
            imports.channel.send('`' + eval(parameters[0].replace('return', '')) + '`');
        }
    
        else {
            eval(parameters[0]);
        }*/
    }
}