// is valid hex color code
module.exports = function(input, passthrough) {
    var output = { pass: false, value: null }
    if (/^#[0-9A-F]{6}$/i.test(input)) { output.pass = true }
    else if (/^#([0-9A-F]{3}){1,2}$/i.test(input)) { output.pass = true }
    if (output.pass) { output.value = input }
    return output;
}