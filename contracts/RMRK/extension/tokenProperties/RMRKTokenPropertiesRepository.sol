// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IRMRKTokenPropertiesRepository.sol";
import "./RMRKPropertiesAccessControl.sol";

/**
 * @title RMRKTokenPropertiesRepository
 * @author RMRK team
 * @notice Smart contract of the RMRK Token property repository module.
 */
contract RMRKTokenPropertiesRepository is
    IRMRKTokenPropertiesRepository,
    RMRKPropertiesAccessControl
{
    // For keys, we use a mapping from strings to Ids.
    // The purpose is to store unique string keys only once, since they are more expensive,
    mapping(string => uint256) private _keysToIds;
    mapping(address => uint256) private _totalProperties;

    // For strings, we also use a mapping from strings to Ids, together with a reverse mapping
    // The purpose is to store unique string values only once, since they are more expensive,
    // and storing only ids.
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
     * @notice Used to set a number property.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setUintProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        uint256 value
    )
        internal
        onlyAuthorizedCaller(
            collection,
            ParameterType.UINT,
            _getIdForKey(collection, key),
            tokenId
        )
    {
        _uintValues[collection][tokenId][_getIdForKey(collection, key)] = value;
        emit UintPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set a string property.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setStringProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        string memory value
    )
        internal
        onlyAuthorizedCaller(
            collection,
            ParameterType.STRING,
            _getIdForKey(collection, key),
            tokenId
        )
    {
        _stringValueIds[collection][tokenId][
            _getIdForKey(collection, key)
        ] = _getStringIdForValue(collection, value);
        emit StringPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set a boolean property.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setBoolProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bool value
    )
        internal
        onlyAuthorizedCaller(
            collection,
            ParameterType.BOOL,
            _getIdForKey(collection, key),
            tokenId
        )
    {
        _boolValues[collection][tokenId][_getIdForKey(collection, key)] = value;
        emit BoolPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set an bytes property.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setBytesProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bytes memory value
    )
        internal
        onlyAuthorizedCaller(
            collection,
            ParameterType.BYTES,
            _getIdForKey(collection, key),
            tokenId
        )
    {
        _bytesValues[collection][tokenId][
            _getIdForKey(collection, key)
        ] = value;
        emit BytesPropertyUpdated(collection, tokenId, key, value);
    }

    /**
     * @notice Used to set an address property.
     * @param collection Address of the collection receiving the property
     * @param tokenId The token ID
     * @param key The property key
     * @param value The property value
     */
    function _setAddressProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        address value
    )
        internal
        onlyAuthorizedCaller(
            collection,
            ParameterType.ADDRESS,
            _getIdForKey(collection, key),
            tokenId
        )
    {
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
        if (_keysToIds[key] == 0) {
            _totalProperties[collection]++;
            _keysToIds[key] = _totalProperties[collection];
            return _totalProperties[collection];
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
            interfaceId == type(IRMRKPropertiesAccessControl).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
