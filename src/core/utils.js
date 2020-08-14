let colors = require('./colors.js');
let options = require('./../config/options.json');
let highlighting = colors.colors.highlighting;

var map = require('array-map');
var indexOf = require('indexof');
var isArray = require('isarray');
var forEach = require('foreach');
var reduce = require('array-reduce');
var getObjectKeys = require('object-keys');

function isBoolean(arg) { return typeof arg === 'boolean' }
function isUndefined(arg) { return arg === void 0 }
function isFunction(arg) { return typeof arg === 'function' }
function isString(arg) { return typeof arg === 'string' }
function isNumber(arg) { return typeof arg === 'number' }
function isNull(arg) { return arg === null }
function hasOwn(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop) }
function isRegExp(re) { return isObject(re) && objectToString(re) === '[object RegExp]' }
function isObject(arg) { return typeof arg === 'object' && arg !== null }
function isError(e) { return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error) }
function isDate(d) { return isObject(d) && objectToString(d) === '[object Date]' }
function objectToString(o) { return Object.prototype.toString.call(o) }

function objectKeys(val) { if (Object.keys) return Object.keys(val); return getObjectKeys(val) }

function stylize(str, type) {
    let color = highlighting[type];
    if (color) { return colors.fg.wrap(str, color) }
    else { return str }
}

function arrayToHash(array) {
    let hash = {};
    forEach(array, function(val, idx) { hash[val] = true });
    return hash;
}
  
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
    var output = [];
    for (var i = 0, l = value.length; i < l; ++i) {
        if (hasOwn(value, String(i))) { output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true)) }
        else { output.push('') }
    }

    forEach(keys, function(key) { if (!key.match(/^\d+$/)) { output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true)) } });
    return output;
}
  
function formatError(value) { return '[' + Error.prototype.toString.call(value) + ']' }
function formatValue(ctx, value, recurseTimes) {
    let primitive = formatPrimitive(ctx, value);
    if (primitive) { return primitive }
    let keys = objectKeys(value);
    let visibleKeys = arrayToHash(keys);
  
    try { if (ctx.showHidden && Object.getOwnPropertyNames) { keys = Object.getOwnPropertyNames(value) } }
    catch (e) {}
    if (isError(value) && (indexOf(keys, 'message') >= 0 || indexOf(keys, 'description') >= 0)) { return formatError(value) }
    if (keys.length === 0) {
        if (isFunction(value)) {
            var name = value.name ? ': ' + value.name : '';
            return ctx.stylize('[Function' + name + ']', 'special');
        }

        if (isRegExp(value)) { return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp') }
        if (isDate(value)) { return ctx.stylize(Date.prototype.toString.call(value), 'date') }
        if (isError(value)) { return formatError(value) }
    }
  
    var base = '', array = false, braces = ['{', '}'];
    if (isArray(value)) { array = true; braces = ['[', ']']; }
    if (isFunction(value)) { var n = value.name ? ': ' + value.name : ''; base = ' [Function' + n + ']'; }
    if (isRegExp(value)) { base = ' ' + RegExp.prototype.toString.call(value) }
    if (isDate(value)) { base = ' ' + Date.prototype.toUTCString.call(value) }
    if (isError(value)) { base = ' ' + formatError(value) }
    if (keys.length === 0 && (!array || value.length == 0)) { return braces[0] + base + braces[1] }
    if (recurseTimes < 0) {
        if (isRegExp(value)) { return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp') }
        else { return ctx.stylize('[Object]', 'special') }
    }


    ctx.seen.push(value);
    var output;
    if (array) { output = formatArray(ctx, value, recurseTimes, visibleKeys, keys) }
    else { output = map(keys, function(key) { return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) }) }
    ctx.seen.pop();
    return reduceToSingleString(output, base, braces);
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
    var name, str, desc;
    desc = { value: void 0 };
    try { desc.value = value[key] }
    catch (e) {}
    try { if (Object.getOwnPropertyDescriptor) { desc = Object.getOwnPropertyDescriptor(value, key) || desc } }
    catch (e) {}
    if (desc.get) {
        if (desc.set) { str = ctx.stylize('[Getter/Setter]', 'special') }
        else { str = ctx.stylize('[Getter]', 'special') }
    }

    else { if (desc.set) { str = ctx.stylize('[Setter]', 'special') } }

    if (!hasOwn(visibleKeys, key)) { name = '[' + key + ']' }
    if (!str) {
        if (indexOf(ctx.seen, desc.value) < 0) {
            if (isNull(recurseTimes)) { str = formatValue(ctx, desc.value, null) }
            else { str = formatValue(ctx, desc.value, recurseTimes - 1) }
            if (str.indexOf('\n') > -1) {
                if (array) { str = map(str.split('\n'), function(line) { return '  ' + line }).join('\n').substr(2) }
                else { str = '\n' + map(str.split('\n'), function(line) { return '   ' + line }).join('\n') }
            }
        }
        
        else { str = ctx.stylize('[Circular]', 'special') }
    }

    if (isUndefined(name)) { if (array && key.match(/^\d+$/)) { return str }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) { name = name.substr(1, name.length - 2); name = ctx.stylize(name, 'name'); }
        else { name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"); name = ctx.stylize(name, 'string'); }
    }
  
    return name + ': ' + str;
}

function formatPrimitive(ctx, value) {
    if (isUndefined(value)) { return ctx.stylize('undefined', 'undefined') }
    if (isString(value)) {
        var simple = '\'' + JSON.stringify(value)
            .replace(/^"|"$/g, '')
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"') + '\'';
        return ctx.stylize(simple, 'string');
    }

    if (isNumber(value)) { return ctx.stylize('' + value, 'number') }
    if (isBoolean(value)) { return ctx.stylize('' + value, 'boolean') }
    if (isNull(value)) { return ctx.stylize('null', 'null') }
}
  
function reduceToSingleString(output, base, braces) {
    var length = reduce(output, function(prev, cur) { return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1}, 0);
    if (length > 60) { return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1] }
    return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

module.exports = {
    inspect: function(obj) {
        var ctx = {
            seen: [],
            stylize: stylize,
            colors: true,
            depth: 2
        }

        return formatValue(ctx, obj, ctx.depth);
    }
}
  
