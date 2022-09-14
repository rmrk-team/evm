0. **TODO: Make sure that ALL CHILD APPROVALS are invalidated on parent token owner update** - Add another level to current mapping that checks for root owner

0. **TODO: Approved addresses cannot do operations if the parent state must also be updated.**

1. TODO: Check burnFromParent function for Reentrancy vulnerabilities
2. TODO: Check nestMint
3. TODO: Check nestTransfer
4. TODO: Check equip()
5. TODO: Check unequip()
6. TODO: Check unnestChild()
7. TODO: Check _isApprovedOrDirectOwner - sometimes accepts paramters that aren't
always used.
8. Check for cases in which address(this) could be passed as address argument