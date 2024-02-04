"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleSmartAccount = exports.smartAccountConnectorHelper = void 0;
const permissionless_1 = require("permissionless");
const accounts_1 = require("permissionless/accounts");
const smartAccount_1 = require("./smartAccount");
async function smartAccountConnectorHelper({ bundlerTransport, sponsorUserOperation, account }) {
    const smartAccountClient = (0, permissionless_1.createSmartAccountClient)({
        account,
        transport: bundlerTransport,
        sponsorUserOperation: sponsorUserOperation
    });
    return (0, smartAccount_1.smartAccount)({
        smartAccountClient: smartAccountClient
    });
}
exports.smartAccountConnectorHelper = smartAccountConnectorHelper;
async function simpleSmartAccount({ publicClient, signer, bundlerTransport, sponsorUserOperation, ...rest }) {
    return smartAccountConnectorHelper({
        account: await (0, accounts_1.signerToSimpleSmartAccount)(publicClient, {
            ...rest,
            signer
        }),
        publicClient,
        bundlerTransport,
        sponsorUserOperation
    });
}
exports.simpleSmartAccount = simpleSmartAccount;
//# sourceMappingURL=simpleSmartAccount.js.map