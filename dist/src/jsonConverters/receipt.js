"use strict";
// To parse this data:
//
//   import { Convert, Receipt } from "./file";
//
//   const receipt = Convert.toReceipt(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertReceipt = void 0;
// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
class ConvertReceipt {
    static toReceipt(json) {
        return cast(JSON.parse(json), r('Receipt'));
    }
    static receiptToJson(value) {
        return JSON.stringify(uncast(value, r('Receipt')), null, 2);
    }
}
exports.ConvertReceipt = ConvertReceipt;
function invalidValue(typ, val, key = '') {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
}
function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => (map[p.json] = { key: p.js, typ: p.typ }));
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}
function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => (map[p.js] = { key: p.json, typ: p.typ }));
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}
function transform(val, typ, getProps, key = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val)
            return val;
        return invalidValue(typ, val, key);
    }
    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            }
            catch (_) { }
        }
        return invalidValue(typs, val);
    }
    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1)
            return val;
        return invalidValue(cases, val);
    }
    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val))
            return invalidValue('array', val);
        return val.map((el) => transform(el, typ, getProps));
    }
    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue('Date', val);
        }
        return d;
    }
    function transformObject(props, additional, val) {
        if (val === null || typeof val !== 'object' || Array.isArray(val)) {
            return invalidValue('object', val);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach((key) => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key)
                ? val[key]
                : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }
    if (typ === 'any')
        return val;
    if (typ === null) {
        if (val === null)
            return val;
        return invalidValue(typ, val);
    }
    if (typ === false)
        return invalidValue(typ, val);
    while (typeof typ === 'object' && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ))
        return transformEnum(typ, val);
    if (typeof typ === 'object') {
        return typ.hasOwnProperty('unionMembers')
            ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty('arrayItems')
                ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty('props')
                    ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== 'number')
        return transformDate(val);
    return transformPrimitive(typ, val);
}
function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}
function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}
function a(typ) {
    return { arrayItems: typ };
}
// @ts-ignore
function u(...typs) {
    return { unionMembers: typs };
}
function o(props, additional) {
    return { props, additional };
}
// @ts-ignore
function m(additional) {
    return { props: [], additional };
}
function r(name) {
    return { ref: name };
}
const typeMap = {
    Receipt: o([
        { json: 'blockHash', js: 'blockHash', typ: '' },
        { json: 'blockNumber', js: 'blockNumber', typ: 0 },
        { json: 'contractAddress', js: 'contractAddress', typ: null },
        { json: 'cumulativeGasUsed', js: 'cumulativeGasUsed', typ: 0 },
        { json: 'effectiveGasPrice', js: 'effectiveGasPrice', typ: 0 },
        { json: 'from', js: 'from', typ: '' },
        { json: 'gasUsed', js: 'gasUsed', typ: 0 },
        { json: 'logs', js: 'logs', typ: a(r('Log')) },
        { json: 'logsBloom', js: 'logsBloom', typ: '' },
        { json: 'status', js: 'status', typ: true },
        { json: 'to', js: 'to', typ: '' },
        { json: 'transactionHash', js: 'transactionHash', typ: '' },
        { json: 'transactionIndex', js: 'transactionIndex', typ: 0 },
        { json: 'type', js: 'type', typ: '' },
    ], false),
    Log: o([
        { json: 'address', js: 'address', typ: '' },
        { json: 'topics', js: 'topics', typ: a('') },
        { json: 'data', js: 'data', typ: '' },
        { json: 'blockNumber', js: 'blockNumber', typ: 0 },
        { json: 'transactionHash', js: 'transactionHash', typ: '' },
        { json: 'transactionIndex', js: 'transactionIndex', typ: 0 },
        { json: 'blockHash', js: 'blockHash', typ: '' },
        { json: 'logIndex', js: 'logIndex', typ: 0 },
        { json: 'removed', js: 'removed', typ: true },
        { json: 'id', js: 'id', typ: '' },
    ], false),
};
//# sourceMappingURL=receipt.js.map