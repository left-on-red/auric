/*{   
    "sets": {
        "bot": {
            "status": "string"
        },

        "guild": {
            "config": {
                "prefix": "string"
            },
            
            "colors": "color",
            "options": "boolean"
        }
    }
} */

function index(obj, is, value) {
    try {
        if (typeof is == 'string') { return index(obj,is.split('.'), value) }
        else if (is.length == 1 && value !== undefined) { return obj[is[0]] = value }
        else if (is.length == 0) { return obj }
        else { return index(obj[is[0]], is.slice(1), value) }
    }

    catch(error) {}
}

module.exports = {
    init: function(imports) {
        imports.sets.data.guild.options = {};
        function recurOptions(obj, data, path) {
            for (let o in obj) {
                if (typeof obj[o] == 'boolean') {
                    data[o] = {
                        permissions: ['GUILD.MANAGE'],
                        type: 'boolean',
                        function: function(input, imports, path) {
                            path = path.slice(6);
                            index(imports.local.guild, path, input);
                            return `${input}`;
                        }
                    }
                }

                else {
                    data[o] = {};
                    recurOptions(obj[o], data[o]);
                }
            }
        }

        recurOptions(imports.config.defaults.guild.options, imports.sets.data.guild.options);
    },

    sets: {
        bot: {
            activity: {
                permissions: ['BOT.MASTER'],
                type: 'string',
                function: async function(input, imports) {
                    await imports.client.user.setPresence({ activity: { name: input }, status: 'online' });
                    return `"playing **${input}**"`;
                }
            }
        },
    
        guild: {
            prefix: {
                permissions: ['GUILD.MANAGE'],
                type: 'string',
                function: function(input, imports) {
                    imports.local.guild.prefix = input;
                    return input;
                }
            },

            colors: {
                accent: {
                    permissions: ['GUILD.MANAGE'],
                    type: 'color',
                    function: function(input, imports) {
                        imports.local.guild.colors.accent = input;
                        return input;
                    }
                }
            }
        }
    }
}