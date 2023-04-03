// SPDX-LicenseIdentifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "../../library/RMRKErrors.sol";

interface IRMRKPropertiesAccessControl {
    /**
     * @notice A list of supported parameter types.
     * @return The `string` type.
     * @return The `address` type.
     * @return The `bytes` type.
     * @return The `uint` type.
     * @return The `bool` type.
     */
    enum ParameterType {
        STRING,
        ADDRESS,
        BYTES,
        UINT,
        BOOL
    }

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
     * @notice Used to noitfy listeners that the access control settings for a specific parameter have been updated.
     * @param collection Address of the collection.
     * @param parameterType The type of parameter for which the access control settings have been updated.
     * @param parameterId The ID of the parameter for which the access control settings have been updated.
     * @param accessType The AccessType of the parameter for which the access control settings have been updated.
     * @param collaboratorAddresses The array of collaborator addresses that have been updated.
     * @param collaboratorAddressAccess The boolean array of the access values for the collaborator addresses.
     * @param specificAddresses The array of specific addresses that have been updated.
     * @param specificAddressAccess The boolean array of the access values for the specific addresses.
     */
    event AccessControlUpdated(
        address indexed collection,
        ParameterType parameterType,
        uint256 parameterId,
        AccessType accessType,
        address[] collaboratorAddresses,
        bool[] collaboratorAddressAccess,
        address[] specificAddresses,
        bool[] specificAddressAccess
    );

    /**
     * @notice Used to register a collection to use the RMRK token properties repository.
     * @dev  If the collection does not implement the Ownable interface, the `useOwnable` value must be set to `false`.
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
     * @dev The `collaboratorAddresses` and `collaboratorAddressAccess` arrays must be of the same length.
     * @dev The `specificAddresses` and `specificAddressAccess` arrays must be of the same length.
     * @dev the possible `parameterType` values are:
     *  [
     *      STRING,
     *      ADDRESS,
     *      BYTES,
     *      UINT,
     *      BOOL
     *  ]
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
     * @param parameterType Type of the parameter being managed.
     * @param parameterId ID of the parameter being managed.
     * @param accessType The type of access control to be applied to the parameter.
     * @param collaboratorAddresses The array of addresses to be added or removed from the list of collaborators.
     * @param collaboratorAddressAccess The array of boolean values to indicate if the address should be added as a
     *  collaborator (`true`) or removed (`false`).
     * @param specificAddresses The array of addresses to be added or removed from the list of specific addresses.
     * @param specificAddressAccess The array of boolean values to indicate if the address should be added as a specific
     *  address (`true`) or removed (`false`).
     */
    function manageAccessControl(
        address collection,
        ParameterType parameterType,
        uint256 parameterId,
        AccessType accessType,
        address[] memory collaboratorAddresses,
        bool[] memory collaboratorAddressAccess,
        address[] memory specificAddresses,
        bool[] memory specificAddressAccess
    ) external;

    /**
     * @notice Used to check if the specified address is listed as a collaborator of the given collection's parameter.
     * @param collaborator Address to be checked.
     * @param collection Address of the collection.
     * @param parameterType Type of the parameter being checked.
     * @param parameterId ID of the parameter being checked.
     * @return Boolean value indicating if the address is a collaborator of the given collection's parameter (`true`) or
     *  not (`false`).
     */
    function isCollaborator(
        address collaborator,
        address collection,
        ParameterType parameterType,
        uint256 parameterId
    ) external view returns (bool);

    /**
     * @notice Used to check if the specified address is listed as a specific address of the given collection's
     *  parameter.
     * @param specificAddress Address to be checked.
     * @param collection Address of the collection.
     * @param parameterType Type of the parameter being checked.
     * @param parameterId ID of the parameter being checked.
     * @return Boolean value indicating if the address is a specific address of the given collection's parameter
     *  (`true`) or not (`false`).
     */
    function isSpecificAddress(
        address specificAddress,
        address collection,
        ParameterType parameterType,
        uint256 parameterId
    ) external view returns (bool);
}
