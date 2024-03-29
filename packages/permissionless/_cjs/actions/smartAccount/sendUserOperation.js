"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOperationWithoutSignature = exports.sendUserOperation = void 0;
const utils_1 = require("../../utils/index.js");
const getAction_1 = require("../../utils/getAction.js");
const sendUserOperation_1 = require("../bundler/sendUserOperation.js");
const prepareUserOperationRequest_1 = require("./prepareUserOperationRequest.js");
async function sendUserOperation(client, args) {
    const { account: account_ = client.account, signature } = args;
    if (!account_)
        throw new utils_1.AccountOrClientNotFoundError();
    const account = (0, utils_1.parseAccount)(account_);
    const userOperation = await (0, getAction_1.getAction)(client, prepareUserOperationRequest_1.prepareUserOperationRequest)(args);
    userOperation.signature = signature;
    return (0, sendUserOperation_1.sendUserOperation)(client, {
        userOperation: userOperation,
        entryPoint: account.entryPoint,
    });
}
exports.sendUserOperation = sendUserOperation;
async function getUserOperationWithoutSignature(client, args) {
    const { account: account_ = client.account } = args;
    if (!account_)
        throw new utils_1.AccountOrClientNotFoundError();
    return await (0, getAction_1.getAction)(client, prepareUserOperationRequest_1.prepareUserOperationRequest)(args);
}
exports.getUserOperationWithoutSignature = getUserOperationWithoutSignature;
//# sourceMappingURL=sendUserOperation.js.map