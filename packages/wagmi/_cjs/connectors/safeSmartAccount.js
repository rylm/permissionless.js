"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeSmartAccount = void 0;
const accounts_1 = require("permissionless/accounts");
const simpleSmartAccount_1 = require("./simpleSmartAccount");
async function safeSmartAccount({ publicClient, signer, bundlerTransport, sponsorUserOperation, ...rest }) {
    return (0, simpleSmartAccount_1.smartAccountConnectorHelper)({
        account: await (0, accounts_1.signerToSafeSmartAccount)(publicClient, {
            ...rest,
            signer
        }),
        publicClient,
        bundlerTransport,
        sponsorUserOperation
    });
}
exports.safeSmartAccount = safeSmartAccount;
//# sourceMappingURL=safeSmartAccount.js.map