import { AccountOrClientNotFoundError, parseAccount } from "../../utils/index.js";
import { getAction } from "../../utils/getAction.js";
import { sendUserOperation as sendUserOperationBundler } from "../bundler/sendUserOperation.js";
import { prepareUserOperationRequest, } from "./prepareUserOperationRequest.js";
export async function sendUserOperation(client, args) {
    const { account: account_ = client.account, signature } = args;
    if (!account_)
        throw new AccountOrClientNotFoundError();
    const account = parseAccount(account_);
    const userOperation = await getAction(client, prepareUserOperationRequest)(args);
    userOperation.signature = signature;
    return sendUserOperationBundler(client, {
        userOperation: userOperation,
        entryPoint: account.entryPoint,
    });
}
export async function getUserOperationWithoutSignature(client, args) {
    const { account: account_ = client.account } = args;
    if (!account_)
        throw new AccountOrClientNotFoundError();
    return await getAction(client, prepareUserOperationRequest)(args);
}
//# sourceMappingURL=sendUserOperation.js.map