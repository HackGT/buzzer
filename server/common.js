"use strict";
exports.__esModule = true;
// Convert snake_case to CamelCase
function upperCamel(before) {
    return before
        .split('_')
        .map(function (w) { return w.slice(0, 1).toUpperCase() + w.slice(1); })
        .join('');
}
exports.upperCamel = upperCamel;
// Convert CamelCase to snake_case
function lowerSnake(before) {
    return before
        .split(/_|(?=[A-Z])/)
        .filter(function (phrase) { return phrase.length !== 0; })
        .join('_')
        .toLowerCase();
}
exports.lowerSnake = lowerSnake;
