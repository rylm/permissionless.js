import { type Address, type Chain, type Client, type Hex, type Transport } from "viem";
import type { Prettify, UserOperation } from "../../types";
import { type SmartAccount, type SmartAccountSigner } from "../types";
export type BiconomySmartAccount<transport extends Transport = Transport, chain extends Chain | undefined = Chain | undefined> = SmartAccount<"biconomySmartAccount", transport, chain>;
export type SignerToBiconomySmartAccountParameters<TSource extends string = "custom", TAddress extends Address = Address> = Prettify<{
    signer: SmartAccountSigner<TSource, TAddress>;
    entryPoint: Address;
    address?: Address;
    index?: bigint;
    factoryAddress?: Address;
    accountLogicAddress?: Address;
    fallbackHandlerAddress?: Address;
    passkeyModuleAddress?: Address;
}>;
/**
 * Build a Biconomy modular smart account from a private key, that use the ECDSA signer behind the scene
 * @param client
 * @param privateKey
 * @param entryPoint
 * @param index
 * @param factoryAddress
 * @param accountLogicAddress
 * @param ecdsaModuleAddress
 */
export declare function signerToBiconomySmartAccount<TTransport extends Transport = Transport, TChain extends Chain | undefined = Chain | undefined, TSource extends string = "custom", TAddress extends Address = Address>(client: Client<TTransport, TChain, undefined>, { address, entryPoint, index, factoryAddress, accountLogicAddress, fallbackHandlerAddress, passkeyModuleAddress, }: Omit<SignerToBiconomySmartAccountParameters<TSource, TAddress>, "signer">, _pubKeyX: bigint, _pubKeyY: bigint, _keyId: string): Promise<Omit<BiconomySmartAccount<TTransport, TChain>, "signUserOperation"> & {
    getSignatureWithModuleAddress: (signature: `0x${string}`) => Promise<Hex>;
    getUserOpHash: (userOperation: UserOperation) => Promise<Hex>;
}>;
//# sourceMappingURL=signerToBiconomySmartAccount.d.ts.map