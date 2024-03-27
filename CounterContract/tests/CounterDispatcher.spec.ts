import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { loadHashUpdate, toNano } from '@ton/core';
import { CounterDispatcher } from '../wrappers/CounterDispatcher';
import { CounterContract } from '../wrappers/CounterContract';
import '@ton/test-utils';
import { log } from 'console';

describe('CounterDispatcher', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let counterDispatcher: SandboxContract<CounterDispatcher>;
    let counterContract: SandboxContract<CounterContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        counterDispatcher = blockchain.openContract(await CounterDispatcher.fromInit());
        counterContract = blockchain.openContract(await CounterContract.fromInit(0n));

        deployer = await blockchain.treasury('deployer');

        const deployResultForDispatcher = await counterDispatcher.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const deployResultForCointerContract = await counterContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResultForDispatcher.transactions).toHaveTransaction({
            from: deployer.address,
            to: counterDispatcher.address,
            deploy: true,
            success: true,
        });

        expect(deployResultForCointerContract.transactions).toHaveTransaction({
            from: deployer.address,
            to: counterContract.address,
            deploy: true,
            success: true
        })
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and counterDispatcher are ready to use
    });

    it("should be increment", async () => {
        const counterBefore = await counterContract.getCounter(); 
        const target = 20n;

        const res = await counterDispatcher.send(deployer.getSender(),
        {
            value: toNano("1.05")
        },
        {
            $$type: "Reach",
            counterAddress: counterContract.address,
            target
        })

        const counter = await counterContract.getCounter()

        // console.log("Result:", res);
        // console.log("Events lenght:", res.events.length)
        // console.log("Counter is:", counter)

        expect(counter).toEqual(target)

        
    })
});
