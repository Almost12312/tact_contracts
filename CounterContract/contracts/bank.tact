import "@stdlib/deploy";

message Deposit {
    amount: Int as uint32;
}

contract Bank with Deployable {
    balance: Int as uint32;

    init() {
        self.balance = 0;
    }
    
    receive(msg: Deposit) {
        require(msg.amount < 100, "So many");
        self.balance = msg.amount;
    }

    get fun balance(): Int {
        return self.balance;
    }
}
