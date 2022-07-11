import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ERC721Mock, ERC721ReceiverMock } from '../../typechain';
import { BigNumber, ContractTransaction } from 'ethers';

// Based on https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC721/ERC721.behavior.js

async function shouldBehaveLikeERC721() {
  let owner: SignerWithAddress;
  let approved: SignerWithAddress;
  let anotherApproved: SignerWithAddress;
  let operator: SignerWithAddress;
  let toWhom: SignerWithAddress | ERC721ReceiverMock;
  let others: SignerWithAddress[];
  // let token: ERC721Mock;
  let receipt: ContractTransaction;
  let receiver: ERC721ReceiverMock;

  const firstTokenId = BigNumber.from(5042);
  const secondTokenId = BigNumber.from(79217);
  const nonExistentTokenId = BigNumber.from(13);
  const fourthTokenId = BigNumber.from(4);
  const baseURI = 'https://api.example.com/v1/';
  const RECEIVER_MAGIC_VALUE = '0x150b7a02';

  enum Error {
    None,
    RevertWithMessage,
    RevertWithoutMessage,
    Panic,
  }

  context('with minted tokens', function () {
    beforeEach(async function () {
      [owner, approved, anotherApproved, operator, ...others] = await ethers.getSigners();

      await this.token.mint(owner.address, firstTokenId);
      await this.token.mint(owner.address, secondTokenId);
      toWhom = others[0]; // default to other for toWhom in context-dependent tests
    });

    describe('metadata', function () {
      it('has a name', async function () {
        expect(await this.token.name()).to.be.equal(this.name);
      });

      it('has a symbol', async function () {
        expect(await this.token.symbol()).to.be.equal(this.symbol);
      });

      describe('token URI', function () {
        it('return empty SignerWithAddress by default', async function () {
          expect(await this.token.tokenURI(firstTokenId)).to.be.equal('');
        });

        it('reverts when queried for non existent token id', async function () {
          await expect(this.token.tokenURI(nonExistentTokenId)).to.be.revertedWith(
            'ERC721InvalidTokenId()',
          );
        });

        describe('base URI', function () {
          beforeEach(function () {
            if (this.token.setBaseURI === undefined) {
              this.skip();
            }
          });

          it('base URI can be set', async function () {
            await this.token.setBaseURI(baseURI);
            expect(await this.token.baseURI()).to.equal(baseURI);
          });

          it('base URI is added as a prefix to the token URI', async function () {
            await this.token.setBaseURI(baseURI);
            expect(await this.token.tokenURI(firstTokenId)).to.be.equal(
              baseURI + firstTokenId.toString(),
            );
          });

          it('token URI can be changed by changing the base URI', async function () {
            await this.token.setBaseURI(baseURI);
            const newBaseURI = 'https://api.example.com/v2/';
            await this.token.setBaseURI(newBaseURI);
            expect(await this.token.tokenURI(firstTokenId)).to.be.equal(
              newBaseURI + firstTokenId.toString(),
            );
          });
        });
      });
    });

    describe('balanceOf', function () {
      context('when the given address owns some tokens', function () {
        it('returns the amount of tokens owned by the given address', async function () {
          expect(await this.token.balanceOf(owner.address)).to.eql(BigNumber.from(2));
        });
      });

      context('when the given address does not own any tokens', function () {
        it('returns 0', async function () {
          expect(await this.token.balanceOf(others[0].address)).to.eql(BigNumber.from(0));
        });
      });

      context('when querying the zero address', function () {
        it('throws', async function () {
          await expect(this.token.balanceOf(ethers.constants.AddressZero)).to.be.revertedWith(
            'ERC721AddressZeroIsNotaValidOwner()',
          );
        });
      });
    });

    describe('ownerOf', function () {
      context('when the given token ID was tracked by this token', function () {
        const tokenId = firstTokenId;

        it('returns the owner of the given token ID', async function () {
          expect(await this.token.ownerOf(tokenId)).to.be.equal(owner.address);
        });
      });

      context('when the given token ID was not tracked by this token', function () {
        const tokenId = nonExistentTokenId;

        it('reverts', async function () {
          await expect(this.token.ownerOf(tokenId)).to.be.revertedWith('ERC721InvalidTokenId()');
        });
      });
    });

    describe('transfers', function () {
      const tokenId = firstTokenId;
      const data = '0x42';

      beforeEach(async function () {
        await this.token.approve(approved.address, tokenId);
        await this.token.setApprovalForAll(operator.address, true);
      });

      const transferWasSuccessful = function (owner: SignerWithAddress, tokenId: BigNumber) {
        it('transfers the ownership of the given token ID to the given address', async function () {
          expect(await this.token.ownerOf(tokenId)).to.be.equal(toWhom.address);
        });

        it('emits a Transfer event', async function () {
          expect(receipt)
            .to.emit(this.token, 'Transfer')
            .withArgs(owner.address, toWhom.address, tokenId);
        });

        it('clears the approval for the token ID', async function () {
          expect(await this.token.getApproved(tokenId)).to.be.equal(ethers.constants.AddressZero);
        });

        it('adjusts owners balances', async function () {
          expect(await this.token.balanceOf(owner.address)).to.eql(BigNumber.from(1));
        });
      };

      const shouldTransferTokensByUsers = function (transferFunction: any) {
        context('when called by the owner', function () {
          beforeEach(async function () {
            receipt = await transferFunction(
              this.token,
              owner.address,
              toWhom.address,
              tokenId,
              owner,
            );
          });
          afterEach(async function () {
            transferWasSuccessful(owner, tokenId);
          });
        });

        context('when called by the approved individual', function () {
          beforeEach(async function () {
            receipt = await transferFunction(
              this.token,
              owner.address,
              toWhom.address,
              tokenId,
              approved,
            );
          });
          afterEach(async function () {
            transferWasSuccessful(owner, tokenId);
          });
        });

        context('when called by the operator', function () {
          beforeEach(async function () {
            receipt = await transferFunction(
              this.token,
              owner.address,
              toWhom.address,
              tokenId,
              operator,
            );
          });
          afterEach(async function () {
            transferWasSuccessful(owner, tokenId);
          });
        });

        context('when called by the owner without an approved user', function () {
          beforeEach(async function () {
            await this.token.approve(ethers.constants.AddressZero, tokenId);
            receipt = await transferFunction(
              this.token,
              owner.address,
              toWhom.address,
              tokenId,
              operator,
            );
          });
          afterEach(async function () {
            transferWasSuccessful(owner, tokenId);
          });
        });

        context('when sent to the owner', function () {
          beforeEach(async function () {
            receipt = await transferFunction(
              this.token,
              owner.address,
              owner.address,
              tokenId,
              owner,
            );
          });

          it('keeps ownership of the token', async function () {
            expect(await this.token.ownerOf(tokenId)).to.be.equal(owner.address);
          });

          it('clears the approval for the token ID', async function () {
            expect(await this.token.getApproved(tokenId)).to.be.equal(ethers.constants.AddressZero);
          });

          it('emits only a transfer event', async function () {
            expect(receipt)
              .to.emit(this.token, 'Transfer')
              .withArgs(owner.address, owner.address, tokenId);
          });

          it('keeps the owner balance', async function () {
            expect(await this.token.balanceOf(owner.address)).to.eql(BigNumber.from(2));
          });
        });

        context('when the address of the previous owner is incorrect', function () {
          it('reverts', async function () {
            await expect(
              transferFunction(this.token, others[0].address, others[0].address, tokenId, owner),
            ).to.be.revertedWith('ERC721TransferFromIncorrectOwner()');
          });
        });

        context('when the sender is not authorized for the token id', function () {
          it('reverts', async function () {
            await expect(
              transferFunction(this.token, owner.address, others[0].address, tokenId, others[0]),
            ).to.be.revertedWith('ERC721NotApprovedOrOwner()');
          });
        });

        context('when the given token ID does not exist', function () {
          it('reverts', async function () {
            await expect(
              transferFunction(
                this.token,
                owner.address,
                others[0].address,
                nonExistentTokenId,
                owner,
              ),
            ).to.be.revertedWith('ERC721InvalidTokenId()');
          });
        });

        context('when the address to transfer the token to is the zero address', function () {
          it('reverts', async function () {
            await expect(
              transferFunction(
                this.token,
                owner.address,
                ethers.constants.AddressZero,
                tokenId,
                owner,
              ),
            ).to.be.revertedWith('ERC721TransferToTheZeroAddress()');
          });
        });
      };

      describe('via transferFrom', function () {
        shouldTransferTokensByUsers(function (
          token: ERC721Mock,
          from: string,
          to: string,
          tokenId: BigNumber,
          user: SignerWithAddress,
        ) {
          return token.connect(user).transferFrom(from, to, tokenId);
        });
      });

      describe('via safeTransferFrom', function () {
        const safeTransferFromWithData = function (
          token: ERC721Mock,
          from: string,
          to: string,
          tokenId: BigNumber,
          user: SignerWithAddress,
        ) {
          return token
            .connect(user)
            ['safeTransferFrom(address,address,uint256,bytes)'](from, to, tokenId, data);
        };

        const safeTransferFromWithoutData = function (
          token: ERC721Mock,
          from: string,
          to: string,
          tokenId: BigNumber,
          user: SignerWithAddress,
        ) {
          return token
            .connect(user)
            ['safeTransferFrom(address,address,uint256)'](from, to, tokenId);
        };

        const shouldTransferSafely = function (transferFun: any, data: any) {
          describe('to a user account', function () {
            shouldTransferTokensByUsers(transferFun);
          });

          describe('to a valid receiver contract', function () {
            beforeEach(async function () {
              const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
              receiver = await ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE, Error.None);
              await receiver.deployed();
              toWhom = receiver;
            });

            shouldTransferTokensByUsers(transferFun);

            it('calls onERC721Received', async function () {
              receipt = await transferFun(
                this.token,
                owner.address,
                receiver.address,
                tokenId,
                owner,
              );

              expect(receipt)
                .to.emit(receiver, 'Received')
                .withArgs(owner.address, owner.address, tokenId, data);
            });

            it('calls onERC721Received from approved', async function () {
              receipt = await transferFun(
                this.token,
                owner.address,
                receiver.address,
                tokenId,
                approved,
              );
              expect(receipt)
                .to.emit(receiver, 'Received')
                .withArgs(approved.address, owner.address, tokenId, data);
            });

            describe('with an invalid token id', function () {
              it('reverts', async function () {
                await expect(
                  transferFun(
                    this.token,
                    owner.address,
                    receiver.address,
                    nonExistentTokenId,
                    owner,
                  ),
                ).to.be.revertedWith('ERC721InvalidTokenId()');
              });
            });
          });
        };

        describe('with data', function () {
          shouldTransferSafely(safeTransferFromWithData, data);
        });

        describe('without data', function () {
          shouldTransferSafely(safeTransferFromWithoutData, '0x');
        });

        describe('to a receiver contract returning unexpected value', function () {
          it('reverts', async function () {
            const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
            const invalidReceiver = await ERC721Receiver.deploy(
              ethers.utils.hexZeroPad('0x42', 4),
              Error.None,
            );
            await invalidReceiver.deployed();
            await expect(
              this.token['safeTransferFrom(address,address,uint256)'](
                owner.address,
                invalidReceiver.address,
                tokenId,
              ),
            ).to.be.revertedWith('ERC721TransferToNonReceiverImplementer()');
          });
        });

        describe('to a receiver contract that reverts with message', function () {
          it('reverts', async function () {
            const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
            const revertingReceiver = await ERC721Receiver.deploy(
              ethers.utils.hexZeroPad('0x42', 4),
              Error.RevertWithMessage,
            );
            await revertingReceiver.deployed();
            await expect(
              this.token
                .connect(owner)
                ['safeTransferFrom(address,address,uint256)'](
                  owner.address,
                  revertingReceiver.address,
                  tokenId,
                ),
            ).to.be.revertedWith('ERC721ReceiverMock: reverting');
          });
        });

        describe('to a receiver contract that reverts without message', function () {
          it('reverts', async function () {
            const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
            const revertingReceiver = await ERC721Receiver.deploy(
              RECEIVER_MAGIC_VALUE,
              Error.RevertWithoutMessage,
            );
            await revertingReceiver.deployed();
            await expect(
              this.token
                .connect(owner)
                ['safeTransferFrom(address,address,uint256)'](
                  owner.address,
                  revertingReceiver.address,
                  tokenId,
                ),
            ).to.be.revertedWith('ERC721: transfer to non ERC721Receiver implementer');
          });
        });

        describe('to a receiver contract that panics', function () {
          it('reverts', async function () {
            const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
            const revertingReceiver = await ERC721Receiver.deploy(
              RECEIVER_MAGIC_VALUE,
              Error.Panic,
            );
            await revertingReceiver.deployed();
            await expect(
              this.token
                .connect(owner)
                ['safeTransferFrom(address,address,uint256)'](
                  owner.address,
                  revertingReceiver.address,
                  tokenId,
                ),
            ).to.be.reverted;
          });
        });

        describe('to a contract that does not implement the required function', function () {
          it('reverts', async function () {
            const nonReceiver = this.token;
            await expect(
              this.token['safeTransferFrom(address,address,uint256)'](
                owner.address,
                nonReceiver.address,
                tokenId,
              ),
            ).to.be.revertedWith('ERC721: transfer to non ERC721Receiver implementer');
          });
        });
      });
    });

    describe('safe mint', function () {
      const tokenId = fourthTokenId;
      const data = '0x42';

      describe('via safeMint', function () {
        // regular minting is tested in ERC721Mintable.test.js and others
        it('calls onERC721Received — with data', async function () {
          const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
          receiver = await ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE, Error.None);
          await receiver.deployed();
          const receipt = await this.token['safeMint(address,uint256,bytes)'](
            receiver.address,
            tokenId,
            data,
          );

          await expect(receipt)
            .to.emit(receiver, 'Received')
            .withArgs(owner.address, ethers.constants.AddressZero, tokenId, data);
        });
      });

      it('calls onERC721Received — without data', async function () {
        const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
        receiver = await ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE, Error.None);
        await receiver.deployed();
        const receipt = await this.token['safeMint(address,uint256)'](receiver.address, tokenId);

        await expect(receipt)
          .to.emit(receiver, 'Received')
          .withArgs(owner.address, ethers.constants.AddressZero, tokenId, '0x');
      });

      context('to a receiver contract returning unexpected value', function () {
        it('reverts', async function () {
          const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
          const invalidReceiver = await ERC721Receiver.deploy(
            ethers.utils.hexZeroPad('0x42', 4),
            Error.None,
          );
          await invalidReceiver.deployed();

          await expect(
            this.token['safeMint(address,uint256)'](invalidReceiver.address, tokenId),
          ).to.be.revertedWith('ERC721TransferToNonReceiverImplementer()');
        });
      });

      context('to a receiver contract that reverts with message', function () {
        it('reverts', async function () {
          const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
          const revertingReceiver = await ERC721Receiver.deploy(
            ethers.utils.hexZeroPad('0x42', 4),
            Error.RevertWithMessage,
          );
          await revertingReceiver.deployed();
          await expect(
            this.token
              .connect(owner)
              ['safeMint(address,uint256)'](revertingReceiver.address, tokenId),
          ).to.be.revertedWith('ERC721ReceiverMock: reverting');
        });
      });

      context('to a receiver contract that reverts without message', function () {
        it('reverts', async function () {
          const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
          const revertingReceiver = await ERC721Receiver.deploy(
            RECEIVER_MAGIC_VALUE,
            Error.RevertWithoutMessage,
          );
          await revertingReceiver.deployed();
          await expect(
            this.token
              .connect(owner)
              ['safeMint(address,uint256)'](revertingReceiver.address, tokenId),
          ).to.be.revertedWith('ERC721: transfer to non ERC721Receiver implementer');
        });
      });

      context('to a receiver contract that panics', function () {
        it('reverts', async function () {
          const ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
          const revertingReceiver = await ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE, Error.Panic);
          await revertingReceiver.deployed();
          await expect(
            this.token
              .connect(owner)
              ['safeMint(address,uint256)'](revertingReceiver.address, tokenId),
          ).to.be.reverted;
        });
      });

      context('to a contract that does not implement the required function', function () {
        it('reverts', async function () {
          const nonReceiver = this.token;
          await expect(
            this.token['safeMint(address,uint256)'](nonReceiver.address, tokenId),
          ).to.be.revertedWith('ERC721: transfer to non ERC721Receiver implementer');
        });
      });

      describe('approve', function () {
        const tokenId = firstTokenId;

        let receipt: any = null;

        const itClearsApproval = function () {
          it('clears approval for the token', async function () {
            expect(await this.token.getApproved(tokenId)).to.be.equal(ethers.constants.AddressZero);
          });
        };

        const itApproves = function (address: string) {
          it('sets the approval for the target address', async function () {
            expect(await this.token.getApproved(tokenId)).to.be.equal(address);
          });
        };

        const itEmitsApprovalEvent = function (address: string) {
          it('emits an approval event', async function () {
            expect(receipt)
              .to.emit(this.token, 'Approval')
              .withArgs(owner.address, address, tokenId);
          });
        };

        context('when clearing approval', function () {
          context('when there was no prior approval', function () {
            beforeEach(async function () {
              receipt = await this.token.approve(ethers.constants.AddressZero, tokenId);
            });

            itClearsApproval();
            itEmitsApprovalEvent(ethers.constants.AddressZero);
          });

          context('when there was a prior approval', function () {
            beforeEach(async function () {
              await this.token.approve(approved.address, tokenId);
              receipt = await this.token.approve(ethers.constants.AddressZero, tokenId);
            });

            itClearsApproval();
            itEmitsApprovalEvent(ethers.constants.AddressZero);
          });
        });

        context('when approving a non-zero address', function () {
          context('when there was no prior approval', function () {
            beforeEach(async function () {
              receipt = await this.token.approve(approved.address, tokenId);
            });

            afterEach(async function () {
              itApproves(approved.address);
              itEmitsApprovalEvent(approved.address);
            });
          });

          context('when there was a prior approval to the same address', function () {
            beforeEach(async function () {
              await this.token.approve(approved.address, tokenId);
              receipt = await this.token.approve(approved.address, tokenId);
            });

            afterEach(async function () {
              itApproves(approved.address);
              itEmitsApprovalEvent(approved.address);
            });
          });

          context('when there was a prior approval to a different address', function () {
            beforeEach(async function () {
              await this.token.approve(anotherApproved.address, tokenId);
              receipt = await this.token.approve(anotherApproved.address, tokenId);
            });

            afterEach(async function () {
              itApproves(anotherApproved.address);
              itEmitsApprovalEvent(anotherApproved.address);
            });
          });
        });

        context('when the address that receives the approval is the owner', function () {
          it('reverts', async function () {
            await expect(this.token.approve(owner.address, tokenId)).to.be.revertedWith(
              'ERC721ApprovalToCurrentOwner()',
            );
          });
        });

        context('when the sender does not own the given token ID', function () {
          it('reverts', async function () {
            await expect(
              this.token.connect(others[0]).approve(approved.address, tokenId),
            ).to.be.revertedWith('ERC721ApproveCallerIsNotOwnerNorApprovedForAll()');
          });
        });

        context('when the sender is approved for the given token ID', function () {
          it('reverts', async function () {
            await this.token.approve(approved.address, tokenId);
            await expect(
              this.token.connect(approved).approve(anotherApproved.address, tokenId),
            ).to.be.revertedWith('ERC721ApproveCallerIsNotOwnerNorApprovedForAll()');
          });
        });

        context('when the sender is an operator', function () {
          beforeEach(async function () {
            await this.token.setApprovalForAll(operator.address, true);
            receipt = await this.token.connect(operator).approve(approved.address, tokenId);
          });

          afterEach(async function () {
            itApproves(approved.address);
            itEmitsApprovalEvent(approved.address);
          });
        });

        context('when the given token ID does not exist', function () {
          it('reverts', async function () {
            await expect(
              this.token.connect(operator).approve(approved.address, nonExistentTokenId),
            ).to.be.revertedWith('ERC721InvalidTokenId()');
          });
        });
      });

      describe('setApprovalForAll', function () {
        context('when the operator willing to approve is not the owner', function () {
          context('when there is no operator approval set by the sender', function () {
            it('approves the operator', async function () {
              await this.token.setApprovalForAll(operator.address, true);

              expect(await this.token.isApprovedForAll(owner.address, operator.address)).to.equal(
                true,
              );
            });

            it('emits an approval event', async function () {
              const receipt = await this.token.setApprovalForAll(operator.address, true);

              expect(receipt)
                .to.emit(this.token, 'ApprovalForAll')
                .withArgs(owner.address, operator.address, true);
            });
          });

          context('when the operator was set as not approved', function () {
            beforeEach(async function () {
              await this.token.setApprovalForAll(operator.address, false);
            });

            it('approves the operator', async function () {
              await this.token.setApprovalForAll(operator.address, true);

              expect(await this.token.isApprovedForAll(owner.address, operator.address)).to.equal(
                true,
              );
            });

            it('emits an approval event', async function () {
              const receipt = await this.token.setApprovalForAll(operator.address, true);

              expect(receipt)
                .to.emit(this.token, 'ApprovalForAll')
                .withArgs(owner.address, operator.address, true);
            });

            it('can unset the operator approval', async function () {
              await this.token.setApprovalForAll(operator.address, false);

              expect(await this.token.isApprovedForAll(owner.address, operator.address)).to.equal(
                false,
              );
            });
          });

          context('when the operator was already approved', function () {
            beforeEach(async function () {
              await this.token.setApprovalForAll(operator.address, true);
            });

            it('keeps the approval to the given address', async function () {
              await this.token.setApprovalForAll(operator.address, true);

              expect(await this.token.isApprovedForAll(owner.address, operator.address)).to.equal(
                true,
              );
            });

            it('emits an approval event', async function () {
              const receipt = await this.token.setApprovalForAll(operator.address, true);

              expect(receipt)
                .to.emit(this.token, 'ApprovalForAll')
                .withArgs(owner.address, operator.address, true);
            });
          });
        });

        context('when the operator is the owner', function () {
          it('reverts', async function () {
            await expect(this.token.setApprovalForAll(owner.address, true)).to.be.revertedWith(
              'ERC721ApproveToCaller()',
            );
          });
        });
      });

      describe('getApproved', async function () {
        context('when token is not minted', async function () {
          it('reverts', async function () {
            await expect(this.token.getApproved(nonExistentTokenId)).to.be.revertedWith(
              'ERC721InvalidTokenId()',
            );
          });
        });

        context('when token has been minted ', async function () {
          it('should return the zero address', async function () {
            expect(await this.token.getApproved(firstTokenId)).to.be.equal(
              ethers.constants.AddressZero,
            );
          });

          context('when account has been approved', async function () {
            beforeEach(async function () {
              await this.token.approve(approved.address, firstTokenId);
            });

            it('returns approved account', async function () {
              expect(await this.token.getApproved(firstTokenId)).to.be.equal(approved.address);
            });
          });
        });
      });
    });
  });

  context('_mint(address, uint256)', function () {
    beforeEach(async function () {
      [owner, ...others] = await ethers.getSigners();
    });

    it('reverts with a null destination address', async function () {
      await expect(this.token.mint(ethers.constants.AddressZero, firstTokenId)).to.be.revertedWith(
        'ERC721MintToTheZeroAddress()',
      );
    });

    context('with minted token', async function () {
      beforeEach(async function () {
        receipt = await this.token.mint(owner.address, firstTokenId);
      });

      it('emits a Transfer event', function () {
        expect(receipt)
          .to.emit(this.token, 'Transfer')
          .withArgs(ethers.constants.AddressZero, owner.address, firstTokenId);
      });

      it('creates the token', async function () {
        expect(await this.token.balanceOf(owner.address)).to.eql(BigNumber.from(1));
        expect(await this.token.ownerOf(firstTokenId)).to.equal(owner.address);
      });

      it('reverts when adding a token id that already exists', async function () {
        await expect(this.token.mint(owner.address, firstTokenId)).to.be.revertedWith(
          'ERC721TokenAlreadyMinted()',
        );
      });
    });
  });

  context('_burn', function () {
    beforeEach(async function () {
      [owner, ...others] = await ethers.getSigners();
    });

    it('reverts when burning a non-existent token id', async function () {
      await expect(this.token.burn(nonExistentTokenId)).to.be.revertedWith(
        'ERC721InvalidTokenId()',
      );
    });

    context('with minted tokens', function () {
      beforeEach(async function () {
        await this.token.mint(owner.address, firstTokenId);
        await this.token.mint(owner.address, secondTokenId);
      });

      context('with burnt token', function () {
        beforeEach(async function () {
          receipt = await this.token.burn(firstTokenId);
        });

        it('emits a Transfer event', function () {
          expect(receipt)
            .to.emit(this.token, 'Transfer')
            .withArgs(owner.address, ethers.constants.AddressZero, firstTokenId);
        });

        it('emits an Approval event', function () {
          expect(receipt)
            .to.emit(this.token, 'Approval')
            .withArgs(owner.address, ethers.constants.AddressZero, firstTokenId);
        });

        it('deletes the token', async function () {
          expect(await this.token.balanceOf(owner.address)).to.eql(BigNumber.from(1));
          await expect(this.token.ownerOf(firstTokenId)).to.be.revertedWith(
            'ERC721InvalidTokenId()',
          );
        });

        it('reverts when burning a token id that has been deleted', async function () {
          await expect(this.token.burn(firstTokenId)).to.be.revertedWith('ERC721InvalidTokenId()');
        });
      });
    });
  });
}

export default shouldBehaveLikeERC721;
