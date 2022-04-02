class Cell {
    constructor(world, location ,gnome, IN) {
        this.world = world;
        this.location = location;
        this.gnome = gnome; // [0,1,2,3];
        
        // Input 
        this.age = 0;
        this.lastMovementX = 0;
        this.lastMovementY = 0;

        // Output
        this.nextMove = {x:0,y:0};

        // Input Neuron Objects
        var iN = [
            new InputNeuron(this.Age, this),
            new InputNeuron(this.Bfd, this),
            new InputNeuron(this.Lx, this), 
            new InputNeuron(this.Ly, this),
            new InputNeuron(this.LMx, this), 
            new InputNeuron(this.LMy, this),
            new InputNeuron(this.Rnd, this)
        ];

        // Output Neuron Objects
        var oN = [
            new OutputNeuron(this.MX, this),
            new OutputNeuron(this.MY, this)
        ];

        // Internal Neuron Objects
        this.NeuralNetwork = {inputNeurons: iN, internalNeurons: [], outputNeurons: oN};
        for (let i = 0; i < IN; i++) {
            this.NeuralNetwork.internalNeurons.push(new InternalNeuron())
        }

        // Generating Connections between avalible Neurons based on Gnome
        for (var i = 0; i < this.gnome.length; i++) {
            var gen = this.gnome[i];

            // Source Type & ID
            var sourceType = gen & 1    // 1st Bit
            gen = gen >> 1;             // Shift 1
            var sourceId = gen & 127;   // 2nd to 8th Bits
            gen = gen >> 7;             // Shift 7

            // Sink Type & ID
            var sinkType = gen & 1      // 9th Bit
            gen = gen >> 1;             // Shift 1
            var sinkId = gen & 127;     // 10th to 16th Bits
            gen = gen >> 7;             // Shift 7

            // Weight
            var weight = gen & 65535;   // Rest of the Bits
            weight = weight/13107- 2.5; // Range weight from -2.5 to +2.5

            if (sourceType) {
                var id = sourceId % this.NeuralNetwork.internalNeurons.length;
                var c = new Connection(this.NeuralNetwork.internalNeurons[id], weight);
                
            } else {
                var id = sourceId % this.NeuralNetwork.inputNeurons.length;
                var c = new Connection(this.NeuralNetwork.inputNeurons[id], weight);
            }

            if (sinkType) {
                var id = sourceId % this.NeuralNetwork.internalNeurons.length;
                this.NeuralNetwork.internalNeurons[id].connections.push(c);
            } else {
                var id = sourceId % this.NeuralNetwork.outputNeurons.length;
                this.NeuralNetwork.outputNeurons[id].connections.push(c);
            }
        }

       
    }

    /**
     * Fire all Neurons to make a "step" in the simulation. step is not necessary movement.
     */
    Step() {
        for (var i = 0; i < this.NeuralNetwork.inputNeurons.length; i++) {
            var inputNeuron = this.NeuralNetwork.inputNeurons[i];
            inputNeuron.fire();
        }

        for (var i = 0; i < this.NeuralNetwork.internalNeurons.length; i++) {
            var internalNeuron = this.NeuralNetwork.internalNeurons[i];
            internalNeuron.fire();
        }

        for (var i = 0; i < this.NeuralNetwork.internalNeurons.length; i++) {
            var internalNeuron = this.NeuralNetwork.internalNeurons[i];
            internalNeuron.update();
        }

        for (var i = 0; i < this.NeuralNetwork.outputNeurons.length; i++) {
            var outputNeuron = this.NeuralNetwork.outputNeurons[i];
            outputNeuron.fire();
        }


        this.Move();
        this.age++;
    }

    /**
     * Move the cell into forward direction if not occupied
     */
    Move() {

        if (!this.IsOccupied({x:this.location.x + this.nextMove.x,y:this.location.y + this.nextMove.y})) {
            if (this.location.x < this.world.width && this.location.x > 0) {
                this.location.x += this.nextMove.x;
            }
            if (this.location.y < this.world.height && this.location.y > 0) {
                this.location.y += this.nextMove.y;
            }
        }
        this.lastMovementX = this.nextMove.x;
        this.lastMovementY = this.nextMove.y;

        this.nextMove.x = 0;
        this.nextMove.y = 0;
    }

    /**
     * Returns the Cell at the given location or null
     * @param {{x:number,y:number}} location 
     * @returns {Cell|null}
     */
    IsOccupied(location) {
        for (let i = 0; i < this.world.population.length; i++) {
            var cell = this.world.population[i];
            if (cell.location.x == location.x && cell.location.y == location.y) {
                return cell;
            }
        }
        return null;
    }

    /**
     * Return a Array of neighbours
     * @param {*} location 
     * @returns {[]}
     */
    getNeighbours(location) {
        var n = [];
        for (let i = 0; i < this.world.population.length; i++) {
            var cell = this.world.population[i];
            if (cell.location.x-1 == location.x && cell.location.y-1 == location.y ||
                cell.location.x == location.x && cell.location.y-1 == location.y ||
                cell.location.x+1 == location.x && cell.location.y-1 == location.y ||
                cell.location.x-1 == location.x && cell.location.y == location.y ||
                cell.location.x+1 == location.x && cell.location.y == location.y ||
                cell.location.x-1 == location.x && cell.location.y+1 == location.y ||
                cell.location.x == location.x && cell.location.y+1 == location.y ||
                cell.location.x+1 == location.x && cell.location.y+1 == location.y) {
                n.push(cell);
            }
        }
        return n;
    }

    // Input Neuron Methodes

    Age() {
        return this.age/300;
    }

    Lx() {
        return this.location.x/128;
    }

    Ly() {
        return this.location.y/128;
    }

    LMx() {
        return this.lastMovementX;
    }

    LMy() {
        return this.lastMovementX;
    }

    Rnd() {
        return Math.random();
    }

    Bfd() {
        if (this.IsOccupied({x:this.location.x + this.lastMovementX,y:this.location.y + this.lastMovementY})) {
            return 1;
        } else {
            return -1;
        }
    }

    Pop() {
        return (this.getNeighbours(this.location)).length/8;
    }


    // Output Neuron Methodes

    MX(value) {
        if (value) {
            this.nextMove.x = 1;
        } else {
            this.nextMove.x = -1;
        }
        
    }
    
    MY(value) {
        if (value) {
            this.nextMove.y = 1;
        } else {
            this.nextMove.y = -1;
        }
    }
   
}

