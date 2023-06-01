// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";

import "../../../../RMRK/library/RMRKErrors.sol";
import "../../../../RMRK/extension/tokenProperties/IRMRKTokenPropertiesRepository.sol";

/**
 * @title RMRKTokenPropertiesRepositoryUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK Token property repository module.
 */
contract RMRKTokenPropertiesRepositoryUpgradeable is
    IRMRKTokenPropertiesRepository
{
    mapping(address => mapping(uint256 => AccessType))
        private _parameterAccessType;
    mapping(address => mapping(uint256 => address))
        private _parameterSpecificAddress;
    mapping(address => IssuerSetting) private _issuerSettings;
    mapping(address => mapping(address => bool)) private _collaborators;

    // For keys, we use a mapping from strings to IDs.
    // The purpose is to store unique string keys only once, since they are more expensive.
    mapping(string => uint256) private _keysToIds;
    uint256 private _totalProperties;

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
        uint256 parameterId = _getIdForKey(key);

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
        for (uint256 i; i < collaboratorAddresses.length; ) {
            _collaborators[collection][
                collaboratorAddresses[i]
            ] = collaboratorAddressAccess[i];
            emit CollaboratorUpdate(
                collection,
                collaboratorAddresses[i],
                collaboratorAddressAccess[i]
            );
            unchecked {
                ++i;
            }
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
            _parameterSpecificAddress[collection][_keysToIds[key]] ==
            specificAddress;
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
            if (OwnableUpgradeable(collection).owner() != msg.sender) {
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
            _keysToIds[key]
        ];

        if (
            accessType == AccessType.Issuer &&
            ((_issuerSettings[collection].useOwnable &&
                OwnableUpgradeable(collection).owner() != msg.sender) ||
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
                OwnableUpgradeable(collection).owner() != msg.sender) ||
                (!_issuerSettings[collection].useOwnable &&
                    _issuerSettings[collection].issuer != msg.sender)) &&
            !_collaborators[collection][msg.sender]
        ) {
            revert RMRKNotCollectionIssuerOrCollaborator();
        } else if (
            accessType == AccessType.TokenOwner &&
            IERC721Upgradeable(collection).ownerOf(tokenId) != msg.sender
        ) {
            revert RMRKNotTokenOwner();
        } else if (
            accessType == AccessType.SpecificAddress &&
            !(_parameterSpecificAddress[collection][_keysToIds[key]] ==
                msg.sender)
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
            _keysToIds[key]
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
        return _uintValues[collection][tokenId][_keysToIds[key]];
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getBoolTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (bool) {
        return _boolValues[collection][tokenId][_keysToIds[key]];
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getAddressTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (address) {
        return _addressValues[collection][tokenId][_keysToIds[key]];
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getBytesTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (bytes memory) {
        return _bytesValues[collection][tokenId][_keysToIds[key]];
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory stringKeys,
        string[] memory uintKeys,
        string[] memory boolKeys,
        string[] memory addressKeys,
        string[] memory bytesKeys
    )
        external
        view
        returns (
            StringProperty[] memory stringProperties,
            UintProperty[] memory uintProperties,
            BoolProperty[] memory boolProperties,
            AddressProperty[] memory addressProperties,
            BytesProperty[] memory bytesProperties
        )
    {
        stringProperties = getStringTokenProperties(
            collection,
            tokenId,
            stringKeys
        );

        uintProperties = getUintTokenProperties(collection, tokenId, uintKeys);

        boolProperties = getBoolTokenProperties(collection, tokenId, boolKeys);

        addressProperties = getAddressTokenProperties(
            collection,
            tokenId,
            addressKeys
        );

        bytesProperties = getBytesTokenProperties(
            collection,
            tokenId,
            bytesKeys
        );
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getStringTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory stringKeys
    ) public view returns (StringProperty[] memory) {
        uint256 stringLen = stringKeys.length;

        StringProperty[] memory stringProperties = new StringProperty[](
            stringLen
        );

        for (uint i; i < stringLen; ) {
            stringProperties[i] = StringProperty({
                key: stringKeys[i],
                value: _stringIdToValue[collection][
                    _stringValueIds[collection][tokenId][
                        _keysToIds[stringKeys[i]]
                    ]
                ]
            });
            unchecked {
                ++i;
            }
        }

        return stringProperties;
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getUintTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory uintKeys
    ) public view returns (UintProperty[] memory) {
        uint256 uintLen = uintKeys.length;

        UintProperty[] memory uintProperties = new UintProperty[](uintLen);

        for (uint i; i < uintLen; ) {
            uintProperties[i] = UintProperty({
                key: uintKeys[i],
                value: _uintValues[collection][tokenId][_keysToIds[uintKeys[i]]]
            });
            unchecked {
                ++i;
            }
        }

        return uintProperties;
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getBoolTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory boolKeys
    ) public view returns (BoolProperty[] memory) {
        uint256 boolLen = boolKeys.length;

        BoolProperty[] memory boolProperties = new BoolProperty[](boolLen);

        for (uint i; i < boolLen; ) {
            boolProperties[i] = BoolProperty({
                key: boolKeys[i],
                value: _boolValues[collection][tokenId][_keysToIds[boolKeys[i]]]
            });
            unchecked {
                ++i;
            }
        }

        return boolProperties;
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getAddressTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory addressKeys
    ) public view returns (AddressProperty[] memory) {
        uint256 addressLen = addressKeys.length;

        AddressProperty[] memory addressProperties = new AddressProperty[](
            addressLen
        );

        for (uint i; i < addressLen; ) {
            addressProperties[i] = AddressProperty({
                key: addressKeys[i],
                value: _addressValues[collection][tokenId][
                    _keysToIds[addressKeys[i]]
                ]
            });
            unchecked {
                ++i;
            }
        }

        return addressProperties;
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function getBytesTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory bytesKeys
    ) public view returns (BytesProperty[] memory) {
        uint256 bytesLen = bytesKeys.length;

        BytesProperty[] memory bytesProperties = new BytesProperty[](bytesLen);

        for (uint i; i < bytesLen; ) {
            bytesProperties[i] = BytesProperty({
                key: bytesKeys[i],
                value: _bytesValues[collection][tokenId][
                    _keysToIds[bytesKeys[i]]
                ]
            });
            unchecked {
                ++i;
            }
        }

        return bytesProperties;
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setUintProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        uint256 value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _uintValues[collection][tokenId][_getIdForKey(key)] = value;
        emit UintPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setStringProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        string memory value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _stringValueIds[collection][tokenId][
            _getIdForKey(key)
        ] = _getStringIdForValue(collection, value);
        emit StringPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setBoolProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bool value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _boolValues[collection][tokenId][_getIdForKey(key)] = value;
        emit BoolPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setBytesProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bytes memory value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _bytesValues[collection][tokenId][_getIdForKey(key)] = value;
        emit BytesPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setAddressProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        address value
    ) external onlyAuthorizedCaller(collection, key, tokenId) {
        _addressValues[collection][tokenId][_getIdForKey(key)] = value;
        emit AddressPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setStringProperties(
        address collection,
        uint256 tokenId,
        StringProperty[] memory properties
    ) external onlyAuthorizedCaller(collection, "", tokenId) {
        for (uint256 i = 0; i < properties.length; ) {
            _stringValueIds[collection][tokenId][
                _getIdForKey(properties[i].key)
            ] = _getStringIdForValue(collection, properties[i].value);
            emit StringPropertyUpdated(
                collection,
                tokenId,
                properties[i].key,
                properties[i].value
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setUintProperties(
        address collection,
        uint256 tokenId,
        UintProperty[] memory properties
    ) external onlyAuthorizedCaller(collection, "", tokenId) {
        for (uint256 i = 0; i < properties.length; ) {
            _uintValues[collection][tokenId][
                _getIdForKey(properties[i].key)
            ] = properties[i].value;
            emit UintPropertyUpdated(
                collection,
                tokenId,
                properties[i].key,
                properties[i].value
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setBoolProperties(
        address collection,
        uint256 tokenId,
        BoolProperty[] memory properties
    ) external onlyAuthorizedCaller(collection, "", tokenId) {
        for (uint256 i = 0; i < properties.length; ) {
            _boolValues[collection][tokenId][
                _getIdForKey(properties[i].key)
            ] = properties[i].value;
            emit BoolPropertyUpdated(
                collection,
                tokenId,
                properties[i].key,
                properties[i].value
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setAddressProperties(
        address collection,
        uint256 tokenId,
        AddressProperty[] memory properties
    ) external onlyAuthorizedCaller(collection, "", tokenId) {
        for (uint256 i = 0; i < properties.length; ) {
            _addressValues[collection][tokenId][
                _getIdForKey(properties[i].key)
            ] = properties[i].value;
            emit AddressPropertyUpdated(
                collection,
                tokenId,
                properties[i].key,
                properties[i].value
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setBytesProperties(
        address collection,
        uint256 tokenId,
        BytesProperty[] memory properties
    ) external onlyAuthorizedCaller(collection, "", tokenId) {
        for (uint256 i = 0; i < properties.length; ) {
            _bytesValues[collection][tokenId][
                _getIdForKey(properties[i].key)
            ] = properties[i].value;
            emit BytesPropertyUpdated(
                collection,
                tokenId,
                properties[i].key,
                properties[i].value
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @inheritdoc IRMRKTokenPropertiesRepository
     */
    function setTokenProperties(
        address collection,
        uint256 tokenId,
        StringProperty[] memory stringProperties,
        UintProperty[] memory uintProperties,
        BoolProperty[] memory boolProperties,
        AddressProperty[] memory addressProperties,
        BytesProperty[] memory bytesProperties
    ) external onlyAuthorizedCaller(collection, "", tokenId) {
        for (uint256 i = 0; i < stringProperties.length; ) {
            _stringValueIds[collection][tokenId][
                _getIdForKey(stringProperties[i].key)
            ] = _getStringIdForValue(collection, stringProperties[i].value);
            emit StringPropertyUpdated(
                collection,
                tokenId,
                stringProperties[i].key,
                stringProperties[i].value
            );
            unchecked {
                ++i;
            }
        }

        for (uint256 i = 0; i < uintProperties.length; ) {
            _uintValues[collection][tokenId][
                _getIdForKey(uintProperties[i].key)
            ] = uintProperties[i].value;
            emit UintPropertyUpdated(
                collection,
                tokenId,
                uintProperties[i].key,
                uintProperties[i].value
            );
            unchecked {
                ++i;
            }
        }

        for (uint256 i = 0; i < boolProperties.length; ) {
            _boolValues[collection][tokenId][
                _getIdForKey(boolProperties[i].key)
            ] = boolProperties[i].value;
            emit BoolPropertyUpdated(
                collection,
                tokenId,
                boolProperties[i].key,
                boolProperties[i].value
            );
            unchecked {
                ++i;
            }
        }

        for (uint256 i = 0; i < addressProperties.length; ) {
            _addressValues[collection][tokenId][
                _getIdForKey(addressProperties[i].key)
            ] = addressProperties[i].value;
            emit AddressPropertyUpdated(
                collection,
                tokenId,
                addressProperties[i].key,
                addressProperties[i].value
            );
            unchecked {
                ++i;
            }
        }

        for (uint256 i = 0; i < bytesProperties.length; ) {
            _bytesValues[collection][tokenId][
                _getIdForKey(bytesProperties[i].key)
            ] = bytesProperties[i].value;
            emit BytesPropertyUpdated(
                collection,
                tokenId,
                bytesProperties[i].key,
                bytesProperties[i].value
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Used to get the Id for a key. If the key does not exist, a new ID is created.
     *  IDs are shared among all tokens and types
     * @dev The ID of 0 is not used as it represents the default value.
     * @param key The property key
     * @return The ID of the key
     */
    function _getIdForKey(string memory key) internal returns (uint256) {
        if (_keysToIds[key] == 0) {
            _totalProperties++;
            _keysToIds[key] = _totalProperties;
            return _totalProperties;
        } else {
            return _keysToIds[key];
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

    uint256[50] private __gap;
}
