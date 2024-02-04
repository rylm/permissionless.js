"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateKeyToBiconomySmartAccount = void 0;
const signerToBiconomySmartAccount_1 = require("./signerToBiconomySmartAccount.js");
async function privateKeyToBiconomySmartAccount(client, { ...rest }, _pubKeyX, _pubKeyY, _keyId) {
    return (0, signerToBiconomySmartAccount_1.signerToBiconomySmartAccount)(client, {
        ...rest,
    }, _pubKeyX, _pubKeyY, _keyId);
}
exports.privateKeyToBiconomySmartAccount = privateKeyToBiconomySmartAccount;
//# sourceMappingURL=privateKeyToBiconomySmartAccount.js.map