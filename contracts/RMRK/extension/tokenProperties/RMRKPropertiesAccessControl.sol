// SPDX-LicenseIdentifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./IRMRKPropertiesAccessControl.sol";

contract RMRKPropertiesAccessControl is IRMRKPropertiesAccessControl {
    // mapping(address collection => mapping (ParameterType => mapping (uint256 parameterId => AccessControl))) private _accessControl;
    mapping(address => mapping(ParameterType => mapping(uint256 => AccessControl)))
        private _accessControl;
    // mapping(address collection => IssuerSetting issuerSetting) private _issuerSettings;
    mapping(address => IssuerSetting) private _issuerSettings;

    struct AccessControl {
        AccessType accessType;
        mapping(address => bool) collaboratorAddresses;
        mapping(address => bool) specificAddresses;
    }

    struct IssuerSetting {
        bool registered;
        bool useOwnable;
        address issuer;
    }

    /**
     * @inheritdoc IRMRKPropertiesAccessControl
     */
    function registerAccessControl(
        address collection,
        address issuer,
        bool useOwnable
    ) external onlyUnregisteredCollection(collection) {
        (bool ownableSuccess, bytes memory ownableReturn) = collection.call(
            abi.encodeWithSignature("owner()")
        );

        if (
            ownableSuccess &&
            address(uint160(uint256(bytes32(ownableReturn)))) != address(0) &&
            address(uint160(uint256(bytes32(ownableReturn)))) != msg.sender
        ) {
            revert RMRKNotCollectionIssuer();
        }
        if (
            useOwnable &&
            address(uint160(uint256(bytes32(ownableReturn)))) == address(0)
        ) {
            revert RMRKOwnableNotImplemented();
        }

        IssuerSetting storage issuerSetting = _issuerSettings[collection];
        issuerSetting.registered = true;
        issuerSetting.issuer = issuer;
        issuerSetting.useOwnable = useOwnable;
    }

    /**
     * @inheritdoc IRMRKPropertiesAccessControl
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
    ) external onlyRegisteredCollection(collection) onlyIssuer(collection) {
        if (collaboratorAddresses.length != collaboratorAddressAccess.length) {
            revert RMRKCollaboratorArraysNotEqualLength();
        }
        if (specificAddresses.length != specificAddressAccess.length) {
            revert RMRKSpecificAddressArraysNotEqualLength();
        }
        AccessControl storage accessControl = _accessControl[collection][
            parameterType
        ][parameterId];
        accessControl.accessType = accessType;
        for (uint256 i = 0; i < collaboratorAddresses.length; i++) {
            accessControl.collaboratorAddresses[
                collaboratorAddresses[i]
            ] = collaboratorAddressAccess[i];
        }
        for (uint256 i = 0; i < specificAddresses.length; i++) {
            accessControl.specificAddresses[
                specificAddresses[i]
            ] = specificAddressAccess[i];
        }

        emit AccessControlUpdated(
            collection,
            parameterType,
            parameterId,
            accessType,
            collaboratorAddresses,
            collaboratorAddressAccess,
            specificAddresses,
            specificAddressAccess
        );
    }

    /**
     * @inheritdoc IRMRKPropertiesAccessControl
     */
    function isCollaborator(
        address collaborator,
        address collection,
        ParameterType parameterType,
        uint256 parameterId
    ) external view returns (bool) {
        return
            _accessControl[collection][parameterType][parameterId]
                .collaboratorAddresses[collaborator];
    }

    /**
     * @inheritdoc IRMRKPropertiesAccessControl
     */
    function isSpecificAddress(
        address specificAddress,
        address collection,
        ParameterType parameterType,
        uint256 parameterId
    ) external view returns (bool) {
        return
            _accessControl[collection][parameterType][parameterId]
                .specificAddresses[specificAddress];
    }

    /**
     * @notice Modifier to check if the caller is authorized to call the function.
     * @dev If the authorization is set to TokenOwner and the tokenId provided is of the non-existent token, the
     *  execution will revert with `ERC721InvalidTokenId` rather than `RMRKNotTokenOwner`.
     * @dev The tokenId parameter is only needed for the TokenOwner authorization type, other authorization types ignore
     *  it.
     * @param collection The address of the collection.
     * @param parameterType The type of the parameter.
     * @param parameterId The ID of the parameter.
     * @param tokenId The ID of the token.
     */
    modifier onlyAuthorizedCaller(
        address collection,
        ParameterType parameterType,
        uint256 parameterId,
        uint256 tokenId
    ) {
        _onlyAuthorizedCaller(collection, parameterType, parameterId, tokenId);
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
     * @dev The valid parameter types are:
     *  [
     *      STRING,
     *      ADDRESS,
     *      BYTES,
     *      UINT,
     *      BOOL
     *  ]
     * @param collection The address of the collection.
     * @param parameterType The type of the parameter.
     * @param parameterId The ID of the parameter.
     * @param tokenId The ID of the token.
     */
    function _onlyAuthorizedCaller(
        address collection,
        ParameterType parameterType,
        uint256 parameterId,
        uint256 tokenId
    ) private view {
        AccessControl storage accessControl = _accessControl[collection][
            parameterType
        ][parameterId];

        if (
            accessControl.accessType == AccessType.Issuer &&
            ((_issuerSettings[collection].useOwnable &&
                Ownable(collection).owner() != msg.sender) ||
                (!_issuerSettings[collection].useOwnable &&
                    _issuerSettings[collection].issuer != msg.sender))
        ) {
            revert RMRKNotCollectionIssuer();
        } else if (
            accessControl.accessType == AccessType.Collaborator &&
            !accessControl.collaboratorAddresses[msg.sender]
        ) {
            revert RMRKNotCollectionCollaborator();
        } else if (
            accessControl.accessType == AccessType.IssuerOrCollaborator &&
            ((_issuerSettings[collection].useOwnable &&
                Ownable(collection).owner() != msg.sender) ||
                (!_issuerSettings[collection].useOwnable &&
                    _issuerSettings[collection].issuer != msg.sender)) &&
            !accessControl.collaboratorAddresses[msg.sender]
        ) {
            revert RMRKNotCollectionIssuerOrCollaborator();
        } else if (
            accessControl.accessType == AccessType.TokenOwner &&
            IERC721(collection).ownerOf(tokenId) != msg.sender
        ) {
            revert RMRKNotTokenOwner();
        } else if (
            accessControl.accessType == AccessType.SpecificAddress &&
            !accessControl.specificAddresses[msg.sender]
        ) {
            revert RMRKNotSpecificAddress();
        }
    }
}
