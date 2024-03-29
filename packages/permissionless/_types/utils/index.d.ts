import type { Account, Address } from "viem";
import { deepHexlify, transactionReceiptStatus } from "./deepHexlify";
import { getAction } from "./getAction";
import { getAddressFromInitCodeOrPaymasterAndData } from "./getAddressFromInitCodeOrPaymasterAndData";
import { type GetRequiredPrefundReturnType, getRequiredPrefund } from "./getRequiredPrefund";
import { type GetUserOperationHashParams, getUserOperationHash } from "./getUserOperationHash";
import { isSmartAccountDeployed } from "./isSmartAccountDeployed";
import { providerToSmartAccountSigner } from "./providerToSmartAccountSigner";
import { AccountOrClientNotFoundError, type SignUserOperationHashWithECDSAParams, signUserOperationHashWithECDSA } from "./signUserOperationHashWithECDSA";
import { walletClientToSmartAccountSigner } from "./walletClientToSmartAccountSigner";
export declare function parseAccount(account: Address | Account): Account;
export { transactionReceiptStatus, deepHexlify, getAction, getUserOperationHash, getRequiredPrefund, walletClientToSmartAccountSigner, type GetRequiredPrefundReturnType, type GetUserOperationHashParams, signUserOperationHashWithECDSA, type SignUserOperationHashWithECDSAParams, AccountOrClientNotFoundError, isSmartAccountDeployed, providerToSmartAccountSigner, getAddressFromInitCodeOrPaymasterAndData };
//# sourceMappingURL=index.d.ts.map