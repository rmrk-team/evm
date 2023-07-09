// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKTokenPropertiesRepository
 * @author RMRK team
 * @notice Interface smart contract of the RMRK token properties extension.
 */
interface IRMRKTokenPropertiesRepository is IERC165 {
    /**
     * @notice A list of supported access types.
     * @return The `Issuer` type, where only the issuer can manage the parameter.
     * @return The `Collaborator` type, where only the collaborators can manage the parameter.
     * @return The `IssuerOrCollaborator` type, where only the issuer or collaborators can manage the parameter.
     * @return The `TokenOwner` type, where only the token owner can manage the parameters of their tokens.
     * @return The `SpecificAddress` type, where only specific addresses can manage the parameter.
     */
    enum AccessType {
        Issuer,
        Collaborator,
        IssuerOrCollaborator,
        TokenOwner,
        SpecificAddress
    }

    /**
     * @notice Structure used to represent a string property.
     * @return key The key of the property
     * @return value The value of the property
     */
    struct StringProperty {
        string key;
        string value;
    }

    /**
     * @notice Structure used to represent an uint property.
     * @return key The key of the property
     * @return value The value of the property
     */
    struct UintProperty {
        string key;
        uint256 value;
    }

    /**
     * @notice Structure used to represent a boolean property.
     * @return key The key of the property
     * @return value The value of the property
     */
    struct BoolProperty {
        string key;
        bool value;
    }

    /**
     * @notice Structure used to represent an address property.
     * @return key The key of the property
     * @return value The value of the property
     */
    struct AddressProperty {
        string key;
        address value;
    }

    /**
     * @notice Structure used to represent a bytes property.
     * @return key The key of the property
     * @return value The value of the property
     */
    struct BytesProperty {
        string key;
        bytes value;
    }

    /**
     * @notice Used to notify listeners that a new collection has been registered to use the repository.
     * @param collection Address of the collection
     * @param issuer Address of the issuer of the collection; the addess authorized to manage the access control
     * @param registeringAddress Address that registered the collection
     * @param useOwnable A boolean value indicating whether the collection uses the Ownable extension to verify the
     *  issuer (`true`) or not (`false`)
     */
    event AccessControlRegistration(
        address indexed collection,
        address indexed issuer,
        address indexed registeringAddress,
        bool useOwnable
    );

    /**
     * @notice Used to notify listeners that the access control settings for a specific parameter have been updated.
     * @param collection Address of the collection
     * @param key The name of the parameter for which the access control settings have been updated
     * @param accessType The AccessType of the parameter for which the access control settings have been updated
     * @param specificAddress The specific addresses that has been updated
     */
    event AccessControlUpdate(
        address indexed collection,
        string key,
        AccessType accessType,
        address specificAddress
    );

    /**
     * @notice Used to notify listeners that a new collaborator has been added or removed.
     * @param collection Address of the collection
     * @param collaborator Address of the collaborator
     * @param isCollaborator A boolean value indicating whether the collaborator has been added (`true`) or removed
     *  (`false`)
     */
    event CollaboratorUpdate(
        address indexed collection,
        address indexed collaborator,
        bool isCollaborator
    );

    /**
     * @notice Used to notify listeners that a string property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event StringPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        string value
    );

    /**
     * @notice Used to notify listeners that an uint property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event UintPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        uint256 value
    );

    /**
     * @notice Used to notify listeners that a boolean property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event BoolPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        bool value
    );

    /**
     * @notice Used to notify listeners that an address property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event AddressPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        address value
    );

    /**
     * @notice Used to notify listeners that a bytes property has been updated.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @param value The new value of the property
     */
    event BytesPropertyUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        string key,
        bytes value
    );

    /**
     * @notice Used to register a collection to use the RMRK token properties repository.
     * @dev  If the collection does not implement the Ownable interface, the `useOwnable` value must be set to `false`.
     * @dev Emits an {AccessControlRegistration} event.
     * @param collection The address of the collection that will use the RMRK token properties repository.
     * @param issuer The address of the issuer of the collection.
     * @param useOwnable The boolean value to indicate if the collection implements the Ownable interface and whether it
     *  should be used to validate that the caller is the issuer (`true`) or to use the manually set issuer address
     *  (`false`).
     */
    function registerAccessControl(
        address collection,
        address issuer,
        bool useOwnable
    ) external;

    /**
     * @notice Used to manage the access control settings for a specific parameter.
     * @dev Only the `issuer` of the collection can call this function.
     * @dev The possible `accessType` values are:
     *  [
     *      Issuer,
     *      Collaborator,
     *      IssuerOrCollaborator,
     *      TokenOwner,
     *      SpecificAddress,
     *  ]
     * @dev Emits an {AccessControlUpdated} event.
     * @param collection The address of the collection being managed.
     * @param key The key of the property
     * @param accessType The type of access control to be applied to the parameter.
     * @param specificAddress The address to be added as a specific addresses allowed to manage the given
     *  parameter.
     */
    function manageAccessControl(
        address collection,
        string memory key,
        AccessType accessType,
        address specificAddress
    ) external;

    /**
     * @notice Used to manage the collaborators of a collection.
     * @dev The `collaboratorAddresses` and `collaboratorAddressAccess` arrays must be of the same length.
     * @dev Emits a {CollaboratorUpdate} event.
     * @param collection The address of the collection
     * @param collaboratorAddresses The array of collaborator addresses being managed
     * @param collaboratorAddressAccess The array of boolean values indicating if the collaborator address should
     *  receive the permission (`true`) or not (`false`).
     */
    function manageCollaborators(
        address collection,
        address[] memory collaboratorAddresses,
        bool[] memory collaboratorAddressAccess
    ) external;

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
    ) external;

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
    ) external;

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
    ) external;

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
    ) external;

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
    ) external;

    /**
     * @notice Sets multiple string properties for a token at once.
     * @dev The `StringProperty` struct contains the following fields:
     *  [
     *      string key,
     *      string value
     *  ]
     * @param collection Address of the collection
     * @param tokenId ID of the token
     * @param properties An array of `StringProperty` structs to be assigned to the given token
     */
    function setStringProperties(
        address collection,
        uint256 tokenId,
        StringProperty[] memory properties
    ) external;

    /**
     * @notice Sets multiple uint properties for a token at once.
     * @dev The `UintProperty` struct contains the following fields:
     *  [
     *      string key,
     *      uint value
     *  ]
     * @param collection Address of the collection
     * @param tokenId ID of the token
     * @param properties An array of `UintProperty` structs to be assigned to the given token
     */
    function setUintProperties(
        address collection,
        uint256 tokenId,
        UintProperty[] memory properties
    ) external;

    /**
     * @notice Sets multiple bool properties for a token at once.
     * @dev The `BoolProperty` struct contains the following fields:
     *  [
     *      string key,
     *      bool value
     *  ]
     * @param collection Address of the collection
     * @param tokenId ID of the token
     * @param properties An array of `BoolProperty` structs to be assigned to the given token
     */
    function setBoolProperties(
        address collection,
        uint256 tokenId,
        BoolProperty[] memory properties
    ) external;

    /**
     * @notice Sets multiple address properties for a token at once.
     * @dev The `AddressProperty` struct contains the following fields:
     *  [
     *      string key,
     *      address value
     *  ]
     * @param collection Address of the collection
     * @param tokenId ID of the token
     * @param properties An array of `AddressProperty` structs to be assigned to the given token
     */
    function setAddressProperties(
        address collection,
        uint256 tokenId,
        AddressProperty[] memory properties
    ) external;

    /**
     * @notice Sets multiple bytes properties for a token at once.
     * @dev The `BytesProperty` struct contains the following fields:
     *  [
     *      string key,
     *      bytes value
     *  ]
     * @param collection Address of the collection
     * @param tokenId ID of the token
     * @param properties An array of `BytesProperty` structs to be assigned to the given token
     */
    function setBytesProperties(
        address collection,
        uint256 tokenId,
        BytesProperty[] memory properties
    ) external;

    /**
     * @notice Sets multiple properties of multiple types for a token at the same time.
     * @dev Emits a separate event for each property set.
     * @dev The `StringProperty`, `UintProperty`, `BoolProperty`, `AddressProperty` and `BytesProperty` structs consists
     *  to the following fields (where `value` is of the appropriate type):
     *  [
     *      key,
     *      value,
     *  ]
     * @param collection The address of the collection
     * @param tokenId The token ID
     * @param stringProperties An array of `StringProperty` structs containing string properties to set
     * @param uintProperties An array of `UintProperty` structs containing uint properties to set
     * @param boolProperties An array of `BoolProperty` structs containing bool properties to set
     * @param addressProperties An array of `AddressProperty` structs containing address properties to set
     * @param bytesProperties An array of `BytesProperty` structs containing bytes properties to set
     */
    function setTokenProperties(
        address collection,
        uint256 tokenId,
        StringProperty[] memory stringProperties,
        UintProperty[] memory uintProperties,
        BoolProperty[] memory boolProperties,
        AddressProperty[] memory addressProperties,
        BytesProperty[] memory bytesProperties
    ) external;

    /**
     * @notice Used to set the uint property on behalf of an authorized account.
     * @dev Emits a {UintPropertyUpdated} event.
     * @param setter Address of the account that presigned the property change
     * @param collection Address of the collection receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction
     * @param v `v` value of an ECDSA signature of the presigned message
     * @param r `r` value of an ECDSA signature of the presigned message
     * @param s `s` value of an ECDSA signature of the presigned message
     */
    function presignedSetUintProperty(
        address setter,
        address collection,
        uint256 tokenId,
        string memory key,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @notice Used to set the string property on behalf of an authorized account.
     * @dev Emits a {StringPropertyUpdated} event.
     * @param setter Address of the account that presigned the property change
     * @param collection Address of the collection receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction
     * @param v `v` value of an ECDSA signature of the presigned message
     * @param r `r` value of an ECDSA signature of the presigned message
     * @param s `s` value of an ECDSA signature of the presigned message
     */
    function presignedSetStringProperty(
        address setter,
        address collection,
        uint256 tokenId,
        string memory key,
        string memory value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @notice Used to set the bool property on behalf of an authorized account.
     * @dev Emits a {BoolPropertyUpdated} event.
     * @param setter Address of the account that presigned the property change
     * @param collection Address of the collection receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction
     * @param v `v` value of an ECDSA signature of the presigned message
     * @param r `r` value of an ECDSA signature of the presigned message
     * @param s `s` value of an ECDSA signature of the presigned message
     */
    function presignedSetBoolProperty(
        address setter,
        address collection,
        uint256 tokenId,
        string memory key,
        bool value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @notice Used to set the bytes property on behalf of an authorized account.
     * @dev Emits a {BytesPropertyUpdated} event.
     * @param setter Address of the account that presigned the property change
     * @param collection Address of the collection receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction
     * @param v `v` value of an ECDSA signature of the presigned message
     * @param r `r` value of an ECDSA signature of the presigned message
     * @param s `s` value of an ECDSA signature of the presigned message
     */
    function presignedSetBytesProperty(
        address setter,
        address collection,
        uint256 tokenId,
        string memory key,
        bytes memory value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @notice Used to set the address property on behalf of an authorized account.
     * @dev Emits a {AddressPropertyUpdated} event.
     * @param setter Address of the account that presigned the property change
     * @param collection Address of the collection receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction
     * @param v `v` value of an ECDSA signature of the presigned message
     * @param r `r` value of an ECDSA signature of the presigned message
     * @param s `s` value of an ECDSA signature of the presigned message
     */
    function presignedSetAddressProperty(
        address setter,
        address collection,
        uint256 tokenId,
        string memory key,
        address value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @notice Used to check if the specified address is listed as a collaborator of the given collection's parameter.
     * @param collaborator Address to be checked.
     * @param collection Address of the collection.
     * @return Boolean value indicating if the address is a collaborator of the given collection's (`true`) or not
     *  (`false`).
     */
    function isCollaborator(
        address collaborator,
        address collection
    ) external view returns (bool);

    /**
     * @notice Used to check if the specified address is listed as a specific address of the given collection's
     *  parameter.
     * @param specificAddress Address to be checked.
     * @param collection Address of the collection.
     * @param key The key of the property
     * @return Boolean value indicating if the address is a specific address of the given collection's parameter
     *  (`true`) or not (`false`).
     */
    function isSpecificAddress(
        address specificAddress,
        address collection,
        string memory key
    ) external view returns (bool);

    /**
     * @notice Used to retrieve the string type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the string property
     */
    function getStringTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (string memory);

    /**
     * @notice Used to retrieve the uint type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the uint property
     */
    function getUintTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (uint256);

    /**
     * @notice Used to retrieve the bool type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the bool property
     */
    function getBoolTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (bool);

    /**
     * @notice Used to retrieve the address type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the address property
     */
    function getAddressTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (address);

    /**
     * @notice Used to retrieve the bytes type token properties.
     * @param collection The collection address
     * @param tokenId The token ID
     * @param key The key of the property
     * @return The value of the bytes property
     */
    function getBytesTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (bytes memory);

    /**
     * @notice Used to retrieve the message to be signed for submitting a presigned uint property change.
     * @param collection The address of the collection smart contract of the token receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction after which the message is invalid
     * @return Raw message to be signed by the authorized account
     */
    function prepareMessageToPresignUintProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        uint256 value,
        uint256 deadline
    ) external view returns (bytes32);

    /**
     * @notice Used to retrieve the message to be signed for submitting a presigned string property change.
     * @param collection The address of the collection smart contract of the token receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction after which the message is invalid
     * @return Raw message to be signed by the authorized account
     */
    function prepareMessageToPresignStringProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        string memory value,
        uint256 deadline
    ) external view returns (bytes32);

    /**
     * @notice Used to retrieve the message to be signed for submitting a presigned bool property change.
     * @param collection The address of the collection smart contract of the token receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction after which the message is invalid
     * @return Raw message to be signed by the authorized account
     */
    function prepareMessageToPresignBoolProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bool value,
        uint256 deadline
    ) external view returns (bytes32);

    /**
     * @notice Used to retrieve the message to be signed for submitting a presigned bytes property change.
     * @param collection The address of the collection smart contract of the token receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction after which the message is invalid
     * @return Raw message to be signed by the authorized account
     */
    function prepareMessageToPresignBytesProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        bytes memory value,
        uint256 deadline
    ) external view returns (bytes32);

    /**
     * @notice Used to retrieve the message to be signed for submitting a presigned address property change.
     * @param collection The address of the collection smart contract of the token receiving the property
     * @param tokenId The ID of the token receiving the property
     * @param key The property key
     * @param value The property value
     * @param deadline The deadline timestamp for the presigned transaction after which the message is invalid
     * @return Raw message to be signed by the authorized account
     */
    function prepareMessageToPresignAddressProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        address value,
        uint256 deadline
    ) external view returns (bytes32);

    /**
     * @notice Used to retrieve multiple token properties of any type at once.
     * @dev The `StringProperty`, `UintProperty`, `BoolProperty`, `AddressProperty` and `BytesProperty` structs consists
     *  to the following fields (where `value` is of the appropriate type):
     *  [
     *      key,
     *      value,
     *  ]
     * @param collection The collection address
     * @param tokenId The token ID
     * @param stringKeys An array of string type property keys to retrieve
     * @param uintKeys An array of uint type property keys to retrieve
     * @param boolKeys An array of bool type property keys to retrieve
     * @param addressKeys An array of address type property keys to retrieve
     * @param bytesKeys An array of bytes type property keys to retrieve
     * @return stringProperties An array of `StringProperty` structs containing the string type properties
     * @return uintProperties An array of `UintProperty` structs containing the uint type properties
     * @return boolProperties An array of `BoolProperty` structs containing the bool type properties
     * @return addressProperties An array of `AddressProperty` structs containing the address type properties
     * @return bytesProperties An array of `BytesProperty` structs containing the bytes type properties
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
        );

    /**
     * @notice Used to get multiple sting parameter values for a token.
     * @dev The `StringProperty` struct contains the following fields:
     *  [
     *     string key,
     *     string value
     *  ]
     * @param collection Address of the collection the token belongs to
     * @param tokenId ID of the token for which the properties are being retrieved
     * @param stringKeys An array of string keys to retrieve
     * @return An array of `StringProperty` structs
     */
    function getStringTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory stringKeys
    ) external view returns (StringProperty[] memory);

    /**
     * @notice Used to get multiple uint parameter values for a token.
     * @dev The `UintProperty` struct contains the following fields:
     *  [
     *     string key,
     *     uint value
     *  ]
     * @param collection Address of the collection the token belongs to
     * @param tokenId ID of the token for which the properties are being retrieved
     * @param uintKeys An array of uint keys to retrieve
     * @return An array of `UintProperty` structs
     */
    function getUintTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory uintKeys
    ) external view returns (UintProperty[] memory);

    /**
     * @notice Used to get multiple bool parameter values for a token.
     * @dev The `BoolProperty` struct contains the following fields:
     *  [
     *     string key,
     *     bool value
     *  ]
     * @param collection Address of the collection the token belongs to
     * @param tokenId ID of the token for which the properties are being retrieved
     * @param boolKeys An array of bool keys to retrieve
     * @return An array of `BoolProperty` structs
     */
    function getBoolTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory boolKeys
    ) external view returns (BoolProperty[] memory);

    /**
     * @notice Used to get multiple address parameter values for a token.
     * @dev The `AddressProperty` struct contains the following fields:
     *  [
     *     string key,
     *     address value
     *  ]
     * @param collection Address of the collection the token belongs to
     * @param tokenId ID of the token for which the properties are being retrieved
     * @param addressKeys An array of address keys to retrieve
     * @return An array of `AddressProperty` structs
     */
    function getAddressTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory addressKeys
    ) external view returns (AddressProperty[] memory);

    /**
     * @notice Used to get multiple bytes parameter values for a token.
     * @dev The `BytesProperty` struct contains the following fields:
     *  [
     *     string key,
     *     bytes value
     *  ]
     * @param collection Address of the collection the token belongs to
     * @param tokenId ID of the token for which the properties are being retrieved
     * @param bytesKeys An array of bytes keys to retrieve
     * @return An array of `BytesProperty` structs
     */
    function getBytesTokenProperties(
        address collection,
        uint256 tokenId,
        string[] memory bytesKeys
    ) external view returns (BytesProperty[] memory);
}
