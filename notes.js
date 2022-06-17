
NeonToken
    Fixed parts: body, fingers  // They are not replaceable. We use fingers apart for Z-index
    Slot parts: weapons, weaponExtension, background  // They can be changed by equipping other NFTs


Create NeonBase:
    bodyPartId = 1
    fingerPartId = 2
    weaponLeftPartId = 3
    weaponRightPartId = 4
    backgroundPartId = 5
    weaponChargerPartId = 6

    baseBody = { ItemType.fixed,  1, [], 'srcURI', 'fallBackURI' }
    baseFinger = { ItemType.fixed,  3, [NeonToken.Address], 'srcFingerURI', 'fallBackFingerURI' }
    baseWeaponLeft = { ItemType.slots,  2, [NeonToken.Address], '', '' }
    baseWeaponRight = { ItemType.slots,  2, [NeonToken.Address], '', '' }
    baseBackground = { ItemType.slots,  0, [NeonToken.Address], 'noBackgroundURI', 'fallNoBackgroundURI' }
    baseWeaponRight = { ItemType.slots,  4, [NeonToken.Address], '', '' }

    _addBaseEntryList(
        [bodyPartId, baseBody],
        [fingerPartId, baseFinger],
        [weaponLeftPartId, baseWeaponLeft],
        [weaponRightPartId, baseWeaponRight],
        [backgroundPartId, baseBackground],
        [weaponChargerPartId, baseWeaponRight],
    )

// Check:Can't equip NFT which doesn't have a slotId in NeonBase

Create NeonWeaponToken:
    weaponResourceId=1

    // Nested equipables:
    addResourceEntry( // enumerated token
        resource={
            id=weaponExtResourceIdA,
            slotPart = bytes8
            // equippableRefId=equippableweaponChargerRefId,
            metadataURI='baseWeaponExtensionURI/',
            baseAddress=NeonBase.address,
            custom=[],
        },
        fixedPartIds=[],
        slotPartIds=[],
    )
    addResourceToToken(tokenId=1, resourceId=weaponResourceId)
    addResourceToToken(tokenId=2, resourceId=weaponResourceId)
    addResourceToToken(tokenId=3, resourceId=weaponResourceId)

Create NeonWeaponTokenExtension:
    weaponExtResourceIdA=1
    weaponExtResourceIdB=1
    equippableweaponChargerRefId = 1

    setEquipableRefId(equippableWeaponChargerRefId, weaponChargerPartId, true)

    // Nested equipables:
    addResourceEntry( // enumerated token
        resource={
            id=weaponExtResourceIdA,
            equippableRefId=equippableweaponChargerRefId,
            metadataURI='baseWeaponExtensionURI/',
            baseAddress=NeonBase.address,
            custom=[],
        },
        fixedPartIds=[],
        slotPartIds=[],
    )
    // Nested equipables:
    addResourceEntry( // enumerated token
        resource={
            id=weaponExtResourceIdB,
            equippableRefId=equippableweaponChargerRefId,
            metadataURI='baseWeaponBExtensionURI/',
            baseAddress=NeonBase.address,
            custom=[],
        },
        fixedPartIds=[],
        slotPartIds=[],
    )
    addResourceToToken(tokenId=1, resourceId=weaponExtResourceIdA)
    addResourceToToken(tokenId=2, resourceId=weaponExtResourceIdA)
    addResourceToToken(tokenId=3, resourceId=weaponExtResourceIdA)

    NeonWeaponTokenExtension.transferFrom(
        from=myAddress,
        tokenId=weaponExtTokenId,
        to=NeonWeaponToken.address,
        destinationId=weaponId,
    )
    NeonWeaponToken.equip(
        tokenId=weaponId,
        targetResourceId=weaponResourceId,
        slotPartIndex=weaponChargerPartId
        childIndex, // From this we identify the token and contract being equipped
        childResourceIndex, // From this we know which of the resources. 
    )

Create NeonBackgroundToken:
    weaponResourceIdA = 1
    weaponResourceIdB = 2
    weaponResourceIdC = 3
    addResourceEntry(
        resource={id=weaponResourceIdA, equippableRefId=0, 'metaURIA', NeonBase.address, []},
        fixedPartIds=[],
        slotPartIds=[backgroundPartId],
    )
    addResourceEntry(
        resource={id=weaponResourceIdB, equippableRefId=0, 'metaURIB', NeonBase.address, []},
        fixedPartIds=[],
        slotPartIds=[backgroundPartId],
    )
    addResourceEntry(
        resource={id=weaponResourceIdC, equippableRefId=0, 'metaURIC', NeonBase.address, []},
        fixedPartIds=[],
        slotPartIds=[weaponLeftPartId, weaponRightPartId],
    )
    addResourceToToken(tokenId=1, resourceId=weaponResourceIdA)
    addResourceToToken(tokenId=2, resourceId=weaponResourceIdB)
    addResourceToToken(tokenId=3, resourceId=weaponResourceIdC)


Create NeonTrainee:
    // Mint tokens
    // Bodies:

    equippableweaponChargerRefId = 1
    addValidBasePartId(equippableweaponChargerRefId, bodyPartId)
    addResourceEntry( // Enumerated
        resource={id=bodyId, equippableRefId=equippableweaponChargerRefId, 'metaURIC', NeonBase.address, []},
        fixedPartIds=[],
        slotPartIds=[bodyPartId],
    )

    // Weapon
    equippableWeaponRefId = 1
    addValidBasePartId(equippableWeaponRefId, weaponPartId)

    transferFrom()
    equip(tokenId, weaponResourceId, weaponPartId, 1)
    
    
Given:
    
    Base NeonBase
        Equippable: all

    Base SnakesBase
        Equippable: all

    Token NeonTrainee
        Resource: 1 {
            slotPartIds: [glasses: 1, weapon: 2]
        }
        Child: 1 {
            NeonGlasses: 1
        }
        Child: 2 {
            SnakesWeapon : 1
        }
    
    Token SnakeSoldier
        Resource: 1 {
            slotPartIds: [weapon: 1, glasses: 2]
        }
    


    Token SnakesWeapon
        Resource: 1 {
            refId: 10
            slotPartIds: []
        }

        Resource: 2 {
            refId: 10
            slotPartIds: []
        }

    refId 10: {
        1: true
        2: true
        3: true
        4: true
        5: true
    }

    Options:
    refId 10 = {
        snakeBase=1
        neonBase=2
    }

    validParentSlotRef

    Token SnakesGlasses

    Token NeonWeapon
        Resource: 1 {
            SlotId: 1
            slotPartIds: []
        }

    Token NeonGlasses

    equip(NeonTrainee=1, targetResourceId=1, 0, )

    Base SnakesSword {}

        partId1 = blade1 {
            type = fixed,
            src = "blade1"
        }

        partId2 = blade2 {
            type = fixed,
            src = "blade2"
        }

        partId3 = blade3 {
            type = fixed,
            src = "blade3"
        }

        partId4 = Hilt1 {
            type = fixed,
            src = "Hilt1"
        }

        partId5 = PommelGem {
            type = slot,
            src = "PommelGem"
        }

        partId6 = PommelGem_Ruby {
            type = fixed,
            src = "PommelGem_Ruby"
        }


    Token SnakesSword {
        Token1:
            Resource1: {
                refId: 10
                fixedPartIds: [blade3, hilt1]
                slotPartIds: [pommelGem]
            }
        Child:
            Child1: pommelGem.ruby {
                Resource1 {
                    refId: 1
                    fixedPartIds: [pommelGem_Ruby]
                    slotPartIds: []
                }
            }
            Child1: pommelGem.emerald {
                Resource2 {
                    refId: 1
                    src: "pommelGem_Emerald"
                    fixedPartIds: []
                    slotPartIds: []
                }
            }
    }