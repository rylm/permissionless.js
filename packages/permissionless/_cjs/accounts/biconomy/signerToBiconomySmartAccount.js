"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signerToBiconomySmartAccount = void 0;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const actions_1 = require("viem/actions");
const getAccountNonce_1 = require("../../actions/public/getAccountNonce.js");
const getUserOperationHash_1 = require("../../utils/getUserOperationHash.js");
const isSmartAccountDeployed_1 = require("../../utils/isSmartAccountDeployed.js");
const types_1 = require("../types.js");
const BiconomySmartAccountAbi_1 = require("./abi/BiconomySmartAccountAbi.js");
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
];
const BICONOMY_ADDRESSES = {
    PASSKEY_REGISTRY_MODULE: "0xF944D221736518F4438C618c9f571b3B5d9fdB0F",
    ACCOUNT_V2_0_LOGIC: "0x0000002512019Dafb59528B82CB92D3c5D2423aC",
    FACTORY_ADDRESS: "0x000000a56Aaca3e9a4C479ea6b6CD0DbcB6634F5",
    DEFAULT_FALLBACK_HANDLER_ADDRESS: "0x0bBa6d96BD616BedC6BFaa341742FD43c60b83C1",
};
const BICONOMY_PROXY_CREATION_CODE = "0x6080346100aa57601f61012038819003918201601f19168301916001600160401b038311848410176100af578084926020946040528339810103126100aa57516001600160a01b0381168082036100aa5715610065573055604051605a90816100c68239f35b60405162461bcd60e51b815260206004820152601e60248201527f496e76616c696420696d706c656d656e746174696f6e206164647265737300006044820152606490fd5b600080fd5b634e487b7160e01b600052604160045260246000fdfe608060405230546000808092368280378136915af43d82803e156020573d90f35b3d90fdfea2646970667358221220a03b18dce0be0b4c9afe58a9eb85c35205e2cf087da098bbf1d23945bf89496064736f6c63430008110033";
const getAccountInitCode = async ({ _pubKeyX, _pubKeyY, _keyId, index, factoryAddress, passkeyModuleAddress, }) => {
    const passkeyInitData = (0, viem_1.encodeFunctionData)({
        abi: BiconomySmartAccountAbi_1.BiconomyInitAbi,
        functionName: "initForSmartAccount",
        args: [_pubKeyX, _pubKeyY, _keyId],
    });
    return (0, viem_1.concatHex)([
        factoryAddress,
        (0, viem_1.encodeFunctionData)({
            abi: createAccountAbi,
            functionName: "deployCounterFactualAccount",
            args: [passkeyModuleAddress, passkeyInitData, index],
        }),
    ]);
};
const getAccountAddress = async ({ factoryAddress, accountLogicAddress, fallbackHandlerAddress, passkeyModuleAddress, _pubKeyX, _pubKeyY, _keyId, index = 0n, }) => {
    const passkeyInitData = (0, viem_1.encodeFunctionData)({
        abi: BiconomySmartAccountAbi_1.BiconomyInitAbi,
        functionName: "initForSmartAccount",
        args: [_pubKeyX, _pubKeyY, _keyId],
    });
    const initialisationData = (0, viem_1.encodeFunctionData)({
        abi: BiconomySmartAccountAbi_1.BiconomyInitAbi,
        functionName: "init",
        args: [fallbackHandlerAddress, passkeyModuleAddress, passkeyInitData],
    });
    const deploymentCode = (0, viem_1.encodePacked)(["bytes", "uint256"], [BICONOMY_PROXY_CREATION_CODE, (0, viem_1.hexToBigInt)(accountLogicAddress)]);
    const salt = (0, viem_1.keccak256)((0, viem_1.encodePacked)(["bytes32", "uint256"], [(0, viem_1.keccak256)((0, viem_1.encodePacked)(["bytes"], [initialisationData])), index]));
    return (0, viem_1.getContractAddress)({
        from: factoryAddress,
        salt,
        bytecode: deploymentCode,
        opcode: "CREATE2",
    });
};
async function signerToBiconomySmartAccount(client, { address, entryPoint, index = 0n, factoryAddress = BICONOMY_ADDRESSES.FACTORY_ADDRESS, accountLogicAddress = BICONOMY_ADDRESSES.ACCOUNT_V2_0_LOGIC, fallbackHandlerAddress = BICONOMY_ADDRESSES.DEFAULT_FALLBACK_HANDLER_ADDRESS, passkeyModuleAddress = BICONOMY_ADDRESSES.PASSKEY_REGISTRY_MODULE, }, _pubKeyX, _pubKeyY, _keyId) {
    const generateInitCode = (_pubKeyX, _pubKeyY, _keyId) => getAccountInitCode({
        _pubKeyX,
        _pubKeyY,
        _keyId,
        index,
        factoryAddress,
        passkeyModuleAddress,
    });
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
        (0, actions_1.getChainId)(client),
    ]);
    if (!accountAddress)
        throw new Error("Account address not found");
    let smartAccountDeployed = await (0, isSmartAccountDeployed_1.isSmartAccountDeployed)(client, accountAddress);
    const account = (0, accounts_1.toAccount)({
        address: accountAddress,
        async signMessage({}) {
            throw new Error("Not implemented");
        },
        async signTransaction(_, __) {
            throw new types_1.SignTransactionNotSupportedBySmartAccount();
        },
        async signTypedData(typedData) {
            throw new Error("Not implemented");
        },
    });
    return {
        ...account,
        client: client,
        publicKey: accountAddress,
        entryPoint: entryPoint,
        source: "biconomySmartAccount",
        async getNonce() {
            return (0, getAccountNonce_1.getAccountNonce)(client, {
                sender: accountAddress,
                entryPoint: entryPoint,
            });
        },
        async getUserOpHash(userOperation) {
            return (0, getUserOperationHash_1.getUserOperationHash)({
                userOperation: {
                    ...userOperation,
                    signature: "0x",
                },
                entryPoint: entryPoint,
                chainId: chainId,
            });
        },
        async getSignatureWithModuleAddress(signature) {
            const signatureWithModuleAddress = (0, viem_1.encodeAbiParameters)((0, viem_1.parseAbiParameters)("bytes, address"), [signature, passkeyModuleAddress]);
            return signatureWithModuleAddress;
        },
        async getInitCode() {
            if (smartAccountDeployed)
                return "0x";
            smartAccountDeployed = await (0, isSmartAccountDeployed_1.isSmartAccountDeployed)(client, accountAddress);
            if (smartAccountDeployed)
                return "0x";
            return generateInitCode(_pubKeyX, _pubKeyY, _keyId);
        },
        async encodeDeployCallData(_) {
            throw new Error("Doesn't support account deployment");
        },
        async encodeCallData(args) {
            if (Array.isArray(args)) {
                const argsArray = args;
                return (0, viem_1.encodeFunctionData)({
                    abi: BiconomySmartAccountAbi_1.BiconomyExecuteAbi,
                    functionName: "executeBatch_y6U",
                    args: [
                        argsArray.map((a) => a.to),
                        argsArray.map((a) => a.value),
                        argsArray.map((a) => a.data),
                    ],
                });
            }
            const { to, value, data } = args;
            return (0, viem_1.encodeFunctionData)({
                abi: BiconomySmartAccountAbi_1.BiconomyExecuteAbi,
                functionName: "execute_ncC",
                args: [to, value, data],
            });
        },
        async getDummySignature(_userOperation) {
            const moduleAddress = BICONOMY_ADDRESSES.PASSKEY_REGISTRY_MODULE;
            const dynamicPart = moduleAddress.substring(2).padEnd(40, "0");
            return `0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000${dynamicPart}000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000`;
        },
    };
}
exports.signerToBiconomySmartAccount = signerToBiconomySmartAccount;
//# sourceMappingURL=signerToBiconomySmartAccount.js.map