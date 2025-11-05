"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pad = pad;
exports.isoYMD = isoYMD;
exports.isoDate = isoDate;
function pad(n) {
    return n < 10 ? `0${n}` : `${n}`;
}
function isoYMD(y, m, d) {
    return `${y}-${pad(m)}-${pad(d)}`;
}
function isoDate(d) {
    return d.toISOString().slice(0, 10);
}
