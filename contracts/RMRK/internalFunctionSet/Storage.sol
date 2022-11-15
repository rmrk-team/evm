// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IRMRKMultiResource.sol";
import "../interfaces/IRMRKNesting.sol";
import "../interfaces/ILightmEquippable.sol";

library ERC721Storage {
    struct State {
        // Token name
        string _name;
        // Token symbol
        string _symbol;
        // Mapping from token ID to owner address
        mapping(uint256 => address) _owners;
        // Mapping owner address to token count
        mapping(address => uint256) _balances;
        // Mapping from token ID to approved address
        mapping(uint256 => address) _tokenApprovals;
        // Mapping from owner to operator approvals
        mapping(address => mapping(address => bool)) _operatorApprovals;
    }

    bytes32 constant STORAGE_POSITION = keccak256("erc721.storage");

    function getState() internal pure returns (State storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}

library MultiResourceStorage {
    struct State {
        // Mapping of uint64 Ids to resource object
        mapping(uint64 => string) _resources;
        // Mapping of tokenId to new resource, to resource to be replaced
        mapping(uint256 => mapping(uint64 => uint64)) _resourceOverwrites;
        // Mapping of tokenId to all resources
        mapping(uint256 => uint64[]) _activeResources;
        // Mapping of tokenId to an array of resource priorities
        mapping(uint256 => uint16[]) _activeResourcePriorities;
        // Mapping of tokenId to resourceId to whether the token has this resource assigned
        mapping(uint256 => mapping(uint64 => bool)) _tokenResources;
        // Mapping of tokenId to an array of pending resources
        mapping(uint256 => uint64[]) _pendingResources;
        // Mapping of tokenId to resourceID to its position
        mapping(uint256 => mapping(uint64 => uint256)) _resourcesPosition;
        // Fallback URI
        string _fallbackURI;
        // Mapping from token ID to approved address for resources
        mapping(uint256 => address) _tokenApprovalsForResources;
        // Mapping from owner to operator approvals for resources
        mapping(address => mapping(address => bool)) _operatorApprovalsForResources;
    }

    bytes32 constant STORAGE_POSITION = keccak256("rmrk.multiresource.storage");

    function getState() internal pure returns (State storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}

library NestingStorage {
    struct State {
        // Mapping from token ID to RMRKOwner struct
        mapping(uint256 => IRMRKNesting.RMRKOwner) _RMRKOwners;
        // Mapping of tokenId to array of active children structs
        mapping(uint256 => IRMRKNesting.Child[]) _activeChildren;
        // Mapping of tokenId to array of pending children structs
        mapping(uint256 => IRMRKNesting.Child[]) _pendingChildren;
        // Mapping of childAddress to child tokenId to child position in children array
        mapping(address => mapping(uint256 => uint256)) _posInChildArray;
    }

    bytes32 constant STORAGE_POSITION = keccak256("rmrk.nesting.storage");

    function getState() internal pure returns (State storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}

library EquippableStorage {
    struct State {
        mapping(uint64 => ILightmEquippable.BaseRelatedData) _baseRelatedDatas;
        uint64[] _allBaseRelatedResourceIds;
        // tokenId => baseRelatedResourceId[]
        mapping(uint256 => uint64[]) _activeBaseRelatedResources;
        // tokenId => baseRelatedResourceId => index
        mapping(uint256 => mapping(uint64 => uint256)) _activeBaseRelatedResourcesPosition;
        ILightmEquippable.SlotEquipment[] _slotEquipments;
        // tokenId => baseRelatedResourceId => slotId => EquipmentPointer in _slotEquipments
        mapping(uint256 => mapping(uint64 => mapping(uint64 => ILightmEquippable.EquipmentPointer))) _equipmentPointers;
        // tokenId => baseRelatedResourceId => childContract => childTokenId => bool
        // to make sure that every base instance can only has one slot occupied by one child.
        // For example, you have a hat NFT which have 2 resources: 1st is for wearing on the head of human NFT,
        // 2nd is for holding on the hand of human NFT. You should never be able to let the human NFT
        // both wear and hold the hat NFT.
        mapping(uint256 => mapping(uint64 => mapping(address => mapping(uint256 => bool)))) _baseAlreadyEquippedChild;
        // records which slots are in the equipped state
        mapping(uint256 => mapping(uint64 => uint64[])) _equippedSlots;
        // childContract => childTokenId => childBaseRelatedResourceId => EquipmentPointer in _slotEquipments
        mapping(address => mapping(uint256 => mapping(uint64 => ILightmEquippable.EquipmentPointer))) _childEquipmentPointers;
        // records which childBaseRelatedResources are in the equipped state
        mapping(address => mapping(uint256 => uint64[])) _equippedChildBaseRelatedResources;
    }

    bytes32 constant STORAGE_POSITION = keccak256("lightm.equippable.storage");

    function getState() internal pure returns (State storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}

library CollectionMetadataStorage {
    struct State {
        string _collectionMetadata;
    }

    bytes32 constant STORAGE_POSITION =
        keccak256("rmrk.collection_metadata.storage");

    function getState() internal pure returns (State storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}

library LightmImplStorage {
    struct State {
        address _owner;
    }

    bytes32 constant STORAGE_POSITION = keccak256("lightm.impl.storage");

    function getState() internal pure returns (State storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
