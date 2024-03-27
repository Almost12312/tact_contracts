import { toNano } from '@ton/core';
import { KindContract } from '../wrappers/KindContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const kindContract = provider.open(await KindContract.fromInit());

    await kindContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(kindContract.address);

    // run methods on `kindContract`
}
