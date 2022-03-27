import { ContractAddressToNames } from "../src";


describe('Adding getting and checking for elements in ContractAddressToNames', () => {
    
    let contractAddressToNames: ContractAddressToNames;
    beforeEach(() => {
        contractAddressToNames = new ContractAddressToNames();
    });
    it('Can add elements', () => {
        const contractTestAddress = 'test';
        expect(contractAddressToNames.getContractName(contractTestAddress)).toBe(undefined);
        expect(contractAddressToNames.addContractAddressToNamesMap(contractTestAddress, contractTestAddress)).toBe(true);
        expect(contractAddressToNames.hasContractAddress(contractTestAddress)).toBe(true);
    });
    it('Cannot add same element', () => {
        const contractTestAddress = 'test';
        expect(contractAddressToNames.getContractName(contractTestAddress)).toBe(undefined);
        expect(contractAddressToNames.addContractAddressToNamesMap(contractTestAddress, contractTestAddress)).toBe(true);
        expect(contractAddressToNames.addContractAddressToNamesMap(contractTestAddress, contractTestAddress)).toBe(false);
        expect(contractAddressToNames.hasContractAddress(contractTestAddress)).toBe(true);
    });
    it('returns true if element is contained', () => {
        const contractTestAddress = 'test';
        expect(contractAddressToNames.getContractName(contractTestAddress)).toBe(undefined);
        expect(contractAddressToNames.addContractAddressToNamesMap(contractTestAddress, contractTestAddress)).toBe(true);
        expect(contractAddressToNames.hasContractAddress(contractTestAddress)).toBe(true);
    });
})