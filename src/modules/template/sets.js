module.exports = {
    sets: {
        guild: {
            var: {
                someothervar: {
                    permissions: ['BOT.MASTER'],
                    type: 'boolean',
                    function: function(input, imports) {
                        imports.local.guild.var.someothervar = input;
                        return input;
                    }
                }
            }
        }
    }
}