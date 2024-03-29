"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransaction = void 0;
const utils_1 = require("../../utils/index.js");
const getAction_1 = require("../../utils/getAction.js");
const waitForUserOperationReceipt_1 = require("../bundler/waitForUserOperationReceipt.js");
const sendUserOperation_1 = require("./sendUserOperation.js");
async function sendTransaction(client, args) {
    const { account: account_ = client.account, data, maxFeePerGas, maxPriorityFeePerGas, to, value, nonce, sponsorUserOperation, } = args;
    if (!account_) {
        throw new utils_1.AccountOrClientNotFoundError({
            docsPath: "/docs/actions/wallet/sendTransaction",
        });
    }
    const account = (0, utils_1.parseAccount)(account_);
    if (!to)
        throw new Error("Missing to address");
    if (account.type !== "local") {
        throw new Error("RPC account type not supported");
    }
    const callData = await account.encodeCallData({
        to,
        value: value || 0n,
        data: data || "0x",
    });
    const userOpHash = await (0, getAction_1.getAction)(client, sendUserOperation_1.sendUserOperation)({
        userOperation: {
            sender: account.address,
            paymasterAndData: "0x",
            maxFeePerGas: maxFeePerGas || 0n,
            maxPriorityFeePerGas: maxPriorityFeePerGas || 0n,
            callData: callData,
            nonce: nonce ? BigInt(nonce) : undefined,
        },
        account: account,
        signature: "0x",
        sponsorUserOperation,
    });
    const userOperationReceipt = await (0, getAction_1.getAction)(client, waitForUserOperationReceipt_1.waitForUserOperationReceipt)({
        hash: userOpHash,
    });
    return userOperationReceipt?.receipt.transactionHash;
}
exports.sendTransaction = sendTransaction;
//# sourceMappingURL=sendTransaction.js.map