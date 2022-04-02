/**
 * A input neuron has a sensor methode and the assigned cell object 
 */
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

/**
 * Internal neurons have an array of connections, these connections can be from input or other internal neurons, which will provide the hyperbolic tangent function with values to set the own new value
 */
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

/**
 * Output neurons have an array of connections, an output methode and an assigned cell, these connections can be from input or internal neurons, which will provide the hyperbolic tangent function with values to deside if the output methode is fired or not.
 */
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
