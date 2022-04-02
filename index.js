var sM = 5;

class World {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.width = 128;
        this.height = 128;
        this.canvas.width = 128*sM;
        this.canvas.height = 128*sM;
        this.ctx = this.canvas.getContext("2d");
        this.population = [];
        this.populationNr = 0;
        this.neuronNr = 0;
        this.stepNr = 0;
        this.generation = 0;
        this.lastSurvivors = 0;
        this.paused = false;
        document.getElementById("world").appendChild(this.canvas);
        var _this = this;
        this.canvas.addEventListener('mousedown', function(e) {
            var location = _this.getCursorPosition(e);
            console.log(location,_this.getCell(location));
        });
    }

    getCursorPosition(event) {
        const rect = this.canvas.getBoundingClientRect()
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        return {x: Math.floor(x/sM), y: Math.floor(y/sM)};
    }

    getCell(location) {
        for (let i = 0; i < this.population.length; i++) {
            var cell = this.population[i];
            if (cell.location.x == location.x && cell.location.y == location.y) {
                return cell;
            }
        }
        return null;
    }
    

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        for (let i = 0; i < this.population.length; i++) {
            var cell = this.population[i];
            var color = 0;
            for (let i = 0; i < cell.gnome.length; i++) {
                var gen = cell.gnome[i];
                color = color ^ gen;
            }
            this.ctx.fillStyle = "#"+color.toString(16);
            this.ctx.beginPath();
            this.ctx.arc(cell.location.x*sM, cell.location.y*sM, 2.5, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    updateData() {
        document.getElementById("data").innerHTML = `
            <table>
                <tr>
                    <th>Population</th>
                    <td>`+this.populationNr+`</td>
                </tr>
                <tr>
                    <th>Step</th>
                    <td>`+this.stepNr+`</td>
                </tr>
                <tr>
                    <th>Generation</th>
                    <td>`+this.generation+`</td>
                </tr>
                <tr>
                    <th>Last Surivors</th>
                    <td>`+this.lastSurvivors+` (`+this.lastSurvivors/this.populationNr*100+`%)`+`</td>
                </tr>

            </table>
        `;
    }

    step() {
        for (let i = 0; i < this.population.length; i++) {
            var cell = this.population[i];
            cell.Step();
        }
        this.clear();
        this.draw();
        this.updateData()
        this.stepNr++;
        if (this.stepNr > 300) {
            this.nextGen();
        }
    }

    run() {
        var p = parseInt(document.getElementById("population").value);
        var Nn = parseInt(document.getElementById("numNeurons").value);

        this.populationNr = p;
        this.neuronNr = Nn;
        for (let i = 0; i < p; i++) {

            var l = {x: Math.floor(Math.random() * 128), y: Math.floor(Math.random() * 128)};
            var g = [
                Math.floor(Math.random() * 4294967295),
                Math.floor(Math.random() * 4294967295),
                Math.floor(Math.random() * 4294967295),
                Math.floor(Math.random() * 4294967295)
            ];
            g.sort();
            this.population.push(new Cell(this,l,g,this.neuronNr));
        }

        var _this = this;
        this.interval = setInterval(function() {
            if (!_this.paused) {
                _this.step();
            }
        }, 1000/100);
    }

    pause() {
        this.paused = !this.paused;
        if (this.paused) {
            document.getElementById("pauseBtn").innerHTML = "Continue";
        } else {
            document.getElementById("pauseBtn").innerHTML = "Pause";
        }
    }

    nextGen() {

        // Selection
        for (let i = 0; i < this.population.length; i++) {
            var cell = this.population[i];
            if (cell.location.x < 64) {
                this.population.splice(i, 1)
            } else {
                var l = {x: Math.floor(Math.random() * 128), y: Math.floor(Math.random() * 128)};
                this.population[i].location=l;
            }
        }

        this.lastSurvivors = this.population.length;
        var newPopulation = [];

        while (newPopulation.length < this.populationNr) {
            var r1 = Math.floor(Math.random() * this.population.length);
            var r2 = Math.floor(Math.random() * this.population.length);

            var l = {x: Math.floor(Math.random() * 128), y: Math.floor(Math.random() * 128)};
            var g = [];
            for (let i = 0; i < this.population[r1].gnome.length; i++) {
                if (Boolean(Math.round(Math.random()))) {
                    g[i] = this.population[r1].gnome[Math.floor(Math.random() * this.population[r1].gnome.length)];
                } else {
                    g[i] = this.population[r2].gnome[Math.floor(Math.random() * this.population[r1].gnome.length)];
                }
            }

            g.sort();

            newPopulation.push(new Cell(this,l,g,this.neuronNr));         
        }
        this.population = newPopulation;

        this.stepNr = 0;
        this.generation++;
    }
}


var world = new World();