const nodes = [
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
    { name: "riverside", ins: 1, outs: 1},
]

const generateButton = document.getElementById("generateButton");
generateButton.addEventListener("click", generateLevel);

const outputCanvas = document.getElementById("outputCanvas");
const ctx = outputCanvas.getContext("2d");

// make sure 2 outs never go to the two ins of another node
function generateLevel() {
    const length = document.getElementById("lengthInput").value;
    const width = document.getElementById("widthInput").value;

    
}