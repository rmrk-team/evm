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
error RMRKOwnerQueryForNonexistentToken();
error RMRKParentChildMismatch();
error RMRKPendingChildIndexOutOfRange();
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

    function _exists(uint256 tokenId) internal view virtual override returns (bool) {
        return _RMRKOwners[tokenId].ownerAddress != address(0);
    }

    ////////////////////////////////////////
    //              MINTING
    ////////////////////////////////////////

    function _mint(address to, uint256 tokenId) internal override virtual {
        _mint(to, tokenId, 0, "");
    }

    function _mint(address to, uint256 tokenId, uint256 destinationId, bytes memory data) internal virtual {
        // FIXME: We should check if the to implements an interface instead. I may want to use data and still mint to owner
        if (data.length > 0) {
            _mintToNft(to, tokenId, destinationId, data);
        }
        else{
            _mintToRootOwner(to, tokenId);
        }
    }

    function _mintToNft(address to, uint256 tokenId, uint256 destinationId, bytes memory data) internal virtual {
        if(to == address(0))
            revert ERC721MintToTheZeroAddress();
        if(_exists(tokenId))
            revert ERC721TokenAlreadyMinted();
        if(!to.isContract())
            revert RMRKIsNotContract();
        if(!_checkRMRKNestingImplementer(_msgSender(), to, tokenId, data))
            revert RMRKMintToNonRMRKImplementer();

        IRMRKNesting destContract = IRMRKNesting(to);

        _beforeTokenTransfer(address(0), to, tokenId);

        address rootOwner = destContract.ownerOf(destinationId);
        _balances[rootOwner] += 1;

        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: true
        });

        destContract.addChild(destinationId, tokenId, address(this));

        emit Transfer(address(0), to, tokenId);

        _afterTokenTransfer(address(0), to, tokenId);
    }

    function _mintToRootOwner(address to, uint256 tokenId) internal virtual {
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

    function transferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId,
        bytes memory data
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _transfer(from, to, tokenId, destinationId, data);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override onlyApprovedOrOwner(tokenId) {
        _safeTransfer(from, to, tokenId, 0, data);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId,
        bytes memory data
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _safeTransfer(from, to, tokenId, destinationId, data);
    }

    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId,
        bytes memory data
    ) internal virtual {
        _transfer(from, to, tokenId, destinationId, data);
        if(_checkRMRKNestingImplementer(from, to, tokenId, data) ||
            _checkOnERC721Received(from, to, tokenId, data))
            revert ERC721TransferToNonReceiverImplementer();
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721) virtual {
        _transfer(from, to, tokenId, 0, "");
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
    //Convert string to bytes in calldata for gas saving
    //Double check to make sure nested transfers update balanceOf correctly. Maybe add condition if rootOwner does not change for gas savings.
    //All children of transferred NFT should also have owner updated.
    function _transfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 toTokenId,
        bytes memory data
    ) internal virtual {
        if(ownerOf(tokenId) != from)
            revert ERC721TransferFromIncorrectOwner();
        if(to == address(0)) revert ERC721TransferToTheZeroAddress();

        _beforeTokenTransfer(from, to, tokenId);

        // FIXME: balances are not tested and probably broken
        _balances[from] -= 1;
        RMRKOwner memory rmrkOwner = _RMRKOwners[tokenId];
        if(rmrkOwner.isNft) revert RMRKMustUnnestFirst();
        bool destinationIsNft = _checkRMRKNestingImplementer(from, to, tokenId, data);

        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: toTokenId,
            isNft: destinationIsNft
        });

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        if(!destinationIsNft) {
            _balances[to] += 1;
        } else {
            // If destination is an NFT, we need to add the child to it
            IRMRKNesting destContract = IRMRKNesting(to);
            address nextOwner = destContract.ownerOf(toTokenId);
            _balances[nextOwner] += 1;

            destContract.addChild(toTokenId, tokenId, address(this));
        }
        emit Transfer(from, to, tokenId);
        _afterTokenTransfer(from, to, tokenId);
    }

    ////////////////////////////////////////
    //      CHILD MANAGEMENT INTERNAL
    ////////////////////////////////////////

    /**
    @dev Sends an instance of Child from the pending children array at index to children array for tokenId.
    * Updates _emptyIndexes of tokenId to preserve ordering.
    */

    //CHECK: preload mappings into memory for gas savings
    function _acceptChild(uint256 tokenId, uint256 index) internal virtual {
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
    function _rejectAllChildren(uint256 tokenId) internal virtual {
        delete(_pendingChildren[tokenId]);
        emit AllPendingChildrenRemoved(tokenId);
    }

    /**
    @dev Deletes a single child from the pending array by index.
    */

    function _rejectChild(uint256 tokenId, uint256 index) internal virtual {
        if(_pendingChildren[tokenId].length <= index)
            revert RMRKPendingChildIndexOutOfRange();

        removeItemByIndex_C(_pendingChildren[tokenId], index);
        emit PendingChildRemoved(tokenId, index);
    }

    /**
    @dev Deletes a single child from the child array by index.
    */

    function _removeChild(uint256 tokenId, uint256 index) internal virtual {
        if(_children[tokenId].length <= index)
            revert RMRKChildIndexOutOfRange();

        removeItemByIndex_C(_children[tokenId], index);
        emit ChildRemoved(tokenId, index);
    }

    function _unnestChild(uint256 tokenId, uint256 index) internal virtual {
        //TODO clean this up, check edge cases -- may never be entered
        if(_children[tokenId].length <= index)
            revert RMRKChildIndexOutOfRange();

        removeItemByIndex_C(_children[tokenId], index);
        emit ChildUnnested(tokenId, index);
    }

    //Child-scoped interaction
    function _unnestSelf(uint256 tokenId, uint256 indexOnParent) internal virtual {
      // A malicious contract which is parent to this token, could unnest any children
        RMRKOwner memory owner = _RMRKOwners[tokenId];

        if(owner.ownerAddress == address(0))
            revert RMRKUnnestForNonexistentToken();
        if(!owner.isNft)
            revert RMRKUnnestForNonNftParent();

        address rootOwner =  IRMRKNesting(owner.ownerAddress).ownerOf(owner.tokenId);
        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: rootOwner,
            tokenId: 0,
            isNft: false
        });
        IRMRKNesting(owner.ownerAddress).unnestChild(owner.tokenId, indexOnParent);
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
        if(parent != address(this))
            revert RMRKParentChildMismatch();

        Child memory child = Child({
            contractAddress: childTokenAddress,
            tokenId: childTokenId
        });
        _addChildToPending(parentTokenId, child);
        emit ChildProposed(parentTokenId);
    }

    // FIXME: Is it worth to have both public and internal versions?
    function acceptChild(uint256 tokenId, uint256 index) public virtual onlyApprovedOrOwner(tokenId) {
        _acceptChild(tokenId, index);
    }

    function rejectAllChildren(uint256 tokenId) public virtual onlyApprovedOrOwner(tokenId) {
        _rejectAllChildren(tokenId);
    }

    function rejectChild(uint256 tokenId, uint256 index) public virtual onlyApprovedOrOwner(tokenId) {
        _rejectChild(tokenId, index);
    }

    function removeChild(uint256 tokenId, uint256 index) public virtual onlyApprovedOrOwner(tokenId) {
        _removeChild(tokenId, index);
    }

    //Must be called from the child contract
    function unnestChild(uint256 tokenId, uint256 index) public virtual {
        Child memory child = _children[tokenId][index];
        if (child.contractAddress != _msgSender()) revert RMRKUnnestFromWrongChild();
        _unnestChild(tokenId, index);
    }

    function unnestSelf(uint256 tokenId, uint256 indexOnParent) public virtual onlyApprovedOrOwner(tokenId) {
        _unnestSelf(tokenId, indexOnParent);
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
        // FIXME: Add test, this was broken (looking into pending)
        Child memory child = _children[parentTokenId][index];
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
                    revert RMRKNestingTransferToNonRMRKNestingImplementer();
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return false;
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
