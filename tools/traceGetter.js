async function getTrace(txhash, web3) {
    let gethTrace = await getGethTrace(web3, txhash);
    return gethTrace;
}

let logStuff = 
//LOG0 - 4
'   var logElement = {};'+
'   if (opcode == 0xA0 || opcode == 0xA1 || opcode == 0xA2 || opcode == 0xA3 || opcode == 0xA4) {' +
'     if(this.previousCall.logs === undefined){' +
'           this.previousCall.logs = [];' +
'     }' +
'     logElement.logIndex = this.logIndex;' +
'     this.previousCall.logs.push(logElement);' +
'     this.logIndex++;' +
'     return;'+
'   }';

let step = 
'	step: function(log, db) {'+
'		var error = log.getError();'+
'		if (error !== undefined) {'+
'			this.fault(log, db);'+
'			return;'+
'		}'+
'       var opcode = log.op.toNumber();'+
'		var syscall = (opcode & 0xf0) == 0xf0;'+
'		if (syscall) {'+
'			var op = log.op.toString();'+
'		}'+
        logStuff+
'		if (syscall && (opcode == 0xf0 || opcode == 0xf5)) {'+
'			var inOff = log.stack.peek(1).valueOf();'+
'			var inEnd = inOff + log.stack.peek(2).valueOf();'+

'			var call = {};'+
'			call.type = op;'+
'			call.from = toHex(log.contract.getAddress());'+
'			call.input = toHex(log.memory.slice(inOff, inEnd));'+
'			call.gasIn = log.getGas();'+
'			call.gasCost = log.getCost();'+
'			call.value = "0x" + log.stack.peek(0).toString(16);'+
'			this.callstack.push(call);'+
'           this.previousCall = call;'+
'			this.descended = true;'+
'			return;'+
'		}'+
'		if (syscall && opcode == 0xff) {'+
'			var left = this.callstack.length;'+
'			if (this.callstack[left-1].calls === undefined) {'+
'				this.callstack[left-1].calls = [];'+
'			}'+
'			var tmpObj = {};'+
'			tmpObj.type = op;'+
'			tmpObj.from = toHex(log.contract.getAddress());'+
'			tmpObj.to = toHex(toAddress(log.stack.peek(0).toString(16)));'+
'			tmpObj.gasIn = log.getGas();'+
'			tmpObj.gasCost = log.getCost();'+
'			tmpObj.value = "0x" + db.getBalance(log.contract.getAddress()).toString(16);'+
'			this.callstack[left-1].calls.push(tmpObj);'+
'			return;'+
'		}'+
        //CALL, CALLCODE, DELEGATECALL or STATICCALL
'		if (syscall && (opcode == 0xF1 || opcode == 0xF2 || opcode == 0xF4 || opcode == 0xFA)) {'+
'			var to = toAddress(log.stack.peek(1).toString(16));'+
'			if (isPrecompiled(to)) {'+
'				return;'+
'			}'+
            //DELGATECALL or STATICCALL
'			var off = (opcode == 0xF4 || opcode == 0xFA ? 0 : 1);'+

'			var inOff = log.stack.peek(2 + off).valueOf();'+
'			var inEnd = inOff + log.stack.peek(3 + off).valueOf();'+

'			var call = {};'+
'			call.type = op;'+
'			call.from = toHex(log.contract.getAddress());'+
'			call.to = toHex(to);'+
'			call.input = toHex(log.memory.slice(inOff, inEnd));'+
'			call.gasIn = log.getGas();'+
'			call.gasCost = log.getCost();'+
'			call.outOff = log.stack.peek(4 + off).valueOf();'+
'			call.outLen = log.stack.peek(5 + off).valueOf();'+
'			if (op != "DELEGATECALL" && op != "STATICCALL") {'+
'				call.value = "0x" + log.stack.peek(2).toString(16);'+
'			}'+
'			this.callstack.push(call);'+
'            this.previousCall = call;'+
'			this.descended = true;'+
'			return;'+
'		}'+
'		if (this.descended) {'+
'			if (log.getDepth() >= this.callstack.length) {'+
'				this.callstack[this.callstack.length - 1].gas = log.getGas();'+
'			} else {'+
'			}'+
'			this.descended = false;'+
'		}'+
'		if (syscall && opcode == 0xFD) {'+
'			this.callstack[this.callstack.length - 1].error = "execution reverted";'+
'			return;'+
'		}'+
'		if (log.getDepth() == this.callstack.length - 1) {'+
'			var call = this.callstack.pop();'+

'			if (call.type == "CREATE" || call.type == "CREATE2") {'+
'				call.gasUsed = "0x" + bigInt(call.gasIn - call.gasCost - log.getGas()).toString(16);'+
'				delete call.gasIn; delete call.gasCost;'+

'				var ret = log.stack.peek(0);'+
'				if (!ret.equals(0)) {'+
'					call.to     = toHex(toAddress(ret.toString(16)));'+
'					call.output = toHex(db.getCode(toAddress(ret.toString(16))));'+
'				} else if (call.error === undefined) {'+
'					call.error = "internal failure";'+
'				}'+
'			} else {'+
'				if (call.gas !== undefined) {'+
'					call.gasUsed = "0x" + bigInt(call.gasIn - call.gasCost + call.gas - log.getGas()).toString(16);'+
'				}'+
'				var ret = log.stack.peek(0);'+
'				if (!ret.equals(0)) {'+
'					call.output = toHex(log.memory.slice(call.outOff, call.outOff + call.outLen));'+
'				} else if (call.error === undefined) {'+
'					call.error = "internal failure";'+
'				}'+
'				delete call.gasIn; delete call.gasCost;'+
'				delete call.outOff; delete call.outLen;'+
'			}'+
'			if (call.gas !== undefined) {'+
'				call.gas = "0x" + bigInt(call.gas).toString(16);'+
'			}'+
'			var left = this.callstack.length;'+
'			if (this.callstack[left-1].calls === undefined) {'+
'				this.callstack[left-1].calls = [];'+
'			}'+
'			this.callstack[left-1].calls.push(call);'+
'            this.previousCall = call;'+
'		}'+
'	},';

let fault = 
'	fault: function(log, db) {'+
'		if (this.callstack[this.callstack.length - 1].error !== undefined) {'+
'			return;'+
'		}'+
'		var call = this.callstack.pop();'+
'		call.error = log.getError();'+
'		if (call.gas !== undefined) {'+
'			call.gas = "0x" + bigInt(call.gas).toString(16);'+
'			call.gasUsed = call.gas'+
'		}'+
'		delete call.gasIn; delete call.gasCost;'+
'		delete call.outOff; delete call.outLen;'+
'		var left = this.callstack.length;'+
'		if (left > 0) {'+
'			if (this.callstack[left-1].calls === undefined) {'+
'				this.callstack[left-1].calls = [];'+
'			}'+
'            this.previousCall = call;'+
'			this.callstack[left-1].calls.push(call);'+
'			return;'+
'		}'+
'        this.previousCall = call;'+
'		this.callstack.push(call);'+
'	},';

let result = 
'	result: function(ctx, db) {'+
'		var result = {};'+
'		result.type = ctx.type;'+
'		result.from = toHex(ctx.from);'+
'		result.to = toHex(ctx.to);'+
'		result.value = "0x" + ctx.value.toString(16);'+
'		result.gas = "0x" + bigInt(ctx.gas).toString(16);'+
'		result.gasUsed = "0x" + bigInt(ctx.gasUsed).toString(16);'+
'		result.input = toHex(ctx.input);'+
'		result.output = toHex(ctx.output);'+
'		result.time = ctx.time;'+
'		if (this.callstack[0].calls !== undefined) {'+
'			result.calls = this.callstack[0].calls;'+
'		}'+
'		if (this.callstack[0].error !== undefined) {'+
'			result.error = this.callstack[0].error;'+
'		} else if (ctx.error !== undefined) {'+
'			result.error = ctx.error;'+
'		}'+
'		if (result.error !== undefined && (result.error !== "execution reverted" || result.output ==="0x")) {'+
'			delete result.output;'+
'		}'+
'		return this.finalize(result);'+
'	},';
let finalize =
'	finalize: function(call) {'+
'		var sorted = {};'+
'		sorted.type = call.type;'+
'		sorted.from = call.from;'+
'		sorted.to = call.to;'+
'		sorted.value = call.value;'+
'		sorted.gas = call.gas;'+
'		sorted.gasUsed = call.gasUsed;'+
'		sorted.input = call.input;'+
'		sorted.output = call.output;'+
'		sorted.error = call.error;'+
'		sorted.time = call.time;'+
'		sorted.logs = call.logs;'+
'		sorted.calls = call.calls;'+
'		for (var key in sorted) {'+
'			if (sorted[key] === undefined) {'+
'				delete sorted[key];'+
'			}'+
'		}'+
'		if (sorted.calls !== undefined) {'+
'			for (var i=0; i<sorted.calls.length; i++) {'+
'				sorted.calls[i] = this.finalize(sorted.calls[i]);'+
'			}'+
'		}'+
'		return sorted;'+
'	},';

async function getGethTrace(web3, txhash) {
    try {
        let callObject = await web3.debug.traceTransaction(txhash, {reexec: 5000,  tracer:
            '{'+
            '	callstack: [{}],'+
            '	descended: false,'+
            '	logIndex: 0,'+
            '	previousCall: null,'+
                step+
                fault+
                result+
                finalize+
            '}'
        });
        let receipt = await web3.eth.getTransactionReceipt(txhash);
    return {callObject: callObject, receipt: receipt};
    } catch(e) {
        console.log('An error occured when getting Geth Trace ' + e);
        return null;
    }
}
module.exports = getTrace;