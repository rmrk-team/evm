// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "../../library/RMRKErrors.sol";
import "./IRMRKTokenPropertiesRepository.sol";

/**
 * @title RMRKTokenPropertiesRepository
 * @author RMRK team
 * @notice Smart contract of the RMRK Token property repository module.
 */
contract RMRKTokenPropertiesRepository is IRMRKTokenPropertiesRepository {
    mapping(address => mapping(uint256 => AccessType))
        private _parameterAccessType;
    mapping(address => mapping(uint256 => address))
        private _parameterSpecificAddress;
    mapping(address => IssuerSetting) private _issuerSettings;
    mapping(address => mapping(address => bool)) private _collaborators;

    // For keys, we use a mapping from strings to IDs.
    // The purpose is to store unique string keys only once, since they are more expensive,
    mapping(address => mapping(string => uint256)) private _keysToIds;
    mapping(address => uint256) private _totalProperties;

    // For strings, we also use a mapping from strings to IDs, together with a reverse mapping
    // The purpose is to store unique string values only once, since they are more expensive,
    // and storing only IDs.
    mapping(address => uint256) private _totalStringValues;
    mapping(address => mapping(string => uint256)) private _stringValueToId;
    mapping(address => mapping(uint256 => string)) private _stringIdToValue;
    mapping(address => mapping(uint256 => mapping(uint256 => uint256)))
        private _stringValueIds;

    mapping(address => mapping(uint256 => mapping(uint256 => address)))
        private _addressValues;
    mapping(address => mapping(uint256 => mapping(uint256 => bytes)))
        private _bytesValues;
    mapping(address => mapping(uint256 => mapping(uint256 => uint256)))
        private _uintValues;
    mapping(address => mapping(uint256 => mapping(uint256 => bool)))
        private _boolValues;

    struct IssuerSetting {
        bool registered;
        bool useOwnable;
        address issuer;
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function registerAccessControl(
        address collection,
        address issuer,
        bool useOwnable
    ) external onlyUnregisteredCollection(collection) {
        (bool ownableSuccess, bytes memory ownableReturn) = collection.call(
            abi.encodeWithSignature("owner()")
        );

        if (address(uint160(uint256(bytes32(ownableReturn)))) == address(0)) {
            revert RMRKOwnableNotImplemented();
        }
        if (
            ownableSuccess &&
            address(uint160(uint256(bytes32(ownableReturn)))) != msg.sender
        ) {
            revert RMRKNotCollectionIssuer();
        }

        IssuerSetting storage issuerSetting = _issuerSettings[collection];
        issuerSetting.registered = true;
        issuerSetting.issuer = issuer;
        issuerSetting.useOwnable = useOwnable;

        emit AccessControlRegistration(
            collection,
            issuer,
            msg.sender,
            useOwnable
        );
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function manageAccessControl(
        address collection,
        string memory key,
        AccessType accessType,
        address specificAddress
    ) external onlyRegisteredCollection(collection) onlyIssuer(collection) {
        uint256 parameterId = _getIdForKey(collection, key);

        _parameterAccessType[collection][parameterId] = accessType;
        _parameterSpecificAddress[collection][parameterId] = specificAddress;

        emit AccessControlUpdate(collection, key, accessType, specificAddress);
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function manageCollaborators(
        address collection,
        address[] memory collaboratorAddresses,
        bool[] memory collaboratorAddressAccess
    ) external onlyRegisteredCollection(collection) onlyIssuer(collection) {
        if (collaboratorAddresses.length != collaboratorAddressAccess.length) {
            revert RMRKCollaboratorArraysNotEqualLength();
        }
        for (uint256 i = 0; i < collaboratorAddresses.length; i++) {
            _collaborators[collection][
                collaboratorAddresses[i]
            ] = collaboratorAddressAccess[i];
            emit CollaboratorUpdate(
                collection,
                collaboratorAddresses[i],
                collaboratorAddressAccess[i]
            );
        }
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function isCollaborator(
        address collaborator,
        address collection
    ) external view returns (bool) {
        return _collaborators[collection][collaborator];
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function isSpecificAddress(
        address specificAddress,
        address collection,
        string memory key
    ) external view returns (bool) {
        return
            _parameterSpecificAddress[collection][
                _keysToIds[collection][key]
            ] == specificAddress;
    }

    /**
     * @notice Modifier to check if the caller is authorized to call the function.
     * @dev If the authorization is set to TokenOwner and the tokenId provided is of the non-existent token, the
     *  execution will revert with `ERC721InvalidTokenId` rather than `RMRKNotTokenOwner`.
     * @dev The tokenId parameter is only needed for the TokenOwner authorization type, other authorization types ignore
     *  it.
     * @param collection The address of the collection.
     * @param key Key of the property.
     * @param tokenId The ID of the token.
     */
    modifier onlyAuthorizedCaller(
        address collection,
        string memory key,
        uint256 tokenId
    ) {
        _onlyAuthorizedCaller(collection, key, tokenId);
        _;
    }

    /**
     * @notice Modifier to check if the collection is registered.
     * @param collection Address of the collection.
     */
    modifier onlyRegisteredCollection(address collection) {
        if (!_issuerSettings[collection].registered) {
            revert RMRKCollectionNotRegistered();
        }
        _;
    }

    /**
     * @notice Modifier to check if the collection is not registered.
     * @param collection Address of the collection.
     */
    modifier onlyUnregisteredCollection(address collection) {
        if (_issuerSettings[collection].registered) {
            revert RMRKCollectionAlreadyRegistered();
        }
        _;
    }

    /**
     * @notice Modifier to check if the caller is the issuer of the collection.
     * @param collection Address of the collection.
     */
    modifier onlyIssuer(address collection) {
        if (_issuerSettings[collection].useOwnable) {
            if (Ownable(collection).owner() != msg.sender) {
                revert RMRKNotCollectionIssuer();
            }
        } else if (_issuerSettings[collection].issuer != msg.sender) {
            revert RMRKNotCollectionIssuer();
        }
        _;
    }

    /**
     * @notice Function to check if the caller is authorized to mamage a given parameter.
     * @param collection The address of the collection.
     * @param key Key of the property.
     * @param tokenId The ID of the token.
     */
    function _onlyAuthorizedCaller(
        address collection,
        string memory key,
        uint256 tokenId
    ) private view {
        AccessType accessType = _parameterAccessType[collection][
            _keysToIds[collection][key]
        ];

        if (
            accessType == AccessType.Issuer &&
            ((_issuerSettings[collection].useOwnable &&
                Ownable(collection).owner() != msg.sender) ||
                (!_issuerSettings[collection].useOwnable &&
                    _issuerSettings[collection].issuer != msg.sender))
        ) {
            revert RMRKNotCollectionIssuer();
        } else if (
            accessType == AccessType.Collaborator &&
            !_collaborators[collection][msg.sender]
        ) {
            revert RMRKNotCollectionCollaborator();
        } else if (
            accessType == AccessType.IssuerOrCollaborator &&
            ((_issuerSettings[collection].useOwnable &&
                Ownable(collection).owner() != msg.sender) ||
                (!_issuerSettings[collection].useOwnable &&
                    _issuerSettings[collection].issuer != msg.sender)) &&
            !_collaborators[collection][msg.sender]
        ) {
            revert RMRKNotCollectionIssuerOrCollaborator();
        } else if (
            accessType == AccessType.TokenOwner &&
            IERC721(collection).ownerOf(tokenId) != msg.sender
        ) {
            revert RMRKNotTokenOwner();
        } else if (
            accessType == AccessType.SpecificAddress &&
            !(_parameterSpecificAddress[collection][
                _keysToIds[collection][key]
            ] == msg.sender)
        ) {
            revert RMRKNotSpecificAddress();
        }
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getStringTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (string memory) {
        uint256 idForValue = _stringValueIds[collection][tokenId][
            _keysToIds[collection][key]
        ];
        return _stringIdToValue[collection][idForValue];
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getUintTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (uint256) {
        return _uintValues[collection][tokenId][_keysToIds[collection][key]];
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getBoolTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (bool) {
        return _boolValues[collection][tokenId][_keysToIds[collection][key]];
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getAddressTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (address) {
        return _addressValues[collection][tokenId][_keysToIds[collection][key]];
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getBytesTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (bytes memory) {
        return _bytesValues[collection][tokenId][_keysToIds[collection][key]];
    }

    /**
     * @notice Used to set a number property.
     * @dev Emits a {UintPropertyUpdated} event.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setUintProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        uint256 value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _uintValues[collection][tokenId][_getIdForKey(collection, key)] = value;
        emit UintPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set a string property.
     * @dev Emits a {StringPropertyUpdated} event.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setStringProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        string memory value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _stringValueIds[collection][tokenId][
            _getIdForKey(collection, key)
        ] = _getStringIdForValue(collection, value);
        emit StringPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set a boolean property.
     * @dev Emits a {BoolPropertyUpdated} event.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBoolProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bool value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _boolValues[collection][tokenId][_getIdForKey(collection, key)] = value;
        emit BoolPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set an bytes property.
     * @dev Emits a {BytesPropertyUpdated} event.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setBytesProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bytes memory value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _bytesValues[collection][tokenId][
            _getIdForKey(collection, key)
        ] = value;
        emit BytesPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set an address property.
     * @dev Emits a {AddressPropertyUpdated} event.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function setAddressProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        address value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _addressValues[collection][tokenId][
            _getIdForKey(collection, key)
        ] = value;
        emit AddressPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @notice Used to get the Id for a key. If the key does not exist, a new ID is created.
     *  IDs are shared among all tokens and types
     * @dev The ID of 0 is not used as it represents the default value.
     * @param collection Address of the collection being checked for key ID
     * @param key The property key
     * @return The ID of the key
     */
    function _getIdForKey(
        address collection,
        string memory key
    ) internal returns (uint256) {
        if (_keysToIds[collection][key] == 0) {
            _totalProperties[collection]++;
            _keysToIds[collection][key] = _totalProperties[collection];
            return _totalProperties[collection];
        } else {
            return _keysToIds[collection][key];
        }
    }

    /**
     * @notice Used to get the ID for a string value. If the value does not exist, a new ID is created.
     * @dev IDs are shared among all tokens and used only for strings.
     * @param collection Address of the collection being checked for string ID
     * @param value The property value
     * @return The id for the string value
     */
    function _getStringIdForValue(
        address collection,
        string memory value
    ) internal returns (uint256) {
        if (_stringValueToId[collection][value] == 0) {
            _totalStringValues[collection]++;
            _stringValueToId[collection][value] = _totalStringValues[
                collection
            ];
            _stringIdToValue[collection][
                _totalStringValues[collection]
            ] = value;
            return _totalStringValues[collection];
        } else {
            return _stringValueToId[collection][value];
        }
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == type(IRMRKTokenPropertiesRepository).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
