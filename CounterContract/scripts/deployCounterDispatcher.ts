import { toNano } from '@ton/core';
import { CounterDispatcher } from '../wrappers/CounterDispatcher';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const counterDispatcher = provider.open(await CounterDispatcher.fromInit());

    await counterDispatcher.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(counterDispatcher.address);

    // run methods on `counterDispatcher`
}
