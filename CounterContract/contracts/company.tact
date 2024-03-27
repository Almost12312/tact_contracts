import "@stdlib/deploy";

message Deposit {
    amount: Int as uint32;
}

message Withdraw {
    amount: Int as uint32;
    targetAddress: Address;
}

contract Company with Deployable {
    balance: Int as uint32;

    init() {
        self.balance = 0;
    }

    receive() {
        require(1 > 2, "Use Deposit method for sending money");
    }

    receive(msg: Deposit) {
        self.balance = msg.amount;
    }

    receive(msg: Withdraw) {
        require(msg.amount <= self.balance, "Invalid value");

        self.balance -= msg.amount;

        send(SendParameters{
            to: msg.targetAddress,
            value: 0,
            mode: SendIgnoreErrors + SendRemainingValue,
            body: Deposit{amount: msg.amount}.toCell()
        });
    }

    bounced(msg: Deposit) {
        self.balance = msg.amount;
    }

    get fun balance(): Int {
        return self.balance;
    }
}
