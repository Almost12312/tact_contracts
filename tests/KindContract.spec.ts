import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { KindContract } from '../wrappers/KindContract';
import '@ton/test-utils';
import { exec } from 'child_process';

describe('KindContract', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let kindContract: SandboxContract<KindContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        kindContract = blockchain.openContract(await KindContract.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await kindContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: kindContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and kindContract are ready to use
    });

    it("contract shold be receive money from owner", async () => {
        let res = await kindContract.send(deployer.getSender(),
        {
            value: toNano("1500")
        }, null)

        expect(res.transactions).toHaveTransaction({from: deployer.address, value: toNano("1500")})
    })

    it("owner must be deployer", async () => {
        const contractOwner = await kindContract.getOwner()

        expect(contractOwner).toEqualAddress(deployer.address)
    })

    it("user's aggressive withdraw should be crush", async () => {
        const user = await blockchain.treasury("user")
        const contractBalance = await kindContract.getBalance()

        const res = await kindContract.send( user.getSender(),
        {
            value: toNano("0.2")
        }, "Aggressive withdraw")
        
        expect(res.transactions).toHaveTransaction({ aborted: true })
        expect(contractBalance).toEqual(await kindContract.getBalance())
    })

    it("user's safe withdraw should be crush", async () => {
        const user = await blockchain.treasury("user")
        const contractBalance = await kindContract.getBalance()

        const res = await kindContract.send(user.getSender(), {
            value: toNano("0.2")
        }, "Safe withdraw")

        expect(res.transactions).toHaveTransaction({aborted: true})
        expect(contractBalance).toEqual(await kindContract.getBalance())
    })

    it("owner's aggressive withdraw should be complite", async () => {
        let res = await kindContract.send(deployer.getSender(),
        {
            value: toNano("1500")
        }, null)

        expect(res.transactions).toHaveTransaction({from: deployer.address, value: toNano("1500")})

        const deployerBalance = await deployer.getBalance()
        const contractBalance = await kindContract.getBalance()
        
        res = await kindContract.send(deployer.getSender(), 
        {
            value: toNano("0.1")
        }, "Aggressive withdraw")    
        
        expect(await kindContract.getBalance()).toEqual(0n)
        expect(res.transactions).toHaveTransaction({
            to: deployer.address,
        })
        expect(await deployer.getBalance()).toBeGreaterThan(deployerBalance + 1400n)
    })

    it("owner's safe withdraw should be complite", async () => {
        let res = await kindContract.send(deployer.getSender(),
        {
            value: toNano("1500")
        }, null)

        expect(res.transactions).toHaveTransaction({from: deployer.address, value: toNano("1500")})

        const deployerBalance = await deployer.getBalance()
        const contractBalance = await kindContract.getBalance()
        console.log(contractBalance);
        
        res = await kindContract.send(deployer.getSender(), 
        {
            value: toNano("0.5")
        }, "Safe withdraw")    

        console.log(await kindContract.getBalance());
        
        
        expect(await kindContract.getBalance()).toEqual(await kindContract.getConstant())
        expect(res.transactions).toHaveTransaction({
            to: deployer.address,
        })
        expect(await deployer.getBalance()).toBeGreaterThan(deployerBalance + 1400n)
    })
});
