// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./interfaces/IRMRKNesting.sol";
import "./interfaces/IRMRKNestingReceiver.sol";
import "./library/RMRKLib.sol";
import "./standard/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Context.sol";
// import "hardhat/console.sol";

error RMRKCallerIsNotOwnerContract();
error RMRKChildIndexOutOfRange();
error RMRKIsNotContract();
error RMRKMaxPendingChildrenReached();
error RMRKMintToNonRMRKImplementer();
error RMRKMustUnnestFirst();
error RMRKNestingTransferToNonRMRKNestingImplementer();
error RMRKParentChildMismatch();
error RMRKPendingChildIndexOutOfRange();
error RMRKUnnestChildIdMismatch();
error RMRKUnnestForNonexistentToken();
error RMRKUnnestForNonNftParent();
error RMRKUnnestFromWrongChild();

contract RMRKNesting is ERC721, IRMRKNesting {

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

    // Mapping of tokenId to 
    // mapping(uint256 => mapping())

    // Mapping of tokenId to array of pending children structs
    mapping(uint256 => Child[]) internal _pendingChildren;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}


    ////////////////////////////////////////
    //              Ownership
    ////////////////////////////////////////

    function ownerOf(uint tokenId) public override(IRMRKNesting, ERC721) virtual view returns (address) {
        (address owner, uint256 ownerTokenId, bool isNft) = rmrkOwnerOf(tokenId);
        if (isNft) {
            owner = IRMRKNesting(owner).ownerOf(ownerTokenId);
        }
        if(owner == address(0))
            revert ERC721InvalidTokenId();
        return owner;
    }

    /**
    @dev Returns the immediate provenance data of the current RMRK NFT. In the event the NFT is owned
    * by a wallet, tokenId will be zero and isNft will be false. Otherwise, the returned data is the
    * contract address and tokenID of the owner NFT, as well as its isNft flag.
    */
    function rmrkOwnerOf(uint256 tokenId) public view virtual returns (address, uint256, bool) {
        RMRKOwner memory owner = _RMRKOwners[tokenId];
        if(owner.ownerAddress == address(0)) revert ERC721InvalidTokenId();

        return (owner.ownerAddress, owner.tokenId, owner.isNft);
    }

    function _exists(uint256 tokenId) internal view virtual override returns (bool) {
        return _RMRKOwners[tokenId].ownerAddress != address(0);
    }

    ////////////////////////////////////////
    //              MINTING
    ////////////////////////////////////////

    function _mint(address to, uint256 tokenId) internal override virtual {
        if(to == address(0)) revert ERC721MintToTheZeroAddress();
        if(_exists(tokenId)) revert ERC721TokenAlreadyMinted();

        _beforeTokenTransfer(address(0), to, tokenId);

        _balances[to] += 1;
        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: 0,
            isNft: false
        });

        emit Transfer(address(0), to, tokenId);

        _afterTokenTransfer(address(0), to, tokenId);
    }

    function _mint(address to, uint256 tokenId, uint256 destinationId) internal virtual {
        if(to == address(0)) revert ERC721MintToTheZeroAddress();
        if(_exists(tokenId)) revert ERC721TokenAlreadyMinted();
        // It seems redundant, but otherwise it would revert with no error
        if(!to.isContract()) revert RMRKIsNotContract();
        if(!IERC165(to).supportsInterface(type(IRMRKNesting).interfaceId))
            revert RMRKMintToNonRMRKImplementer();

        _beforeTokenTransfer(address(0), to, tokenId);

        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: true
        });

        _sendToNFT(tokenId, destinationId, address(0), to);
    }

    function _safeMintNesting(address to, uint256 tokenId, uint256 destinationId) internal virtual {
        _safeMintNesting(to, tokenId, destinationId, "");
    }

    function _safeMintNesting(address to, uint256 tokenId, uint256 destinationId, bytes memory data) internal virtual {
        _mint(to, tokenId, destinationId);
        if (!_checkRMRKNestingImplementer(address(0), to, tokenId, data)) {
            revert RMRKMintToNonRMRKImplementer();
        }
    }

    function _sendToNFT(uint tokenId, uint destinationId, address from, address to) private {
        IRMRKNesting destContract = IRMRKNesting(to);
        address nextOwner = destContract.ownerOf(destinationId);
        _balances[nextOwner] += 1;
        destContract.addChild(destinationId, tokenId, address(this));

        emit Transfer(from, to, tokenId);
        _afterTokenTransfer(from, to, tokenId);
    }

    ////////////////////////////////////////
    //              BURNING
    ////////////////////////////////////////
    /**
    * @dev Destroys `tokenId`.
    * The approval is cleared when the token is burned.
    *
    * Requirements:
    *
    * - `tokenId` must exist.
    *
    * Emits a {Transfer} event.
    */

    //update for reentrancy
    function _burn(uint256 tokenId) internal override virtual {
        address owner = ownerOf(tokenId);
        _burnForOwner(tokenId, owner);
    }

    //update for reentrancy
    function burnFromParent(uint256 tokenId) external {
        (address _RMRKOwner, , ) = rmrkOwnerOf(tokenId);
        if(_RMRKOwner != _msgSender())
            revert RMRKCallerIsNotOwnerContract();
        address owner = ownerOf(tokenId);
        _burnForOwner(tokenId, owner);
    }

    function _burnForOwner(uint256 tokenId, address rootOwner) private {
        _beforeTokenTransfer(rootOwner, address(0), tokenId);
        _approve(address(0), tokenId);
        _cleanApprovals(address(0), tokenId);
        _balances[rootOwner] -= 1;

        Child[] memory children = childrenOf(tokenId);

        uint256 length = children.length; //gas savings
        for (uint i; i<length;){
            address childContractAddress = children[i].contractAddress;
            uint256 childTokenId = children[i].tokenId;
            IRMRKNesting(childContractAddress).burnFromParent(childTokenId);
            unchecked {++i;}
        }
        delete _RMRKOwners[tokenId];
        delete _pendingChildren[tokenId];
        delete _children[tokenId];
        delete _tokenApprovals[tokenId];

        _afterTokenTransfer(rootOwner, address(0), tokenId);
        emit Transfer(rootOwner, address(0), tokenId);
    }

    ////////////////////////////////////////
    //            TRANSFERING
    ////////////////////////////////////////

    function transfer(
        address to,
        uint256 tokenId
    ) public virtual {
        transferFrom(_msgSender(), to, tokenId);
    }

    function nestTransfer(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _transfer(_msgSender(), to, tokenId, destinationId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _transfer(from, to, tokenId, destinationId);
    }

    function safeTransferNestingFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _safeTransferNesting(from, to, tokenId, "");
    }

    function safeTransferNestingFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _safeTransferNesting(from, to, tokenId, data);
    }

    function _safeTransferNesting(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal virtual {
        _transfer(from, to, tokenId);
        if (!_checkRMRKNestingImplementer(from, to, tokenId, data))
            revert RMRKNestingTransferToNonRMRKNestingImplementer();
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override virtual {
        (address immediateOwner,,) = rmrkOwnerOf(tokenId);
        if (immediateOwner != from) revert ERC721TransferFromIncorrectOwner();
        if (to == address(0)) revert ERC721TransferToTheZeroAddress();

        _beforeTokenTransfer(from, to, tokenId);

        _balances[from] -= 1;
        _updateOwnerAndClearApprovals(tokenId, 0, to, false);
        _balances[to] += 1;

        emit Transfer(from, to, tokenId);
        _afterTokenTransfer(from, to, tokenId);
    }

    /**
    * @dev Transfers `tokenId` from `from` to `to`.
    *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
    *
    * Requirements:
    *
    * - `to` cannot be the zero address.
    * - `tokenId` token must be owned by `from`.
    *
    * Emits a {Transfer} event.
    */
    //Double check to make sure nested transfers update balanceOf correctly. Maybe add condition if rootOwner does not change for gas savings.
    //All children of transferred NFT should also have owner updated.
    function _transfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) internal virtual {
        (address immediateOwner,,) = rmrkOwnerOf(tokenId);
        if (immediateOwner != from) revert ERC721TransferFromIncorrectOwner();
        if(_RMRKOwners[tokenId].isNft) revert RMRKMustUnnestFirst();
        if(to == address(0)) revert ERC721TransferToTheZeroAddress();
        // Destination contract checks:
        // It seems redundant, but otherwise it would revert with no error
        if(!to.isContract()) revert RMRKIsNotContract();
        if(!IERC165(to).supportsInterface(type(IRMRKNesting).interfaceId))
            revert RMRKNestingTransferToNonRMRKNestingImplementer();

        _beforeTokenTransfer(from, to, tokenId);
        _balances[from] -= 1;

        _updateOwnerAndClearApprovals(tokenId, destinationId, to, true);

        // Sending to NFT:
        _sendToNFT(tokenId, destinationId, from, to);
    }

    function _updateOwnerAndClearApprovals(uint tokenId, uint destinationId, address to, bool isNft) internal {
        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: isNft
        });

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);
        _cleanApprovals(to, tokenId);
    }

    function _cleanApprovals(address owner, uint256 tokenId) internal virtual {}

    ////////////////////////////////////////
    //      CHILD MANAGEMENT INTERNAL
    ////////////////////////////////////////

    function _unnestChild(uint256 tokenId, uint256 index) internal virtual {
        removeItemByIndex_C(_children[tokenId], index);
        emit ChildUnnested(tokenId, index);
    }

    /**
    * @notice Adds an instance of Child to the pending children array for tokenId. This is hardcoded to be 128 by default.
    */
    function _addChildToPending(uint256 tokenId, Child memory child) internal {
        if(_pendingChildren[tokenId].length < 128) {
            _pendingChildren[tokenId].push(child);
        } else {
            revert RMRKMaxPendingChildrenReached();
        }
    }

    /**
    * @notice Adds an instance of Child to the children array for tokenId.
    */

    function _addChildToChildren(uint256 tokenId, Child memory child) internal {
        _children[tokenId].push(child);
    }

    ////////////////////////////////////////
    //      CHILD MANAGEMENT PUBLIC
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
        if (parent != address(this)) revert RMRKParentChildMismatch();

        Child memory child = Child({
            contractAddress: childTokenAddress,
            tokenId: childTokenId
        });
        _addChildToPending(parentTokenId, child);
        emit ChildProposed(parentTokenId);
    }

        /**
    * @notice Sends an instance of Child from the pending children array at index to children array for tokenId.
    * Updates _emptyIndexes of tokenId to preserve ordering.
    */

    // TODO low prio: preload mappings into memory for gas savings
    function acceptChild(uint256 tokenId, uint256 index) public virtual onlyApprovedOrOwner(tokenId) {
        if(_pendingChildren[tokenId].length <= index)
            revert RMRKPendingChildIndexOutOfRange();

        Child memory child_ = _pendingChildren[tokenId][index];

        removeItemByIndex_C(_pendingChildren[tokenId], index);

        _addChildToChildren(tokenId, child_);
        emit ChildAccepted(tokenId);
    }

    /**
    * @notice Deletes all pending children.
    * @dev This does not update the ownership storage data on children. If necessary, ownership
    * can be reclaimed by the rootOwner of the previous parent (this).
    */
    function rejectAllChildren(uint256 tokenId) public virtual onlyApprovedOrOwner(tokenId) {
        delete(_pendingChildren[tokenId]);
        emit AllPendingChildrenRemoved(tokenId);
    }

    /**
    * @notice Deletes a single child from the pending array by index.
    * @param tokenId tokenId whose pending child is to be rejected
    * @param index index on tokenId pending child array to reject
    * @param to if an address which is not the zero address is passed, this will attempt to transfer
    * the child to `to` via a call-in to the child address.
    * @dev If `to` is the zero address, the child's ownership structures will not be updated, resulting in an 
    * 'orphaned' child. If a call with a populated `to` field fails, call this function with `to` set to the 
    * zero address to orphan the child. Orphaned children can be reclaimed by a call to reclaimChild on this
    * contract by the root owner. 
    */

    function rejectChild(
        uint256 tokenId, 
        uint256 index, 
        address to
    ) public virtual onlyApprovedOrOwner(tokenId) {
        if(_pendingChildren[tokenId].length <= index)
            revert RMRKPendingChildIndexOutOfRange();

        Child memory pendingChild = _pendingChildren[tokenId][index];

        removeItemByIndex_C(_pendingChildren[tokenId], index);

        if (to != address(0)) {
            IRMRKNesting(pendingChild.contractAddress).transferAsChild(pendingChild.tokenId, to);
        }

        emit PendingChildRemoved(tokenId, index);
    }

    /**
    * @notice Deletes a single child from the child array by index.
    * @dev This is an emergency-style function used to forcibly remove a child from the active children
    * array, and should only be called in the event that a child is not removable via `unnestChild`.
    */

    function removeChild(uint256 tokenId, uint256 index) public virtual onlyApprovedOrOwner(tokenId) {
        if(_children[tokenId].length <= index)
            revert RMRKChildIndexOutOfRange();

        removeItemByIndex_C(_children[tokenId], index);
        emit ChildRemoved(tokenId, index);
    }

    /**
     * @notice Function to unnest a child from the active token array.
     * param1 parentTokenId is the tokenId of the parent token on (this).
     * param2 childTokenId is the tokenId of the child instance
     * param3 childAddress is the address of the child contract as an IRMRK instance
     */

    function unnestChild(
        uint256 tokenId,
        uint256 index, 
        address to
    ) public virtual onlyApprovedOrOwner(tokenId) {
        if (_children[tokenId].length <= index) revert RMRKChildIndexOutOfRange();

        Child memory child = _children[tokenId][index];

        if (child.contractAddress != _msgSender()) revert RMRKUnnestFromWrongChild();

        _unnestChild(tokenId, index);

        IRMRKNesting(child.contractAddress).transferAsChild(child.tokenId, to);
    }

    //TODO: Possibly have this delegate to safeTransferTo, bottom entry is too low-level
    function transferAsChild(
        uint256 tokenId, 
        address to
    ) public virtual {
        RMRKOwner memory owner = _RMRKOwners[tokenId];

        if(owner.ownerAddress != _msgSender()) revert ("FIXME: IMPLEMENT THIS ERROR");
        if(owner.ownerAddress == address(0)) revert RMRKUnnestForNonexistentToken();

        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: 0,
            isNft: false
        });
    }

    //FIXME implement
    function recliamChild() public {

    }


    ////////////////////////////////////////
    //      CHILD MANAGEMENT GETTERS
    ////////////////////////////////////////

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
        if(_children[parentTokenId].length <= index)
            revert RMRKChildIndexOutOfRange();
        Child memory child = _children[parentTokenId][index];
        return child;
    }

    function pendingChildOf(
        uint256 parentTokenId,
        uint256 index
    ) external view returns (Child memory) {
        if(_pendingChildren[parentTokenId].length <= index)
            revert RMRKPendingChildIndexOutOfRange();
        Child memory child = _pendingChildren[parentTokenId][index];
        return child;
    }

    ////////////////////////////////////////
    //           SELF-AWARENESS
    ////////////////////////////////////////
    // I'm afraid I can't do that, Dave.


    function _checkRMRKNestingImplementer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.isContract()) {
            try IRMRKNestingReceiver(to).onRMRKNestingReceived(_msgSender(), from, tokenId, data) returns (bytes4 retval) {
                return retval == IRMRKNestingReceiver.onRMRKNestingReceived.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    return false;
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    function supportsInterface(bytes4 interfaceId) public override(ERC721) virtual view returns (bool) {
        return (
            interfaceId == type(IRMRKNesting).interfaceId ||
            super.supportsInterface(interfaceId)
        );
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
