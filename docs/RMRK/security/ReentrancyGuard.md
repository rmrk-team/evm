# Solidity API

## RentrantCall

```solidity
error RentrantCall()
```

## ReentrancyGuard

Smart contract used to guard against potential reentrancy exploits.

_Contract module that helps prevent reentrant calls to a function.

Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
available, which can be applied to functions to make sure there are no nested
(reentrant) calls to them.

Note that because there is a single `nonReentrant` guard, functions marked as
`nonReentrant` may not call one another. This can be worked around by making
those functions `private`, and then adding `external` `nonReentrant` entry
points to them.

TIP: If you would like to learn more about reentrancy and alternative ways
to protect against it, check out our blog post
https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul]._

### constructor

```solidity
constructor() internal
```

Initializes the ReentrancyGuard with the `_status` of `_NOT_ENTERED`.

### nonReentrant

```solidity
modifier nonReentrant()
```

Used to ensure that the function it is applied to cannot be reentered.

_Prevents a contract from calling itself, directly or indirectly.
Calling a `nonReentrant` function from another `nonReentrant`
function is not supported. It is possible to prevent this from happening
by making the `nonReentrant` function external, and making it call a
`private` function that does the actual work._

