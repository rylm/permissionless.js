import type { Chain, Client, Hash, Transport } from "viem";
import type { SmartAccount } from "../../accounts/types";
import type {
  GetAccountParameter,
  PartialBy,
  Prettify,
  UserOperation,
} from "../../types/";
import { AccountOrClientNotFoundError, parseAccount } from "../../utils/";
import { getAction } from "../../utils/getAction";
import { sendUserOperation as sendUserOperationBundler } from "../bundler/sendUserOperation";
import {
  type SponsorUserOperationMiddleware,
  prepareUserOperationRequest,
} from "./prepareUserOperationRequest";

export type SendUserOperationParameters<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined
> = {
  userOperation: PartialBy<
    UserOperation,
    | "nonce"
    | "sender"
    | "initCode"
    | "signature"
    | "callGasLimit"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "preVerificationGas"
    | "verificationGasLimit"
    | "paymasterAndData"
  >;
} & GetAccountParameter<TAccount> &
  SponsorUserOperationMiddleware & { signature: `0x${string}` };

export async function sendUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount | undefined = SmartAccount | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: Prettify<SendUserOperationParameters<TAccount>>
): Promise<Hash> {
  const { account: account_ = client.account, signature } = args;
  if (!account_) throw new AccountOrClientNotFoundError();

  const account = parseAccount(account_) as SmartAccount;

  const userOperation = await getAction(
    client,
    prepareUserOperationRequest
  )(args);

  userOperation.signature = signature;

  return sendUserOperationBundler(client, {
    userOperation: userOperation,
    entryPoint: account.entryPoint,
  });
}

export async function getUserOperationWithoutSignature<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount | undefined = SmartAccount | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: Prettify<SendUserOperationParameters<TAccount>>
): Promise<UserOperation> {
  const { account: account_ = client.account } = args;
  if (!account_) throw new AccountOrClientNotFoundError();

  return await getAction(client, prepareUserOperationRequest)(args);
}
