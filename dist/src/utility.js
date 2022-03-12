"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValue = void 0;
const tslib_1 = require("tslib");
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
function getValue(value, decimals, cutOff = false) {
    if (!decimals) {
        return new bignumber_js_1.default(value).toNumber();
    }
    const s = '1e' + decimals;
    const x = new bignumber_js_1.default(value);
    let temp = new bignumber_js_1.default(x.div(s));
    if (cutOff) {
        temp = new bignumber_js_1.default(temp.toFixed(3));
    }
    return temp.toNumber();
}
exports.getValue = getValue;
//# sourceMappingURL=utility.js.map