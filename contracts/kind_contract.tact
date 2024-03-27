import "@stdlib/deploy";

contract KindContract with Deployable {
    owner: Address;
    const ContractAliveTonValue: Int = ton("0.02");

    init() {
        self.owner = sender();
    }

    receive() {}

    receive("Aggressive withdraw") {
        require(sender() == self.owner, "Only owner can do this");

        send(SendParameters{
            to: self.owner,
            bounce: true,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
    }

    receive("Safe withdraw") {
        require(sender() == self.owner, "Only owner can do this");

        send(SendParameters{
            to: self.owner,
            bounce: true,
            value: myBalance() - context().value - self.ContractAliveTonValue,
            mode: SendIgnoreErrors + SendRemainingValue
        });
    }

    get fun balance(): Int {
        return myBalance();
    }

    get fun owner(): Address {
        return self.owner;
    }
    
    get fun constant(): Int {
        return self.ContractAliveTonValue;
    }
}
