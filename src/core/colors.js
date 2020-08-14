let fgcodes = Array.apply(null, new Array(256)).map(function(_, i) { return `\x1b[38;5;${i}m` });
let bgcodes = Array.apply(null, new Array(256)).map(function(_, i) { return `\x1b[48;5;${i}m` });

let colors = require('./../config/colors.json');

// refer to this for rgb scale reference:
// https://www.npmjs.com/package/ansi-256-colors

let regexes = {
    //ansi: /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ansi: /\u001b\[.*?m/g,
    strings: /"(.*?)"/g,
    keywords: /\b(null|true|false|undefined|Infinity\$)(?=[^\w])/g,
    numbers: /\b(\d+)\b/g
}
//cleanColors: function(string) { return string.replace(regexes.ansi) }
module.exports = {
    colors: colors,
    reset: '\x1b[0m',
    fg: {
        codes: fgcodes,
        standard: fgcodes.slice(0, 8),
        bright: fgcodes.slice(8, 16),
        rgb: fgcodes.slice(16, 232),
        grayscale: fgcodes.slice(232, 256),
        getRGB: function(r, g, b) { return this.rgb[36*r + 6*g + b] },
        wrap: function(string, color) {
            if (color) {
                if (color.length == 3) { return `${this.getRGB(color[0], color[1], color[2])}${string}\x1b[0m` }
                else {
                    let selection = [this.standard, this.bright, this.grayscale];
                    return `${selection[color[0]][color[1]]}${string}\x1b[0m`;
                }
            }
        }
    },

    bg: {
        codes: bgcodes,
        standard: bgcodes.slice(0, 8),
        bright: bgcodes.slice(8, 16),
        rgb: bgcodes.slice(16, 232),
        grayscale: bgcodes.slice(232, 256),
        getRGB: function (r, g, b) { return bg.rgb[36*r + 6*g + b] },
        wrap: function(string, color) { return `${this.getRGB(color[0], color[1], color[2])}${string}\x1b[0m` }
    },

    clean: function(string) { return string.replace(regexes.ansi, '') },
    highlight: function(string) {
        string = string.replace(regexes.keywords, `${this.fg.wrap('$1', colors.highlighting.keywords)}`);
        string = string.replace(regexes.numbers, `${this.fg.wrap('$1', colors.highlighting.numbers)}`);
        string = string.replace(regexes.strings, `${this.fg.wrap('"$1"', colors.highlighting.strings)}`);
        return string;
    }
}