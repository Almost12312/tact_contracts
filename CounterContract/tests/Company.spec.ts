import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Company } from '../wrappers/Company';
import '@ton/test-utils';
import { Bank } from '../wrappers/Bank';

describe('Company', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let company: SandboxContract<Company>;
    let bank: SandboxContract<Bank>

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        company = blockchain.openContract(await Company.fromInit());
        bank = blockchain.openContract(await Bank.fromInit())

        deployer = await blockchain.treasury('deployer');

        const deployCompanyResult = await company.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployCompanyResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: company.address,
            deploy: true,
            success: true,
        });


        const deployBankResult = await bank.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployBankResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: bank.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and company are ready to use
    });

    it('should be company deposit', async () => {
        const companyStartBalance = await company.getBalance()
        
        const res = await company.send(deployer.getSender(),
        {
            value: toNano("0.10")
        },
        {
            $$type: "Deposit",
            amount: 130n
        })

        // console.log("Company start balance:", companyStartBalance);
    
        const companyDepositedBalance = await company.getBalance()
        // console.log("Company deposited balance:", companyDepositedBalance)
        
        expect(companyDepositedBalance).toBeGreaterThan(companyStartBalance)
    })

    it("should be withdraw", async () => {
        await company.send(deployer.getSender(),
        {
            value: toNano("0.10")
        },
        {
            $$type: "Deposit",
            amount: 130n
        })

        const companyBalanceStart = await company.getBalance()
        const bankAddressStart = await bank.getBalance()

        // console.log("Company start balance:", companyBalanceStart);

        await company.send(deployer.getSender(),
        {
            value: toNano("0.5")
        },
        {
            $$type: "Withdraw",
            amount: 20n,
            targetAddress: bank.address
        })

        const companyBalanceEnd = await company.getBalance()
        const bankAddressEnd = await bank.getBalance()        

        expect(companyBalanceEnd).toEqual(companyBalanceStart - 20n)
        expect(bankAddressEnd).toEqual(bankAddressStart + 20n)
    })

    it("shold be debounce", async () => {
        const companyBalanceStart = await company.getBalance()
        const bankBalanceStart = await bank.getBalance()

        await company.send(deployer.getSender(),
        {
            value: toNano("0.05")
        },
        {
            $$type: "Deposit",
            amount: 130n
        })

        expect(await company.getBalance()).toEqual(130n)
        expect(await company.getBalance()).toBeGreaterThan(companyBalanceStart)

        const res = await company.send(deployer.getSender(),
        {
            value: toNano("0.05")
        },
        {
            $$type: "Withdraw",
            targetAddress: bank.address,
            amount: 110n
        })

        //@ts-ignore
        const bouncedEvent = res.events.find(e => e.bounced === true)        
        
        expect(bouncedEvent).toHaveProperty("bounced")
        expect(companyBalanceStart).toEqual(companyBalanceStart)
        expect(bankBalanceStart).toEqual(bankBalanceStart)
    })

});
