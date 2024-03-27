import "@stdlib/deploy";

message CounterValue {
    value: Int as uint8;
}

message Reach {
    counterAddress: Address;
    target: Int as uint8;
}

contract CounterDispatcher with Deployable {
    target: Int as uint8;

    init() {
        self.target = 0;
    }

    receive(msg: Reach) {
        require(msg.target > 3, "you target must be great then 3");

        self.target = msg.target;

        send(SendParameters{
            to: msg.counterAddress,
            value: 0,
            mode: SendRemainingValue + SendIgnoreErrors,
            body: "query".asComment()
        });
    }

    receive(msg: CounterValue) {
        if(msg.value < self.target) {
            send(SendParameters{
                to: sender(),
                value: 0,
                mode: SendRemainingValue + SendIgnoreErrors,
                body: "bulk".asComment()
            });
        }
    }
}
