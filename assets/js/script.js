"use-strict";


// Choose theme at random.
const colors = ["#D64163", "#fa625f", "#4874E2"];
const colorsDark = ["#c13b59", "#e15856", "#4168cb"];
const selColor = Math.floor(Math.random() * colors.length);
document.documentElement.style.setProperty('--primary', colors[selColor]);
document.documentElement.style.setProperty('--primary-dark', colorsDark[selColor]);

// Get canvas info from DOM.
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Default values.
var maxPop = 100;
var mutationRate = 0.01;
var newMaxPop = 100;
var newMutationRate = 0.01;
var shortDistance = Infinity;
var order = [];
var shortPath = [];
var startAlgo = false;
var maxGen = 800;

// Update dom data according to default values.
document.getElementById("mutation_rate_id").value = mutationRate;
document.getElementById("maxpop_id").value = maxPop;
document.getElementById("maxgen_id").value = maxGen;

// Constant cities data alonmg with position.
const cities = [{ "Name": "Jerusalem", "Pos": [532, 216] }, { "Name": "Riyadh", "Pos": [572, 253] }, { "Name": "Berlin", "Pos": [457, 155] }, { "Name": "Hong Kong", "Pos": [736, 245] }, { "Name": "Melbourne", "Pos": [814, 437] }, { "Name": "Sydney", "Pos": [829, 427] }, { "Name": "Perth", "Pos": [739, 419] }, { "Name": "Chennai", "Pos": [646, 282] }, { "Name": "Delhi", "Pos": [642, 241] }, { "Name": "Rio De Janeiro", "Pos": [333, 379] }, { "Name": "Cape Town", "Pos": [490, 422] }, { "Name": "Kolkata", "Pos": [667, 243] }, { "Name": "New York", "Pos": [255, 177] }, { "Name": "Mexico City", "Pos": [185, 249] }, { "Name": "London", "Pos": [439, 145] }, { "Name": "Paris", "Pos": [449, 158] }, { "Name": "Moscow", "Pos": [557, 115] }, { "Name": "Tokyo", "Pos": [801, 201] }, { "Name": "Madrid", "Pos": [427, 189] }];

// Add cities function.
function addCity(e) {
    e.preventDefault();
    let cityPos = parseInt(e.target.city.value);
    // Check if city exists.
    for (let i = 0; i < order.length; i++) {
        if (order[i] == cityPos) {
            return;
        }
    }
    order.push(cityPos);
    if (order.length > 2) {
        document.getElementById("result_box_id").classList.remove("d-none");
    }
    start();
}

// Show cities function shows cities on map.
function showCities() {
    for (let i = 0; i < order.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = "#888";
        ctx.arc(cities[order[i]].Pos[0], cities[order[i]].Pos[1], 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.fillStyle = colors[selColor];
        ctx.font = '900 25px "Font Awesome 5 Pro"';
        ctx.fillText("\uf3c5", cities[order[i]].Pos[0], cities[order[i]].Pos[1]);
    }
}

// Population object defined.
function Population() {
    this.generation = 0;
    this.totalFitness = 0;
    // Members.
    this.members = [];
    for (let i = 0; i < maxPop; i++) {
        this.members[i] = new DNA();
    }
}

// Population calculate fitness.
Population.prototype.calcFitness = function () {
    this.totalFitness = 0;
    for (let i = 0; i < maxPop; i++) {
        this.totalFitness = this.totalFitness + this.members[i].calcFitness();
    }
}

// Generate new population.
Population.prototype.generate = function () {
    let newPopulation = [];
    for (let i = 0; i < maxPop; i++) {
        let partnerA = pickOne(this.members, this.totalFitness);
        let partnerB = pickOne(this.members, this.totalFitness);
        var child = partnerA.crossOver(partnerB);
        child.mutate();
        newPopulation[i] = child;
    }
    this.members = newPopulation.slice();
    this.generation++;
}

// Pick one from given list based on probablity.
function pickOne(list, totalFitness) {
    let index = 0;
    let r = Math.random();
    while (r > 0) {
        if (list[index].pickChance == -1) {
            list[index].pickChance = list[index].fitnessScore / totalFitness;
        }
        r = r - list[index].pickChance;
        index++;
    }
    index--;
    return list[index];
}

// DNA object.
function DNA(genes) {
    this.fitnessScore = 0;
    this.pickChance = -1;
    if (genes) {
        this.genes = genes;
    } else {
        this.genes = [];
        let a = Math.floor(Math.random() * order.length);
        let b = Math.floor(Math.random() * order.length);
        let temp = order[a];
        order[a] = order[b];
        order[b] = temp;
        this.genes = order.slice();
    }
}

// Calculate dna fitness.
DNA.prototype.calcFitness = function () {
    let dist = pathDistance(this.genes);
    if (shortDistance > dist) {
        shortDistance = dist;
        shortPath = this.genes.slice();
    }
    this.fitnessScore = 1 / dist;
    this.fitnessScore = Math.pow(this.fitnessScore, 2);
    return this.fitnessScore;
}

// DNA crossover function.
DNA.prototype.crossOver = function (partner) {
    let start = Math.floor(Math.random() * order.length);
    let end = Math.floor(Math.random() * order.length);
    let child = JSON.parse(JSON.stringify(this.genes.slice(start, end)));
    for (let i = 0; i < order.length; i++) {
        if (child.includes(partner.genes[i]) == false) {
            child.push(partner.genes[i]);
        }
    }
    return new DNA(child);
}

// DNA mutation fucntion.
DNA.prototype.mutate = function () {
    if (Math.random() < mutationRate) {
        let a = Math.floor(Math.random() * order.length);
        let b = a % order.length;
        let temp = this.genes[a];
        this.genes[a] = this.genes[b];
        this.genes[b] = temp;
    }
}

// find path distance.
function pathDistance(path_order) {
    let totalDistance = 0;
    for (let i = 0; i < order.length - 1; i++) {
        totalDistance = totalDistance + distBPoints(cities[path_order[i]].Pos[0], cities[path_order[i]].Pos[1], cities[path_order[i + 1]].Pos[0], cities[path_order[i + 1]].Pos[1]);
    }
    return totalDistance;
}

// Distance between points.
function distBPoints(x1, y1, x2, y2) {
    return ((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1));
}

// Factorial function.
function factorial(x) {
    if (x == 1) {
        return 1;
    }
    return x * factorial(x - 1);
}

// Show short path between given cities.
function displayShortPath() {
    for (let i = 0; i < order.length - 1; i++) {
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#a3a3a3";
        ctx.moveTo(cities[shortPath[i]].Pos[0], cities[shortPath[i]].Pos[1]);
        ctx.lineTo(cities[shortPath[i + 1]].Pos[0], cities[shortPath[i + 1]].Pos[1]);
        ctx.stroke();
    }
}

var pop;

// Start  function.
function start() {
    // Check minimum cities in list.
    if (order.length < 3) {
        return;
    }
    shortPath = order.slice();
    shortDistance = Infinity;
    maxPop = newMaxPop;
    mutationRate = newMutationRate;
    pop = new Population();
    startAlgo = true;
    let time = factorial(order.length) / 60;
    let show;
    if (time < 60) {
        show = `${time} sec`;
    } else if (time > 60 && time <= 3600) {
        show = `${time / 60} min`;
    } else if (time > 3600 && time <= 86400) {
        show = `${(time / 60) / 60} hr`;
    } else if (time > 86400 && time <= 2073600) {
        show = `${((time / 60) / 60) / 24} days`;
    } else if (time > 2073600 && time <= 62208000) {
        show = `${(((time / 60) / 60) / 24) / 30} months`;
    } else {
        show = `${((((time / 60) / 60) / 24) / 30) / 12} years`;
    }
    document.getElementById("est_time_id").innerHTML = `<h4>Estimated Time With Brute Force <br><font class="text-primary">${show}</font></h4>`;

}

draw();

function draw() {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    showCities();
    if (startAlgo == true) {
        pop.calcFitness();
        pop.generate();
        document.getElementById("generations_id").innerHTML = pop.generation;
        document.getElementById("avgfitness_id").innerHTML = (((pop.totalFitness * 1000000000) / maxPop) * 100).toFixed(2);
        if (pop.generation > maxGen) {
            startAlgo = false;
        }
    }
    if (shortPath.length > 2) {
        displayShortPath();
    }
    window.requestAnimationFrame(draw);
}