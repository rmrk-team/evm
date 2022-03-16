// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

interface IRMRKCore_vuln {
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function rmrkOwnerOf(uint256 tokenId)
        external
        view
        returns (
            address,
            uint256,
            bool
        );

    function setChild(
        IRMRKCore_vuln childAddress,
        uint256 tokenId,
        uint256 childTokenId
    ) external;

    function isApprovedOrOwner(address addr, uint256 id)
        external
        view
        returns (bool);

    function _burnChildren(uint256 tokenId, address oldOwner) external;

    function isRMRKCore(
        address,
        address,
        uint256,
        bytes calldata
    ) external returns (bytes4);

    /**
     * @dev Returns the token collection name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the token collection symbol.
     */
    function symbol() external view returns (string memory);

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(
            address(this).balance >= amount,
            "Address: insufficient balance"
        );

        (bool success, ) = recipient.call{value: amount}("");
        require(
            success,
            "Address: unable to send value, recipient may have reverted"
        );
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data)
        internal
        returns (bytes memory)
    {
        return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return
            functionCallWithValue(
                target,
                data,
                value,
                "Address: low-level call with value failed"
            );
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(
            address(this).balance >= value,
            "Address: insufficient balance for call"
        );
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(
            data
        );
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data)
        internal
        view
        returns (bytes memory)
    {
        return
            functionStaticCall(
                target,
                data,
                "Address: low-level static call failed"
            );
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data)
        internal
        returns (bytes memory)
    {
        return
            functionDelegateCall(
                target,
                data,
                "Address: low-level delegate call failed"
            );
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

contract RMRKCore_vuln is Context, IRMRKCore_vuln {
    using Address for address;

    struct Child {
        address contractAddress;
        uint256 tokenId;
        uint16 slotEquipped;
        bytes8 partId;
    }

    struct RMRKOwner {
        address ownerAddress;
        uint256 tokenId;
        bool isNft;
    }

    string private _name;

    string private _symbol;

    string private _tokenURI;

    mapping(address => uint256) private _balances;

    mapping(uint256 => address) private _tokenApprovals;

    mapping(uint256 => RMRKOwner) private _RMRKOwners;

    mapping(uint256 => Child[]) private _children;

    mapping(uint256 => Child[]) private _pendingChildren;

    //Resource events
    event ResourceAdded(uint256 indexed tokenId, bytes32 indexed uuid);
    event ResourceAccepted(uint256 indexed tokenId, bytes32 indexed uuid);
    event ResourcePrioritySet(uint256 indexed tokenId);

    //Nesting events
    event childRemoved(uint256 index, uint256 tokenId);
    event pendingChildRemoved(uint256 index, uint256 tokenId);

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /*
  TODOS:
  abstract "transfer caller is not owner nor approved" to modifier
  Isolate _transfer() branches in own functions
  Update functions that take address and use as interface to take interface instead
  double check (this) in setChild() call functions appropriately

  VULNERABILITY CHECK NOTES:
  External calls:
  ownerOf() during _transfer
  setChild() during _transfer()

  Vulnerabilities to test:
  Greif during _transfer via setChild reentry?

  EVENTUALLY:
  Create minimal contract that relies on on-chain libraries for gas savings
  */

    ////////////////////////////////////////
    //             PROVENANCE
    ////////////////////////////////////////

    /**
  @dev Returns the root owner of a RMRKCore NFT.
  */
    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        (address owner, uint256 ownerTokenId, bool isNft) = rmrkOwnerOf(
            tokenId
        );
        if (isNft) {
            owner = IRMRKCore_vuln(owner).ownerOf(ownerTokenId);
        }
        require(
            owner != address(0),
            "RMRKCore: owner query for nonexistent token"
        );
        return owner;
    }

    /**
  @dev Returns the immediate provenance data of the current RMRK NFT. In the event the NFT is owned
  * by a wallet, tokenId will be zero and isNft will be false. Otherwise, the returned data is the
  * contract address and tokenID of the owner NFT, as well as its isNft flag.
  */
    function rmrkOwnerOf(uint256 tokenId)
        public
        view
        virtual
        returns (
            address,
            uint256,
            bool
        )
    {
        RMRKOwner memory owner = _RMRKOwners[tokenId];
        return (owner.ownerAddress, owner.tokenId, owner.isNft);
    }

    /**
  @dev Returns balance of tokens owner by a given rootOwner.
  */

    function balanceOf(address owner) public view virtual returns (uint256) {
        require(
            owner != address(0),
            "RMRKCore: balance query for the zero address"
        );
        return _balances[owner];
    }

    /**
  @dev Returns name of NFT collection.
  */

    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
  @dev Returns symbol of NFT collection.
  */

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    ////////////////////////////////////////
    //          CHILD MANAGEMENT
    ////////////////////////////////////////

    /**
  @dev Returns all confirmed children
  */

    function childrenOf(uint256 parentTokenId)
        public
        view
        returns (Child[] memory)
    {
        Child[] memory children = _children[parentTokenId];
        return children;
    }

    /**
  @dev Returns all pending children
  */

    function pendingChildrenOf(uint256 parentTokenId)
        public
        view
        returns (Child[] memory)
    {
        Child[] memory pendingChildren = _pendingChildren[parentTokenId];
        return pendingChildren;
    }

    /**
  @dev Sends an instance of Child from the pending children array at index to children array for _tokenId.
  * Updates _emptyIndexes of tokenId to preserve ordering.
  */

    //CHECK: preload mappings into memory for gas savings
    function acceptChildFromPending(uint256 index, uint256 _tokenId) public {
        require(
            _pendingChildren[_tokenId].length < index,
            "RMRKcore: Pending child index out of range"
        );
        require(ownerOf(_tokenId) == _msgSender(), "RMRKcore: Bad owner");

        Child memory child_ = _pendingChildren[_tokenId][index];

        _removeItemByIndex(index, _pendingChildren[_tokenId]);
        _addChildToChildren(child_, _tokenId);
    }

    /**
  @dev Deletes all pending children.
  */

    function deleteAllPending(uint256 _tokenId) public {
        require(_msgSender() == ownerOf(_tokenId), "RMRKCore: Bad owner");
        delete (_pendingChildren[_tokenId]);
    }

    /**
  @dev Deletes a single child from the pending array by index.
  */

    function deleteChildFromPending(uint256 index, uint256 _tokenId) public {
        require(
            _pendingChildren[_tokenId].length < index,
            "RMRKcore: Pending child index out of range"
        );
        require(ownerOf(_tokenId) == _msgSender(), "RMRKcore: Bad owner");

        _removeItemByIndex(index, _pendingChildren[_tokenId]);
        emit pendingChildRemoved(index, _tokenId);
    }

    /**
  @dev Deletes a single child from the child array by index.
  */

    function deleteChildFromChildren(uint256 index, uint256 _tokenId) public {
        require(
            _pendingChildren[_tokenId].length < index,
            "RMRKcore: Pending child index out of range"
        );
        require(ownerOf(_tokenId) == _msgSender(), "RMRKcore: Bad owner");

        _removeItemByIndex(index, _children[_tokenId]);
        emit childRemoved(index, _tokenId);
    }

    /**
     * @dev Function designed to be used by other instances of RMRK-Core contracts to update children.
     * param1 childAddress is the address of the child contract as an IRMRKCore_vuln instance
     * param2 parentTokenId is the tokenId of the parent token on (this).
     * param3 childTokenId is the tokenId of the child instance
     */

    function setChild(
        IRMRKCore_vuln childAddress,
        uint256 parentTokenId,
        uint256 childTokenId
    ) public virtual {
        (address parent, uint256 tokenId, ) = childAddress.rmrkOwnerOf(
            childTokenId
        );
        require(parent == address(this), "Parent-child mismatch");
        if (
            _isApprovedOrOwner(tx.origin, parentTokenId) ||
            childAddress.ownerOf(childTokenId) == ownerOf(parentTokenId)
        ) {
            Child memory child = Child({
                contractAddress: address(childAddress),
                tokenId: childTokenId,
                slotEquipped: 0,
                partId: 0
            });
            _addChildToChildren(child, parentTokenId);
        } else {
            Child memory child = Child({
                contractAddress: address(childAddress),
                tokenId: childTokenId,
                slotEquipped: 0,
                partId: 0
            });
            _addChildToPending(child, parentTokenId);
        }
    }

    /**
  @dev Adds an instance of Child to the pending children array for _tokenId.
  */

    function _addChildToPending(Child memory _child, uint256 _tokenId)
        internal
    {
        _pendingChildren[_tokenId].push(_child);
    }

    /**
  @dev Adds an instance of Child to the children array for _tokenId.
  */

    function _addChildToChildren(Child memory _child, uint256 _tokenId)
        internal
    {
        _children[_tokenId].push(_child);
    }

    ////////////////////////////////////////
    //              MINTING
    ////////////////////////////////////////

    /**
  @dev Mints an NFT.
  * Can mint to a root owner or another NFT.
  * Overloaded function _mint() can be used either to minto into a root owner or another NFT.
  * If isNft contains any non-empty data, _mintToNft will be called and pass the extra data
  * package to the function.
  */

    function _mint(address to, uint256 tokenId) internal virtual {
        _mint(to, tokenId, 0, "");
    }

    function _mint(
        address to,
        uint256 tokenId,
        uint256 destinationId,
        bytes memory data
    ) internal virtual {
        if (data.length > 0) {
            _mintToNft(to, tokenId, destinationId, data);
        } else {
            _mintToRootOwner(to, tokenId);
        }
    }

    function _mintToNft(
        address to,
        uint256 tokenId,
        uint256 destinationId,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "RMRKCore: mint to the zero address");
        require(!_exists(tokenId), "RMRKCore: token already minted");
        require(to.isContract(), "RMRKCore: Is not contract");
        require(
            _checkRMRKCoreImplementer(_msgSender(), to, tokenId, ""),
            "RMRKCore: Mint to non-RMRKCore implementer"
        );

        IRMRKCore_vuln destContract = IRMRKCore_vuln(to);

        _beforeTokenTransfer(address(0), to, tokenId);

        address rootOwner = destContract.ownerOf(destinationId);
        _balances[rootOwner] += 1;

        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: true
        });

        destContract.setChild(this, destinationId, tokenId);

        emit Transfer(address(0), to, tokenId);

        _afterTokenTransfer(address(0), to, tokenId);
    }

    function _mintToRootOwner(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "RMRKCore: mint to the zero address");
        require(!_exists(tokenId), "RMRKCore: token already minted");

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

    function _burn(uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "RMRKCore: burn caller is not owner nor approved"
        );
        _beforeTokenTransfer(owner, address(0), tokenId);

        // Clear approvals
        _approve(address(0), tokenId);

        _balances[owner] -= 1;

        Child[] memory children = childrenOf(tokenId);

        uint256 length = children.length; //gas savings
        for (uint256 i; i < length; i = u_inc(i)) {
            IRMRKCore_vuln(children[i].contractAddress)._burnChildren(
                children[i].tokenId,
                owner
            );
        }

        delete _RMRKOwners[tokenId];
        emit Transfer(owner, address(0), tokenId);

        _afterTokenTransfer(owner, address(0), tokenId);
    }

    //how could devs allow something like this, smh
    //Checks that caller is current RMRKOnwerOf contract
    //Updates rootOwner balance
    //recursively calls _burnChildren on all children
    function _burnChildren(uint256 tokenId, address oldOwner) public virtual {
        (address _RMRKOwner, , ) = rmrkOwnerOf(tokenId);
        require(_RMRKOwner == _msgSender(), "Caller is not RMRKOwner contract");
        _balances[oldOwner] -= 1;

        Child[] memory children = childrenOf(tokenId);

        uint256 length = children.length; //gas savings
        for (uint256 i; i < length; i = u_inc(i)) {
            address childContractAddress = children[i].contractAddress;
            uint256 childTokenId = children[i].tokenId;

            IRMRKCore_vuln(childContractAddress)._burnChildren(
                childTokenId,
                oldOwner
            );
        }
        delete _RMRKOwners[tokenId];
        //This can emit a lot of events.
        emit Transfer(oldOwner, address(0), tokenId);
    }

    ////////////////////////////////////////
    //             TRANSFERS
    ////////////////////////////////////////

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transfer(address to, uint256 tokenId) public virtual {
        transferFrom(msg.sender, to, tokenId, 0, new bytes(0));
    }

    /**
     * @dev
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId,
        bytes memory data
    ) public virtual {
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "RMRKCore: transfer caller is not owner nor approved"
        );
        _transfer(from, to, tokenId, destinationId, data);
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
        uint256 destinationId,
        bytes memory data
    ) internal virtual {
        require(
            ownerOf(tokenId) == from,
            "RMRKCore: transfer from incorrect owner"
        );
        require(to != address(0), "RMRKCore: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId);

        _balances[from] -= 1;
        bool isNft = false;

        if (data.length == 0) {
            _balances[to] += 1;
        } else {
            require(
                _checkRMRKCoreImplementer(address(0), to, tokenId, data),
                "not RMRKCore"
            );
            IRMRKCore_vuln destContract = IRMRKCore_vuln(to);
            address rootOwner = destContract.ownerOf(destinationId);
            _balances[rootOwner] += 1;
            destContract.setChild(this, destinationId, tokenId);
            isNft = true;
        }
        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: isNft
        });
        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        emit Transfer(from, to, tokenId);

        _afterTokenTransfer(from, to, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

    /**
  * @dev Hook that is called after any transfer of tokens. This includes
  * minting and burning.    address owner = this.ownerOf(tokenId);
    return (spender == owner || getApproved(tokenId) == spender);
  *
  * Calling conditions:
  *
  * - when `from` and `to` are both non-zero.
  * - `from` and `to` are never both zero.
  *
  * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
  */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

    ////////////////////////////////////////
    //      APPROVALS / PRE-CHECKING
    ////////////////////////////////////////

    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _RMRKOwners[tokenId].ownerAddress != address(0);
    }

    function approve(address to, uint256 tokenId) public virtual {
        address owner = this.ownerOf(tokenId);
        require(to != owner, "RMRKCore: approval to current owner");

        require(_msgSender() == owner, "RMRKCore: approve caller is not owner");

        _approve(to, tokenId);
    }

    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function isApprovedOrOwner(address spender, uint256 tokenId)
        external
        view
        virtual
        returns (bool)
    {
        return _isApprovedOrOwner(spender, tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        address owner = this.ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender);
    }

    function getApproved(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        require(
            _exists(tokenId),
            "RMRKCore: approved query for nonexistent token"
        );

        return _tokenApprovals[tokenId];
    }

    ////////////////////////////////////////
    //           SELF-AWARENESS
    ////////////////////////////////////////
    // I'm afraid I can't do that, Dave.

    function _checkRMRKCoreImplementer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) private returns (bool) {
        if (to.isContract()) {
            try
                IRMRKCore_vuln(to).isRMRKCore(
                    _msgSender(),
                    from,
                    tokenId,
                    _data
                )
            returns (bytes4 retval) {
                return retval == IRMRKCore_vuln.isRMRKCore.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("RMRKCore: transfer to non RMRKCore implementer");
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

    //This is not 100% secure -- a bytes4 function signature is replicable via brute force attacks.
    function isRMRKCore(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return IRMRKCore_vuln.isRMRKCore.selector;
    }

    ////////////////////////////////////////
    //              HELPERS
    ////////////////////////////////////////

    function _removeItemByValue(bytes16 value, bytes16[] storage array)
        internal
    {
        bytes16[] memory memArr = array; //Copy array to memory, check for gas savings here
        uint256 length = memArr.length; //gas savings
        for (uint256 i; i < length; i = u_inc(i)) {
            if (memArr[i] == value) {
                _removeItemByIndex(i, array);
                break;
            }
        }
    }

    // For child storage array
    function _removeItemByIndex(uint256 index, Child[] storage array) internal {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length - 1];
        array.pop();
    }

    //For reasource storage array
    function _removeItemByIndex(uint256 index, bytes16[] storage array)
        internal
    {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length - 1];
        array.pop();
    }

    function _removeItemByIndexMulti(
        uint256[] memory indexes,
        Child[] storage array
    ) internal {
        uint256 length = indexes.length; //gas savings
        for (uint256 i; i < length; i = u_inc(i)) {
            _removeItemByIndex(indexes[i], array);
        }
    }

    //Gas saving iterator, consider conversion to assemby
    function u_inc(uint256 i) private pure returns (uint256) {
        unchecked {
            return i + 1;
        }
    }
}
