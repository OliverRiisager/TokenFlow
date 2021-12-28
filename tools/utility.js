
const BigNumber = require('bignumber.js');


function getValue(value, decimals, cutOff = false) {
	if(!decimals){
		return new BigNumber(value).toString();
	}
	let s = "1e" + decimals;
	let x = new BigNumber(value);
	let temp =  BigNumber(x.div(s));
	if(cutOff){
		temp = BigNumber(temp.toFixed(3));
	}
	return temp.toNumber();
}

module.exports = {
    getValue
}