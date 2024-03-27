import "@stdlib/deploy";

message CounterValue {
    value: Int as uint8;
}

contract CounterContract with Deployable {
    id: Int as uint32;
    counter: Int as uint8;

    init(id: Int) {
        self.id = id;
        self.counter = 0;
    }

    receive("bulk") {
        self.counter += 1;
        self.reply(CounterValue{value: self.counter}.toCell());
    }

    receive("query") {
        self.reply(CounterValue{value: self.counter}.toCell());
    }

    fun response(): Cell {
        return CounterValue{value: self.counter}.toCell();
    }

    get fun counter(): Int {
        return self.counter;
    }
}
