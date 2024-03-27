import { toNano } from '@ton/core';
import { Bank } from '../wrappers/Bank';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const bank = provider.open(await Bank.fromInit());

    await bank.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(bank.address);

    // run methods on `bank`
}
