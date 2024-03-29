import type { Abi, Chain, Client, DeployContractParameters, Hash, Transport } from "viem";
import type { SmartAccount } from "../../accounts/types";
import type { Prettify } from "../../types";
import { type SponsorUserOperationMiddleware } from "./prepareUserOperationRequest";
export type DeployContractParametersWithPaymaster<TAbi extends Abi | readonly unknown[] = Abi | readonly unknown[], TChain extends Chain | undefined = Chain | undefined, TAccount extends SmartAccount | undefined = SmartAccount | undefined, TChainOverride extends Chain | undefined = Chain | undefined> = DeployContractParameters<TAbi, TChain, TAccount, TChainOverride> & SponsorUserOperationMiddleware;
/**
 * Deploys a contract to the network, given bytecode and constructor arguments.
 * This function also allows you to sponsor this transaction if sender is a smartAccount
 *
 * - Docs: https://viem.sh/docs/contract/deployContract.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/deploying-contracts
 *
 * @param client - Client to use
 * @param parameters - {@link DeployContractParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash.
 *
 * @example
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { deployContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await deployContract(client, {
 *   abi: [],
 *   account: '0x…,
 *   bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
 * })
 */
export declare function deployContract<TChain extends Chain | undefined, TAccount extends SmartAccount | undefined>(client: Client<Transport, TChain, TAccount>, args: Prettify<DeployContractParametersWithPaymaster>): Promise<Hash>;
//# sourceMappingURL=deployContract.d.ts.map