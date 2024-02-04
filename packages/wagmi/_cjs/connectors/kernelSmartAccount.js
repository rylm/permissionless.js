"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kernelSmartAccount = void 0;
const accounts_1 = require("permissionless/accounts");
const simpleSmartAccount_1 = require("./simpleSmartAccount");
async function kernelSmartAccount({ publicClient, signer, bundlerTransport, sponsorUserOperation, ...rest }) {
    return (0, simpleSmartAccount_1.smartAccountConnectorHelper)({
        account: await (0, accounts_1.signerToEcdsaKernelSmartAccount)(publicClient, {
            ...rest,
            signer
        }),
        publicClient,
        bundlerTransport,
        sponsorUserOperation
    });
}
exports.kernelSmartAccount = kernelSmartAccount;
//# sourceMappingURL=kernelSmartAccount.js.map