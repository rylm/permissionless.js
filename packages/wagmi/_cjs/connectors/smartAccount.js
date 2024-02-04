"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartAccount = void 0;
const permissionless_1 = require("permissionless");
const wagmi_1 = require("wagmi");
function smartAccount({ smartAccountClient, id = smartAccountClient.uid, name = smartAccountClient.name, type = "smart-account" }) {
    smartAccountClient.estimateGas = () => {
        return undefined;
    };
    return (0, wagmi_1.createConnector)((config) => ({
        id,
        name,
        type,
        async connect({ chainId } = {}) {
            if (chainId && chainId !== (await this.getChainId())) {
                throw new Error(`Invalid chainId ${chainId} requested`);
            }
            return {
                accounts: [smartAccountClient.account.address],
                chainId: await this.getChainId()
            };
        },
        async disconnect() { },
        async getAccounts() {
            return [smartAccountClient.account.address];
        },
        getChainId() {
            return (0, permissionless_1.chainId)(smartAccountClient);
        },
        async getProvider() { },
        async isAuthorized() {
            return !!smartAccountClient.account.address;
        },
        onAccountsChanged() {
        },
        onChainChanged() {
        },
        onDisconnect() {
            config.emitter.emit("disconnect");
        },
        async getClient({ chainId: requestedChainId }) {
            const chainId = await this.getChainId();
            if (requestedChainId !== chainId) {
                throw new Error(`Invalid chainId ${chainId} requested`);
            }
            return smartAccountClient;
        }
    }));
}
exports.smartAccount = smartAccount;
//# sourceMappingURL=smartAccount.js.map