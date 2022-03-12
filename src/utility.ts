import BigNumber from 'bignumber.js';

export function getValue(
    value: BigNumber.Value,
    decimals: number,
    cutOff = false
): number {
    if (!decimals) {
        return new BigNumber(value).toNumber();
    }
    const s = '1e' + decimals;
    const x = new BigNumber(value);
    let temp = new BigNumber(x.div(s));
    if (cutOff) {
        temp = new BigNumber(temp.toFixed(3));
    }
    return temp.toNumber();
}
