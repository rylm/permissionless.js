import type { TypedData } from "viem";
import {
  type Address,
  type Chain,
  type Client,
  type Hex,
  type Transport,
  // @ts-ignore
  type TypedDataDefinition,
  concatHex,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  getContractAddress,
  hexToBigInt,
  keccak256,
  parseAbiParameters,
} from "viem";
import { toAccount } from "viem/accounts";
import { getChainId } from "viem/actions";
import { getAccountNonce } from "../../actions/public/getAccountNonce";
import type { Prettify, UserOperation } from "../../types";
import { getUserOperationHash } from "../../utils/getUserOperationHash";
import { isSmartAccountDeployed } from "../../utils/isSmartAccountDeployed";
import {
  SignTransactionNotSupportedBySmartAccount,
  type SmartAccount,
  type SmartAccountSigner,
} from "../types";
import {
  BiconomyExecuteAbi,
  BiconomyInitAbi,
} from "./abi/BiconomySmartAccountAbi";
// import Abis

export type BiconomySmartAccount<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined
> = SmartAccount<"biconomySmartAccount", transport, chain>;

/**
 * The account creation ABI for Biconomy Smart Account (from the biconomy SmartAccountFactory)
 */

const createAccountAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "moduleSetupContract",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "moduleSetupData",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "deployCounterFactualAccount",
    outputs: [
      {
        internalType: "address",
        name: "proxy",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Default addresses for Biconomy Smart Account
 */
const BICONOMY_ADDRESSES: {
  PASSKEY_REGISTRY_MODULE: Address;
  ACCOUNT_V2_0_LOGIC: Address;
  FACTORY_ADDRESS: Address;
  DEFAULT_FALLBACK_HANDLER_ADDRESS: Address;
} = {
  PASSKEY_REGISTRY_MODULE: "0xF944D221736518F4438C618c9f571b3B5d9fdB0F",
  ACCOUNT_V2_0_LOGIC: "0x0000002512019Dafb59528B82CB92D3c5D2423aC",
  FACTORY_ADDRESS: "0x000000a56Aaca3e9a4C479ea6b6CD0DbcB6634F5",
  DEFAULT_FALLBACK_HANDLER_ADDRESS:
    "0x0bBa6d96BD616BedC6BFaa341742FD43c60b83C1",
};

const BICONOMY_PROXY_CREATION_CODE =
  "0x6080346100aa57601f61012038819003918201601f19168301916001600160401b038311848410176100af578084926020946040528339810103126100aa57516001600160a01b0381168082036100aa5715610065573055604051605a90816100c68239f35b60405162461bcd60e51b815260206004820152601e60248201527f496e76616c696420696d706c656d656e746174696f6e206164647265737300006044820152606490fd5b600080fd5b634e487b7160e01b600052604160045260246000fdfe608060405230546000808092368280378136915af43d82803e156020573d90f35b3d90fdfea2646970667358221220a03b18dce0be0b4c9afe58a9eb85c35205e2cf087da098bbf1d23945bf89496064736f6c63430008110033";

/**
 * Get the account initialization code for Biconomy smart account with ECDSA as default authorization module
 * @param owner
 * @param index
 * @param factoryAddress
 * @param ecdsaValidatorAddress
 */
const getAccountInitCode = async ({
  _pubKeyX,
  _pubKeyY,
  _keyId,
  index,
  factoryAddress,
  passkeyModuleAddress,
}: {
  _pubKeyX: bigint;
  _pubKeyY: bigint;
  _keyId: string;
  index: bigint;
  factoryAddress: Address;
  passkeyModuleAddress: Address;
}): Promise<Hex> => {
  // Build the module setup data
  const passkeyInitData = encodeFunctionData({
    abi: BiconomyInitAbi,
    functionName: "initForSmartAccount",
    args: [_pubKeyX, _pubKeyY, _keyId],
  });

  // Build the account init code
  return concatHex([
    factoryAddress,
    encodeFunctionData({
      abi: createAccountAbi,
      functionName: "deployCounterFactualAccount",
      args: [passkeyModuleAddress, passkeyInitData, index],
    }) as Hex,
  ]);
};

const getAccountAddress = async ({
  factoryAddress,
  accountLogicAddress,
  fallbackHandlerAddress,
  passkeyModuleAddress,
  _pubKeyX,
  _pubKeyY,
  _keyId,
  index = 0n,
}: {
  factoryAddress: Address;
  accountLogicAddress: Address;
  fallbackHandlerAddress: Address;
  passkeyModuleAddress: Address;
  _pubKeyX: bigint;
  _pubKeyY: bigint;
  _keyId: string;
  index?: bigint;
}): Promise<Address> => {
  // Build the module setup data
  const passkeyInitData = encodeFunctionData({
    abi: BiconomyInitAbi,
    functionName: "initForSmartAccount",
    args: [_pubKeyX, _pubKeyY, _keyId],
  });

  // Build account init code
  const initialisationData = encodeFunctionData({
    abi: BiconomyInitAbi,
    functionName: "init",
    args: [fallbackHandlerAddress, passkeyModuleAddress, passkeyInitData],
  });

  const deploymentCode = encodePacked(
    ["bytes", "uint256"],
    [BICONOMY_PROXY_CREATION_CODE, hexToBigInt(accountLogicAddress)]
  );

  const salt = keccak256(
    encodePacked(
      ["bytes32", "uint256"],
      [keccak256(encodePacked(["bytes"], [initialisationData])), index]
    )
  );

  return getContractAddress({
    from: factoryAddress,
    salt,
    bytecode: deploymentCode,
    opcode: "CREATE2",
  });
};

export type SignerToBiconomySmartAccountParameters<
  TSource extends string = "custom",
  TAddress extends Address = Address
> = Prettify<{
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
export async function signerToBiconomySmartAccount<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSource extends string = "custom",
  TAddress extends Address = Address
>(
  client: Client<TTransport, TChain, undefined>,
  {
    address,
    entryPoint,
    index = 0n,
    factoryAddress = BICONOMY_ADDRESSES.FACTORY_ADDRESS,
    accountLogicAddress = BICONOMY_ADDRESSES.ACCOUNT_V2_0_LOGIC,
    fallbackHandlerAddress = BICONOMY_ADDRESSES.DEFAULT_FALLBACK_HANDLER_ADDRESS,
    passkeyModuleAddress = BICONOMY_ADDRESSES.PASSKEY_REGISTRY_MODULE,
  }: Omit<SignerToBiconomySmartAccountParameters<TSource, TAddress>, "signer">,
  _pubKeyX: bigint,
  _pubKeyY: bigint,
  _keyId: string
): Promise<BiconomySmartAccount<TTransport, TChain>> {
  // Helper to generate the init code for the smart account
  const generateInitCode = (
    _pubKeyX: bigint,
    _pubKeyY: bigint,
    _keyId: string
  ) =>
    getAccountInitCode({
      _pubKeyX,
      _pubKeyY,
      _keyId,
      index,
      factoryAddress,
      passkeyModuleAddress,
    });

  // Fetch account address and chain id
  const [accountAddress, chainId] = await Promise.all([
    address ??
      getAccountAddress({
        passkeyModuleAddress,
        factoryAddress,
        accountLogicAddress,
        fallbackHandlerAddress,
        _pubKeyX,
        _pubKeyY,
        _keyId,
        index,
      }),
    getChainId(client),
  ]);

  if (!accountAddress) throw new Error("Account address not found");

  let smartAccountDeployed = await isSmartAccountDeployed(
    client,
    accountAddress
  );

  // Build the EOA Signer
  const account = toAccount({
    address: accountAddress,
    async signMessage({}) {
      throw new Error("Not implemented");
    },
    async signTransaction(_, __) {
      throw new SignTransactionNotSupportedBySmartAccount();
    },
    async signTypedData<
      const TTypedData extends TypedData | Record<string, unknown>,
      // @ts-ignore
      TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData
      // @ts-ignore
    >(typedData: TypedDataDefinition<TTypedData, TPrimaryType>) {
      throw new Error("Not implemented");
    },
  });

  return {
    ...account,
    client: client,
    publicKey: accountAddress,
    entryPoint: entryPoint,
    source: "biconomySmartAccount",

    // Get the nonce of the smart account
    async getNonce() {
      return getAccountNonce(client, {
        sender: accountAddress,
        entryPoint: entryPoint,
      });
    },

    async getUserOpHash(userOperation: UserOperation) {
      return getUserOperationHash({
        userOperation: {
          ...userOperation,
          signature: "0x",
        },
        entryPoint: entryPoint,
        chainId: chainId,
      });
    },

    // Sign a user operation
    async getSignatureWithModuleAddress(signature: `0x${string}`) {
      // const signature = await signMessage(client, {
      //   account: viemSigner,
      //   message: { raw: hash },
      // });
      // userOp signature is encoded module signature + module address
      const signatureWithModuleAddress = encodeAbiParameters(
        parseAbiParameters("bytes, address"),
        [signature, passkeyModuleAddress]
      );
      return signatureWithModuleAddress;
    },

    // Encode the init code
    async getInitCode() {
      if (smartAccountDeployed) return "0x";

      smartAccountDeployed = await isSmartAccountDeployed(
        client,
        accountAddress
      );

      if (smartAccountDeployed) return "0x";

      return generateInitCode(_pubKeyX, _pubKeyY, _keyId);
    },

    // Encode the deploy call data
    async encodeDeployCallData(_) {
      throw new Error("Doesn't support account deployment");
    },

    // Encode a call
    async encodeCallData(args) {
      if (Array.isArray(args)) {
        // Encode a batched call
        const argsArray = args as {
          to: Address;
          value: bigint;
          data: Hex;
        }[];

        return encodeFunctionData({
          abi: BiconomyExecuteAbi,
          functionName: "executeBatch_y6U",
          args: [
            argsArray.map((a) => a.to),
            argsArray.map((a) => a.value),
            argsArray.map((a) => a.data),
          ],
        });
      }
      const { to, value, data } = args as {
        to: Address;
        value: bigint;
        data: Hex;
      };
      // Encode a simple call
      return encodeFunctionData({
        abi: BiconomyExecuteAbi,
        functionName: "execute_ncC",
        args: [to, value, data],
      });
    },

    // Get simple dummy signature for ECDSA module authorization
    async getDummySignature(_userOperation) {
      const moduleAddress = BICONOMY_ADDRESSES.PASSKEY_REGISTRY_MODULE;
      const dynamicPart = moduleAddress.substring(2).padEnd(40, "0");
      return `0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000${dynamicPart}000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000`;
    },
  };
}
