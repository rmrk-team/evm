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
}
