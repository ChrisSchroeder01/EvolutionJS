class InputNeuron {
    constructor(sensor, cell) {
        this.sensor = sensor;
        this.cell = cell;
    }

    fire() {
        this.value = this.sensor.call(this.cell);
    }

    update() {
        
    }
}


class InternalNeuron {
    constructor() {
        this.connections = [];
        this.value = 0;
        this.newValue = 0;
    }

    fire() {
        this.newValue = Math.tanh(this.sum());
    }

    sum() {
        var sum = 0;
        for (let i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];
            sum += connection.value();
        }
        return sum;
    }

    update() {
        this.value = this.newValue;
    }

}

class OutputNeuron {
    constructor(method, cell) {
        this.connections = [];
        this.value = 0;
        this.method = method;
        this.cell = cell;
    }

    fire() {
        this.value = Math.tanh(this.sum());
        if (this.value > 0.33) {
            this.method.call(this.cell,true);
        } else if (this.value < -0.33) {
            this.method.call(this.cell,false);
        }

    }

    sum() {
        var sum = 0;
        for (let i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];
            sum += connection.value();
        }
        return sum;
    }

}

class Connection {
    constructor(parent, weight){
        this.parent = parent;
        this.weight = weight;
    }

    value() {
        var result = this.parent.value * this.weight;
        return result;
    }

}
