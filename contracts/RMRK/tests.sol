pragma solidity ^0.8.15;

contract test_storage_size {
    struct RMRKOwner {
        uint256 tokenId;
        address ownerAddress;
        bool isNft;
    }

    struct Child {
        uint256 tokenId;
        address contractAddress;
    }

    // Mapping from token ID to RMRKOwner struct
    mapping(uint256 => RMRKOwner) internal _RMRKOwners;

    // Mapping of tokenId to array of active children structs
    mapping(uint256 => Child[]) internal _children;

    // Mapping of tokenId to childAddress to child tokenId to child position in children array
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public childPosInArray;

    // Mapping of tokenId to array of pending children structs
    mapping(uint256 => Child[]) internal _pendingChildren;

    // Mapping of tokenId to childAddress to child tokenId to child position in children array
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public PendingChildPosInArray;
}

contract test_storage_struct_size {

    struct RMRKOwner {
        uint256 tokenId;
        address ownerAddress;
        bool isNft;
    }

    struct Child {
        uint256 tokenId;
        address contractAddress;
    }

    struct TokenData {
        RMRKOwner owner;
        Child[] children;
        Child[] pendingChildren;
        mapping(address => mapping(uint256 => uint256)) childPosInArray;
        mapping(address => mapping(uint256 => uint256)) pendingChildPosInArray;
    }

    mapping(uint256 => TokenData) public tokenData;

}
