const defaultNodes = [
    { name: "road split", ins: 1, outs: 2},
    { name: "intersection", ins: 2, outs: 2},
    { name: "roundabout", ins: 1, outs: 3},
    { name: "road merge", ins: 2, outs: 1},
    { name: "plaza", ins: 3, outs: 2},
    { name: "alley", ins: 1, outs: 1},
    { name: "avenue", ins: 1, outs: 1},
    { name: "stairway", ins: 1, outs: 2},
    { name: "subway station", ins: 2, outs: 1},
    { name: "tunnel", ins: 1, outs: 1},
    { name: "bridge", ins: 2, outs: 1},
    { name: "riverside path", ins: 1, outs: 1},
]

const generateButton = document.getElementById("generateButton");
generateButton.addEventListener("click", generateLevel);

const outputCanvas = document.getElementById("outputCanvas");
const ctx = outputCanvas.getContext("2d");

// make sure 2 outs of one node never go to the two ins of another node
// the total nodes per step has to stay under width but also fluctuate throughout
function generateLevel() {
    const length = document.getElementById("lengthInput").value;
    const width = document.getElementById("widthInput").value;

    graphLevel(testLevel);
}

// minNodes = largest "outs" number from the previous section's nodes
// maxNodes = width
// totalIns = the total outs from the previous section
// maxInNum = the maximum ins a node can have = the number of nodes in the previous section
// returns a section
function generateSection(minNodes, maxNodes, totalIns, maxInNum) {

}

// returns a backwards directed adjacency list. 
// the index of the node in this section followed by a list of nodes in the prev section
function linkSection(section, prevSection) {

}

function getNode(nodes, name) {
    for (let n of nodes) {
        if (n.name === name) return n;
    }
}

let testLevel = [
    {
        nodes: 
        [ 
            getNode(defaultNodes, "tunnel"),
        ],
        adjacencies: 
        [
            [0],
        ],
    },
    {
        nodes: 
        [ 
            getNode(defaultNodes, "roundabout"),
        ],
        adjacencies: 
        [
            [0],
        ],
    },
    {
        nodes: 
        [ 
            getNode(defaultNodes, "alley"),
            getNode(defaultNodes, "avenue"),
            getNode(defaultNodes, "stairway"),
        ],
        adjacencies: 
        [
            [0],
            [0],
            [0],
        ],
    },
    {
        nodes: 
        [ 
            getNode(defaultNodes, "road merge"),
            getNode(defaultNodes, "tunnel"),
            getNode(defaultNodes, "riverside path"),
        ],
        adjacencies: 
        [
            [1, 2],
            [2],
            [0],
        ],
    },
    {
        nodes: 
        [ 
            getNode(defaultNodes, "plaza"),
        ],
        adjacencies: 
        [
            [0, 1, 2],
        ],
    },
    {
        nodes: 
        [ 
            getNode(defaultNodes, "avenue"),
            getNode(defaultNodes, "riverside path"),
        ],
        adjacencies: 
        [
            [0],
            [0],
        ],
    },
    {
        nodes: 
        [ 
            getNode(defaultNodes, "bridge"),
        ],
        adjacencies: 
        [
            [0, 1],
        ],
    },
]

function graphLevel(level) {
    let x = 10;
    let y = 10;

    // draw start node
    ctx.fillStyle = "white";
    drawNode({ name: "start", ins: "", outs: ""}, x, y, 100, 50);
    x += 140;
    
    // begin path for connectors
    ctx.beginPath();

    // draw the bulk of the level, section by section
    for (let section of level) {
        // draw nodes
        for (let node of section.nodes) {
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