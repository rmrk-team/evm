import ethers, { Contract } from 'ethers';

export enum FacetCutAction {
  Add,
  Replace,
  Remove,
}

export type ExtendedStrings = string[] & {
  contract?: Contract;
  remove?: typeof remove;
  get?: typeof get;
};

interface Facet {
  facetAddress: string;
  action: FacetCutAction;
  functionSelectors: ExtendedStrings;
}

// get function selectors from ABI
export function getSelectors(contract: Contract) {
  const signatures = Object.keys(contract.interface.functions);
  const selectors: ExtendedStrings = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, [] as string[]);
  selectors.contract = contract;
  selectors.remove = remove;
  selectors.get = get;
  return selectors;
}

// get function selector from function signature
export function getSelector(func: string) {
  const abiInterface = new ethers.utils.Interface([func]);
  return abiInterface.getSighash(ethers.utils.Fragment.from(func));
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures
export function remove(this: ExtendedStrings, functionNames: string[]) {
  const selectors: ExtendedStrings = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === this.contract!.interface.getSighash(functionName)) {
        return false;
      }
    }
    return true;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
export function get(this: ExtendedStrings, functionNames: string[]) {
  const selectors: ExtendedStrings = this.filter((v) => {
    for (const functionName of functionNames) {
      try {
        if (v === this.contract!.interface.getSighash(functionName)) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// remove selectors using an array of signatures
export function removeSelectors(selectors: string[], signatures: string[]) {
  const iface = new ethers.utils.Interface(signatures.map((v) => 'function ' + v));
  const removeSelectors = signatures.map((v) => iface.getSighash(v));
  selectors = selectors.filter((v) => !removeSelectors.includes(v));
  return selectors;
}

// find a particular address position in the return value of diamondLoupeFacet.facets()
export function findAddressPositionInFacets(facetAddress: string, facets: Facet[]) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i;
    }
  }
}
