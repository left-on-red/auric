
let colors = require('./../src/core/colors.js');
let banner = `
                    .__        
_____   __ _________|__| ____  
\\__  \\ |  |  \\_  __ \\  |/ ___\\ 
 / __ \\|  |  /|  | \\/  \\  \\___ 
(____  /____/ |__|  |__|\\___  >
     \\/                     \\/`

let github = 'https://github.com/shadeRed/auric/';

module.exports = {
    banner: colors.fg.wrap(banner, [5, 4, 1]),
    github: colors.fg.wrap(github, [1, 4, 5])
}