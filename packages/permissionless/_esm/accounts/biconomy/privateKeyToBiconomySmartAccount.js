import {} from "viem";
import { signerToBiconomySmartAccount, } from "./signerToBiconomySmartAccount.js";
/**
 * @description Creates a Biconomy Smart Account from a private key.
 *
 * @returns A Private Key Biconomy Smart Account using ECDSA as default validation module.
 */
export async function privateKeyToBiconomySmartAccount(client, { ...rest }, _pubKeyX, _pubKeyY, _keyId) {
    return signerToBiconomySmartAccount(client, {
        ...rest,
    }, _pubKeyX, _pubKeyY, _keyId);
}
//# sourceMappingURL=privateKeyToBiconomySmartAccount.js.map