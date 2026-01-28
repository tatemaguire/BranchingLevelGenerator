// NODE_NAMES[ins - 1][outs - 1] = list of names
const NODE_NAMES = [
    [
        ["alley", "avenue", "tunnel", "riverside path"], // 1:1
        ["road split", "stairway"], // 1:2
        ["roundabout"], // 1:3
    ],
    [
        ["road merge", "subway station", "bridge"], // 2:1
        ["intersection"], // 2:2
        ["park"], // 2:3
    ],
    [
        ["shopping mall"], // 3:1
        ["plaza"], // 3:2
        ["city center"], // 3:3
    ],
];

const MAX_CONNECTIONS = 3;

const generateButton = document.getElementById("generateButton");
generateButton.addEventListener("click", generateLevel);

const outputCanvas = document.getElementById("outputCanvas");
const ctx = outputCanvas.getContext("2d");

function generateLevel() {
    const length = document.getElementById("lengthInput").value;
    const width = document.getElementById("widthInput").value;

    let level = generateNodes(length, width);
    generateConnections(level);
    assignNames(level);

    drawLevel(level);
}

// ------------------------------------
// Generation
// ------------------------------------

function generateNodes(length, maxWidth) {
    let levelWidths = [];

    for (let i = 0; i < length; i++) {
        // determine maximum/minimum possible width for this section
        // depends on previous section width, and distance from the end of the level
        let sectionMax = maxWidth;
        let sectionMin = 1;
        if (i === 0) {
            sectionMax = 1;
        } else {
            const maxFromPrev = levelWidths[i-1] * MAX_CONNECTIONS;
            if (maxFromPrev < sectionMax) sectionMax = maxFromPrev;

            const minFromPrev = Math.ceil(levelWidths[i-1] / MAX_CONNECTIONS);
            if (minFromPrev > sectionMin) sectionMin = minFromPrev;
        }
        const endLimit = Math.pow(MAX_CONNECTIONS, length-1 - i);
        if (endLimit < sectionMax) sectionMax = endLimit;

        // select width
        levelWidths.push(randInt(sectionMin, sectionMax));
    }

    console.assert(levelWidths.length == length, levelWidths.length);
    
    // generate sections with empty nodes
    let level = [];
    for (const w of levelWidths) {
        let section = { nodes: [] };
        for (let i = 0; i < w; i++) {
            section.nodes.push({});
        }
        level.push(section);
    }
    
    console.assert(level.length == length, level.length);

    return level;
}

function generateConnections(level) {
    level[0].nodes[0].ins = 1;
    level[0].adjacencies = [[0]];

    level[level.length-1].nodes[0].outs = 1;

    for (let i = 0; i < level.length - 1; i++) {
        const w1 = level[i].nodes.length;
        const w2 = level[i+1].nodes.length;

        const minConn = Math.max(w1, w2);
        const maxConn = Math.min(w1 * w2, w1 * MAX_CONNECTIONS, w2 * MAX_CONNECTIONS);

        const numConnections = randInt(minConn, maxConn);

        // assign out counts for level[i]
        let connsRemaining = numConnections;
        let subsequentNodes = w1 - 1;
        for (let node of level[i].nodes) {
            const maxOuts = Math.min(MAX_CONNECTIONS, w2, connsRemaining - subsequentNodes);
            const minOuts = Math.max(1, connsRemaining - (subsequentNodes * Math.min(MAX_CONNECTIONS, w2)));

            console.assert(maxOuts >= minOuts, maxOuts, minOuts);

            const outs = randInt(minOuts, maxOuts);
            node.outs = outs;

            connsRemaining -= outs;
            subsequentNodes--;
        }
        
        // assign in counts for level[i+1]
        connsRemaining = numConnections;
        subsequentNodes = w2 - 1;
        for (let node of level[i+1].nodes) {
            const maxIns = Math.min(MAX_CONNECTIONS, w1, connsRemaining - subsequentNodes);
            const minIns = Math.max(1, connsRemaining - (subsequentNodes * Math.min(MAX_CONNECTIONS, w1)));

            console.assert(maxIns >= minIns, maxIns, minIns);

            const ins = randInt(minIns, maxIns);
            node.ins = ins;

            connsRemaining -= ins;
            subsequentNodes--;
        }
        
        // assign adjacencies for level[i+1]
        level[i+1].adjacencies = [];
        let completed = []
        for (let j = 0; j < w2; j++) {
            completed.push(false);
            level[i+1].adjacencies.push([]);
        }

        let availableOuts = [];
        for (let node of level[i].nodes) {
            availableOuts.push({outs: node.outs});
        }

        while (completed.some((arg) => { return !arg; })) {
            let targetIndex = getLargestIncompleteNodeIndex(level[i+1].nodes, "ins", completed);
            let targetNode = level[i+1].nodes[targetIndex];

            let touched = [];
            for (let node of level[i].nodes) {
                touched.push(false);
            }

            for (let j = 0; j < targetNode.ins; j++) {
                let goalIndex = getLargestIncompleteNodeIndex(availableOuts, "outs", touched);
                touched[goalIndex] = true;
                availableOuts[goalIndex].outs--;
                level[i+1].adjacencies[targetIndex].push(goalIndex);
            }
            completed[targetIndex] = true;
        }
    }
}

function assignNames(level) {
    for (let section of level) {
        for (let node of section.nodes) {
            const possibleNames = NODE_NAMES[node.ins-1][node.outs-1];
            node.name = possibleNames[randInt(0, possibleNames.length-1)];
        }
    }
}

// ------------------------------------
// Visualization
// ------------------------------------

function drawLevel(level) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    let x = 10;
    let y = 10;

    // draw start node
    ctx.fillStyle = "white";
    drawNode({ name: "start", ins: "", outs: ""}, x, y, 100, 50);
    x += 140;
    
    // begin path for connectors
    ctx.beginPath();

    // draw the bulk of the level, section by section
    for (const section of level) {
        // draw nodes
        for (const node of section.nodes) {
            ctx.fillStyle = "rgb(190, 190, 190)";
            drawNode(node, x, y, 100, 50)
            y += 60;
        }
        // set connectors
        for (let i = 0; i < section.adjacencies.length; i++) {
            for (let prevI of section.adjacencies[i]) {
                ctx.moveTo(x, 35 + (i*60));
                ctx.lineTo(x-40, 35 + (prevI*60));
            }
        }

        x += 140;
        y = 10;
    }
    
    // draw end node
    ctx.fillStyle = "white";
    drawNode({ name: "end", ins: "", outs: ""}, x, y, 100, 50);

    // set last connection
    ctx.moveTo(x, 35);
    ctx.lineTo(x-40, 35);

    // draw connectors
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

}

function drawNode(node, x, y, w, h) {
    ctx.fillRect(x, y, w, h);

    // draw name
    ctx.fillStyle = "black";
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.name, x+(w/2), y+(h/2), w-30);

    // draw in and out counts
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    ctx.fillText(node.ins, x+4, y+(h/2), w);
    ctx.textAlign = "right";
    ctx.fillText(node.outs, x+w-4, y+(h/2), w);
}

// -------------------------------------------------
// Helper Functions
// -------------------------------------------------

// Random integer inclusive
function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1))
}

// im not cleaning up this mess sorry 
// but basically out of the list "nodes", find the largest node.property
// that is also marked as completed in the associated array "completed"
// then return the index of that node
function getLargestIncompleteNodeIndex(nodes, property, completed) {
    let largest = 0;
    let largestIndex = null;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (node[property] > largest && !completed[i]) {
            largest = node[property];
            largestIndex = i;
        }
    }
    return largestIndex;
}