// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../interfaces/IRMRKNesting.sol";
import "../library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

error RMRKCallerIsNotOwnerContract();
error RMRKChildIndexOutOfRange();
error RMRKInvalidTokenID();
error RMRKIsNotContract();
error RMRKMaxPendingChildrenReached();
error RMRKMintToNonRMRKImplementer();
error RMRKMustUnnestFirst();
error RMRKNestingTransferToNonRMRKNestingImplementer();
error RMRKOwnerQueryForNonexistentToken();
error RMRKParentChildMismatch();
error RMRKPendingChildIndexOutOfRange();
error RMRKUnnestForNonexistentToken();
error RMRKUnnestForNonNftParent();
error RMRKUnnestFromWrongOwner();
error RMRKUnnestFromWrongParent();

abstract contract NestingAbstract is Context, IRMRKNesting {

    using RMRKLib for uint256;
    using Address for address;
    using Strings for uint256;

    struct RMRKOwner {
        uint256 tokenId;
        address ownerAddress;
        bool isNft;
    }

    // Mapping from token ID to RMRKOwner struct
    mapping(uint256 => RMRKOwner) internal _RMRKOwners;

    // Mapping of tokenId to array of active children structs
    mapping(uint256 => Child[]) internal _children;

    // Mapping of tokenId to array of pending children structs
    mapping(uint256 => Child[]) internal _pendingChildren;

    /**
    @dev Returns the root owner of a RMRK NFT.
    */
    function ownerOf(uint256 tokenId) public view virtual returns(address) {
        (address owner, uint256 ownerTokenId, bool isNft) = rmrkOwnerOf(tokenId);
        if (isNft) {
            owner = IRMRKNesting(owner).ownerOf(ownerTokenId);
        }
        if(owner == address(0))
            revert RMRKOwnerQueryForNonexistentToken();
        return owner;
    }

    /**
    @dev Returns the immediate provenance data of the current RMRK NFT. In the event the NFT is owned
    * by a wallet, tokenId will be zero and isNft will be false. Otherwise, the returned data is the
    * contract address and tokenID of the owner NFT, as well as its isNft flag.
    */
    function rmrkOwnerOf(uint256 tokenId) public view virtual returns (address, uint256, bool) {
        RMRKOwner memory owner = _RMRKOwners[tokenId];
        if(owner.ownerAddress == address(0)) revert RMRKOwnerQueryForNonexistentToken();

        return (owner.ownerAddress, owner.tokenId, owner.isNft);
    }

    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        //TODO: Discuss removing this check
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    /**
    * @dev Reverts if the `tokenId` has not been minted yet.
    */
    function _requireMinted(uint256 tokenId) internal view virtual {
        if(!_exists(tokenId))
            revert RMRKInvalidTokenID();
    }

    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _RMRKOwners[tokenId].ownerAddress != address(0);
    }


    /**
    * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
    * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
    * by default, can be overridden in child contracts.
    */
    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }


    ////////////////////////////////////////
    //          CHILD MANAGEMENT
    ////////////////////////////////////////

    /**
     * @dev Function designed to be used by other instances of RMRK-Core contracts to update children.
     * param1 parentTokenId is the tokenId of the parent token on (this).
     * param2 childTokenId is the tokenId of the child instance
     * param3 childAddress is the address of the child contract as an IRMRK instance
     */

    //update for reentrancy
    function addChild(
        uint256 parentTokenId,
        uint256 childTokenId,
        address childTokenAddress
    ) public virtual {
        IRMRKNesting childTokenContract = IRMRKNesting(childTokenAddress);
        (address parent, , ) = childTokenContract.rmrkOwnerOf(childTokenId);
        if(parent != address(this))
            revert RMRKParentChildMismatch();

        Child memory child = Child({
            contractAddress: childTokenAddress,
            tokenId: childTokenId
        });
        _addChildToPending(parentTokenId, child);
        emit ChildProposed(parentTokenId);
    }

    /**
    @dev Sends an instance of Child from the pending children array at index to children array for tokenId.
    * Updates _emptyIndexes of tokenId to preserve ordering.
    */

    //CHECK: preload mappings into memory for gas savings
    function _acceptChild(uint256 tokenId, uint256 index) public virtual {
        if(_pendingChildren[tokenId].length <= index)
            revert RMRKPendingChildIndexOutOfRange();

        // FIXME: if it approved for transfer it should either update/remove the approvedTransfers or stop this accept.

        Child memory child_ = _pendingChildren[tokenId][index];

        removeItemByIndex_C(_pendingChildren[tokenId], index);

        _addChildToChildren(tokenId, child_);
        emit ChildAccepted(tokenId);
    }

    /**
    @dev Deletes all pending children.
    */
    function _rejectAllChildren(uint256 tokenId) public virtual {
        delete(_pendingChildren[tokenId]);
        emit AllPendingChildrenRemoved(tokenId);
    }

    /**
    @dev Deletes a single child from the pending array by index.
    */

    function _rejectChild(uint256 tokenId, uint256 index) public virtual {
        if(_pendingChildren[tokenId].length <= index)
            revert RMRKPendingChildIndexOutOfRange();

        removeItemByIndex_C(_pendingChildren[tokenId], index);
        emit PendingChildRemoved(tokenId, index);
    }

    /**
    @dev Deletes a single child from the child array by index.
    */

    function _removeChild(uint256 tokenId, uint256 index) public virtual {
        if(_children[tokenId].length <= index)
            revert RMRKChildIndexOutOfRange();

        removeItemByIndex_C(_children[tokenId], index);
        emit ChildRemoved(tokenId, index);
    }

    function _unnestChild(uint256 tokenId, uint256 index) public virtual {
        if(_children[tokenId].length <= index)
            revert RMRKChildIndexOutOfRange();
        Child memory child = _children[tokenId][index];
        removeItemByIndex_C(_children[tokenId], index);
        IRMRKNesting(child.contractAddress).unnestToken(child.tokenId, tokenId);
        emit ChildUnnested(tokenId, child.tokenId);
    }

    function unnestToken(uint256 tokenId, uint256 parentId) public virtual {
      // A malicious contract which is parent to this token, could unnest any children
        RMRKOwner memory owner = _RMRKOwners[tokenId];

        if(owner.ownerAddress == address(0))
            revert RMRKUnnestForNonexistentToken();
        if(!owner.isNft)
            revert RMRKUnnestForNonNftParent();
        if(owner.tokenId != parentId)
            revert RMRKUnnestFromWrongParent();
        if(owner.ownerAddress != _msgSender())
            revert RMRKUnnestFromWrongOwner();

        address rootOwner =  IRMRKNesting(owner.ownerAddress).ownerOf(owner.tokenId);
        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: rootOwner,
            tokenId: 0,
            isNft: false
        });
    }

    /**
    @dev Adds an instance of Child to the pending children array for tokenId. This is hardcoded to be 128 by default.
    */
    function _addChildToPending(uint256 tokenId, Child memory child) internal {
        if(_pendingChildren[tokenId].length < 128) {
            _pendingChildren[tokenId].push(child);
        } else {
            revert RMRKMaxPendingChildrenReached();
        }
    }

    /**
    @dev Adds an instance of Child to the children array for tokenId.
    */

    function _addChildToChildren(uint256 tokenId, Child memory child) internal {
        _children[tokenId].push(child);
    }

    /**
    @dev Returns all confirmed children
    */

    function childrenOf(uint256 parentTokenId) public view returns (Child[] memory) {
        Child[] memory children = _children[parentTokenId];
        return children;
    }

    /**
    @dev Returns all pending children
    */

    function pendingChildrenOf(uint256 parentTokenId) public view returns (Child[] memory) {
        Child[] memory pendingChildren = _pendingChildren[parentTokenId];
        return pendingChildren;
    }

    function childOf(
        uint256 parentTokenId,
        uint256 index
    ) external view returns (Child memory) {
        // FIXME: Check index
        Child memory child = _pendingChildren[parentTokenId][index];
        return child;
    }

    function pendingChildOf(
        uint256 parentTokenId,
        uint256 index
    ) external view returns (Child memory) {
        // FIXME: Check index
        Child memory child = _pendingChildren[parentTokenId][index];
        return child;
    }

    //HELPERS

    // For child storage array
    function removeItemByIndex_C(Child[] storage array, uint256 index) internal {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length-1];
        array.pop();
    }
}
