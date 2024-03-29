import type { Address, Chain, Client, Hash, Hex, Transport } from "viem";
import { type SmartAccount } from "../../accounts/types";
import type { GetAccountParameter, Prettify } from "../../types";
import { type SponsorUserOperationMiddleware } from "./prepareUserOperationRequest";
export type SendTransactionsWithPaymasterParameters<TAccount extends SmartAccount | undefined = SmartAccount | undefined> = {
    transactions: {
        to: Address;
        value: bigint;
        data: Hex;
    }[];
} & GetAccountParameter<TAccount> & SponsorUserOperationMiddleware & {
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    nonce?: bigint;
};
/**
 * Creates, signs, and sends a new transactions to the network.
 * This function also allows you to sponsor this transaction if sender is a smartAccount
 *
 * @param client - Client to use
 * @param parameters - {@link SendTransactionParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash.
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await sendTransaction(client, [{
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * }, {
 *   to: '0x61897970c51812dc3a010c7d01b50e0d17dc1234',
 *   value: 10000000000000000n,
 * }])
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await sendTransactions(client, [{
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * }, {
 *   to: '0x61897970c51812dc3a010c7d01b50e0d17dc1234',
 *   value: 10000000000000000n,
 * }])
 */
export declare function sendTransactions<TChain extends Chain | undefined, TAccount extends SmartAccount | undefined>(client: Client<Transport, TChain, TAccount>, args: Prettify<SendTransactionsWithPaymasterParameters<TAccount>>): Promise<Hash>;
//# sourceMappingURL=sendTransactions.d.ts.map