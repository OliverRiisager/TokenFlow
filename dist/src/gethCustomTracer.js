"use strict";
/*
This doc uses a modified version of the tracer code from https://github.com/ethereum/go-ethereum/blob/master/eth/tracers/js/internal/tracers/call_tracer_legacy.js (03/02/2022) <-- dd/mm/yyyy format
- The license for the above is included in this project as COPYING.LESSER file.
- The project can be found here : https://github.com/ethereum/go-ethereum
- The modifications to it are that i add any logs (indexes) to whichever call element came before it.
- i also compare based on numbers rather than strings in most cases.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracer = void 0;
const logInsertion = 
//LOG0 - 4
'   var logElement = {};' +
    '   if (opcode == 0xA0 || opcode == 0xA1 || opcode == 0xA2 || opcode == 0xA3 || opcode == 0xA4) {' +
    '     logElement.logIndex = this.logIndex;' +
    '     this.logIndex++;' +
    '	  if(this.previousCall === undefined){' +
    '		this.logsNoCall.push(logElement);' +
    '     	return;' +
    '	  }' +
    '     if(this.previousCall.logs === undefined){' +
    '       this.previousCall.logs = [];' +
    '		for (var i = 0; i < this.logsNoCall.length; i++) {' +
    '     		this.previousCall.logs.push(logsNoCall[i]);' +
    '     	}' +
    '       this.logsNoCall.logs = [];' +
    '     }' +
    '     this.previousCall.logs.push(logElement);' +
    '     return;' +
    '   }';
const step = 
// step is invoked for every opcode that the VM executes.
'	step: function(log, db) {' +
    // Capture any errors immediately
    '		var error = log.getError();' +
    '		if (error !== undefined) {' +
    '			this.fault(log, db);' +
    '			return;' +
    '		}' +
    // We only care about system opcodes, faster if we pre-check once
    '       var opcode = log.op.toNumber();' +
    '		var syscall = (opcode & 0xf0) == 0xf0;' +
    '		if (syscall) {' +
    '			var op = log.op.toString();' +
    '		}' +
    logInsertion +
    // If a contract is being self destructed, gather that as a subcall too
    '		if (syscall && opcode == 0xff) {' + // If selfdestruct
    '			var left = this.callstack.length;' +
    '			if (this.callstack[left-1].calls === undefined) {' +
    '				this.callstack[left-1].calls = [];' +
    '			}' +
    '			var tmpObj = {};' +
    '			tmpObj.type = op;' +
    '			tmpObj.from = toHex(log.contract.getAddress());' +
    '			tmpObj.to = toHex(toAddress(log.stack.peek(0).toString(16)));' +
    '			tmpObj.gasIn = log.getGas();' +
    '			tmpObj.gasCost = log.getCost();' +
    '			tmpObj.value = "0x" + db.getBalance(log.contract.getAddress()).toString(16);' +
    '			this.callstack[left-1].calls.push(tmpObj);' +
    '			return;' +
    '		}' +
    // If a new method invocation is being done, add to the call stack
    '		if (syscall && (opcode == 0xF1 || opcode == 0xF2)) {' + //CALL, CALLCODE
    // Skip any pre-compile invocations, those are just fancy opcodes
    '			var to = toAddress(log.stack.peek(1).toString(16));' +
    '			if (isPrecompiled(to)) {' +
    '				return;' +
    '			}' +
    '			var inOff = log.stack.peek(3).valueOf();' +
    '			var inEnd = inOff + log.stack.peek(4).valueOf();' +
    // Assemble the internal call report and store for completion
    '			var call = {};' +
    '			call.type = op;' +
    '			call.from = toHex(log.contract.getAddress());' +
    '			call.to = toHex(to);' +
    '			call.input = toHex(log.memory.slice(inOff, inEnd));' +
    '			call.gasIn = log.getGas();' +
    '			call.gasCost = log.getCost();' +
    '			call.outOff = log.stack.peek(5).valueOf();' +
    '			call.outLen = log.stack.peek(6).valueOf();' +
    '			if (op != "DELEGATECALL" && op != "STATICCALL") {' +
    '				call.value = "0x" + log.stack.peek(2).toString(16);' +
    '			}' +
    '			this.callstack.push(call);' +
    '           this.previousCall = call;' +
    '			this.descended = true;' +
    '			return;' +
    '		}' +
    // If we've just descended into an inner call, retrieve it's true allowance. We
    // need to extract if from within the call as there may be funky gas dynamics
    // with regard to requested and actually given gas (2300 stipend, 63/64 rule).
    '		if (this.descended) {' +
    '			if (log.getDepth() >= this.callstack.length) {' +
    '				this.callstack[this.callstack.length - 1].gas = log.getGas();' +
    '			} else {' +
    // TODO(karalabe): The call was made to a plain account. We currently don't
    // have access to the true gas amount inside the call and so any amount will
    // mostly be wrong since it depends on a lot of input args. Skip gas for now.
    '			}' +
    '			this.descended = false;' +
    '		}' +
    // If an existing call is returning, pop off the call stack
    '		if (syscall && opcode == 0xFD) {' + //If revert
    '			this.callstack[this.callstack.length - 1].error = "execution reverted";' +
    '			return;' +
    '		}' +
    '		if (log.getDepth() == this.callstack.length - 1) {' +
    // Pop off the last call and get the execution results
    '			var call = this.callstack.pop();' +
    '			if (call.type != "CREATE" && call.type != "CREATE2") {' +
    // If the call was a contract call, retrieve the gas usage and output
    '				if (call.gas !== undefined) {' +
    '					call.gasUsed = "0x" + bigInt(call.gasIn - call.gasCost + call.gas - log.getGas()).toString(16);' +
    '				}' +
    '				var ret = log.stack.peek(0);' +
    '				if (!ret.equals(0)) {' +
    '					call.output = toHex(log.memory.slice(call.outOff, call.outOff + call.outLen));' +
    '				} else if (call.error === undefined) {' +
    '					call.error = "internal failure";' + // TODO(karalabe): surface these faults somehow
    '				}' +
    '				delete call.gasIn; delete call.gasCost;' +
    '				delete call.outOff; delete call.outLen;' +
    '			}' +
    '			if (call.gas !== undefined) {' +
    '				call.gas = "0x" + bigInt(call.gas).toString(16);' +
    '			}' +
    // Inject the call into the previous one
    '			var left = this.callstack.length;' +
    '			if (this.callstack[left-1].calls === undefined) {' +
    '				this.callstack[left-1].calls = [];' +
    '			}' +
    '			this.callstack[left-1].calls.push(call);' +
    '            this.previousCall = call;' +
    '		}' +
    '	},';
const fault = 
// fault is invoked when the actual execution of an opcode fails.
'	fault: function(log, db) {' +
    // If the topmost call already reverted, don't handle the additional fault again
    '		if (this.callstack[this.callstack.length - 1].error !== undefined) {' +
    '			return;' +
    '		}' +
    // Pop off the just failed call
    '		var call = this.callstack.pop();' +
    '		call.error = log.getError();' +
    // Consume all available gas and clean any leftovers
    '		if (call.gas !== undefined) {' +
    '			call.gas = "0x" + bigInt(call.gas).toString(16);' +
    '			call.gasUsed = call.gas' +
    '		}' +
    '		delete call.gasIn; delete call.gasCost;' +
    '		delete call.outOff; delete call.outLen;' +
    // Flatten the failed call into its parent
    '		var left = this.callstack.length;' +
    '		if (left > 0) {' +
    '			if (this.callstack[left-1].calls === undefined) {' +
    '				this.callstack[left-1].calls = [];' +
    '			}' +
    '            this.previousCall = call;' +
    '			this.callstack[left-1].calls.push(call);' +
    '			return;' +
    '		}' +
    '       this.previousCall = call;' +
    // Last call failed too, leave it in the stack
    '		this.callstack.push(call);' +
    '	},';
const result = 
// result is invoked when all the opcodes have been iterated over and returns
// the final result of the tracing.
'	result: function(ctx, db) {' +
    '		var result = {};' +
    '		result.type = ctx.type;' +
    '		result.from = toHex(ctx.from);' +
    '		result.to = toHex(ctx.to);' +
    '		result.value = "0x" + ctx.value.toString(16);' +
    '		result.gas = "0x" + bigInt(ctx.gas).toString(16);' +
    '		result.gasUsed = "0x" + bigInt(ctx.gasUsed).toString(16);' +
    '		result.input = toHex(ctx.input);' +
    '		result.output = toHex(ctx.output);' +
    '		result.time = ctx.time;' +
    '		if (this.callstack[0].calls !== undefined) {' +
    '			result.calls = this.callstack[0].calls;' +
    '		}' +
    '		if (this.callstack[0].error !== undefined) {' +
    '			result.error = this.callstack[0].error;' +
    '		} else if (ctx.error !== undefined) {' +
    '			result.error = ctx.error;' +
    '		}' +
    '		if (result.error !== undefined && (result.error !== "execution reverted" || result.output ==="0x")) {' +
    '			delete result.output;' +
    '		}' +
    '		return this.finalize(result);' +
    '	},';
const finalize = 
// finalize recreates a call object using the final desired field oder for json
// serialization. This is a nicety feature to pass meaningfully ordered results
// to users who don't interpret it, just display it.
'	finalize: function(call) {' +
    '		var sorted = {};' +
    '		sorted.type = call.type;' +
    '		sorted.from = call.from;' +
    '		sorted.to = call.to;' +
    '		sorted.value = call.value;' +
    '		sorted.gas = call.gas;' +
    '		sorted.gasUsed = call.gasUsed;' +
    '		sorted.input = call.input;' +
    '		sorted.output = call.output;' +
    '		sorted.error = call.error;' +
    '		sorted.time = call.time;' +
    '		sorted.logs = call.logs;' +
    '		sorted.calls = call.calls;' +
    '		for (var key in sorted) {' +
    '			if (sorted[key] === undefined) {' +
    '				delete sorted[key];' +
    '			}' +
    '		}' +
    '		if (sorted.calls !== undefined) {' +
    '			for (var i=0; i<sorted.calls.length; i++) {' +
    '				sorted.calls[i] = this.finalize(sorted.calls[i]);' +
    '			}' +
    '		}' +
    '		return sorted;' +
    '	},';
const fullTracer = '{' +
    // callstack is the current recursive call stack of the EVM execution.
    '	callstack: [{}],' +
    // descended tracks whether we've just descended from an outer transaction into
    // an inner call.
    '	descended: false,' +
    '	logIndex: 0,' +
    '	logsNoCall: [],' +
    '	previousCall: null,' +
    step +
    fault +
    result +
    finalize +
    '}';
exports.tracer = fullTracer;
//# sourceMappingURL=gethCustomTracer.js.map