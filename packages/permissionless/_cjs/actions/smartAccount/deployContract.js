"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployContract = void 0;
const utils_1 = require("../../utils/index.js");
const getAction_1 = require("../../utils/getAction.js");
const signUserOperationHashWithECDSA_1 = require("../../utils/signUserOperationHashWithECDSA.js");
const waitForUserOperationReceipt_1 = require("../bundler/waitForUserOperationReceipt.js");
const sendUserOperation_1 = require("./sendUserOperation.js");
async function deployContract(client, args) {
    const { abi, args: constructorArgs, bytecode, sponsorUserOperation, ...request } = args;
    const { account: account_ = client.account } = request;
    if (!account_) {
        throw new signUserOperationHashWithECDSA_1.AccountOrClientNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction",
        });
    }
    const account = (0, utils_1.parseAccount)(account_);
    const userOpHash = await (0, getAction_1.getAction)(client, sendUserOperation_1.sendUserOperation)({
        userOperation: {
            sender: account.address,
            paymasterAndData: "0x",
            maxFeePerGas: request.maxFeePerGas || 0n,
            maxPriorityFeePerGas: request.maxPriorityFeePerGas || 0n,
            callData: await account.encodeDeployCallData({
                abi,
                bytecode,
                args: constructorArgs,
            }),
        },
        signature: "0x",
        account: account,
        sponsorUserOperation,
    });
    const userOperationReceipt = await (0, getAction_1.getAction)(client, waitForUserOperationReceipt_1.waitForUserOperationReceipt)({
        hash: userOpHash,
    });
    return userOperationReceipt?.receipt.transactionHash;
}
exports.deployContract = deployContract;
//# sourceMappingURL=deployContract.js.map