// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./abstracts/ERC721Abstract.sol";
import "./abstracts/NestingAbstract.sol";
import "./interfaces/IRMRKNesting.sol";
import "./interfaces/IRMRKNestingReceiver.sol";
import "./library/RMRKLib.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Context.sol";
// import "hardhat/console.sol";

contract RMRKNesting is ERC721Abstract, NestingAbstract {

    using RMRKLib for uint256;
    using Address for address;

    constructor(string memory name_, string memory symbol_) ERC721Abstract(name_, symbol_) {}

    function ownerOf(uint256 tokenId) public view override(ERC721Abstract, NestingAbstract) virtual returns(address) {
        return super.ownerOf(tokenId);
    }

    function _exists(uint256 tokenId) internal view override(ERC721Abstract, NestingAbstract) virtual returns (bool) {
        return super._exists(tokenId);
    }


    /**
    @dev Mints an NFT.
    * Can mint to a root owner or another NFT.
    * Overloaded function _mint() can be used either to minto into a root owner or another NFT.
    * If isNft contains any non-empty data, _mintToNft will be called and pass the extra data
    * package to the function.
    */

    function _mint(address to, uint256 tokenId) internal override virtual {
        _mint(to, tokenId, 0, "");
    }

    function _mint(address to, uint256 tokenId, uint256 destinationId, bytes memory data) internal virtual {
        // FIXME: We could use the isRMRK function here to decide instead
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
        if(!_checkRMRKNestingImplementer(_msgSender(), to, tokenId, ""))
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
    ) internal override(ERC721Abstract) virtual {
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

    function supportsInterface(bytes4 interfaceId) public override(ERC721Abstract) virtual view returns (bool) {
        return (
            interfaceId == type(IRMRKNesting).interfaceId ||
            super.supportsInterface(interfaceId)
        );
    }

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

    function unnestFromParent(uint256 tokenId, uint256 indexOnParent) public virtual onlyApprovedOrOwner(tokenId) {
        _unnestFromParent(tokenId, indexOnParent);
    }



}
