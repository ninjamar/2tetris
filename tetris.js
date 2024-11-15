const SHAPES = [
    // Use null instead of 0 because we need to show that the shape only takes up the space it needs
    // ****
    [
        [
            ["S", "S", "S", "S"] // Horizontal
        ],
        [
            ["S"],
            ["S"],
            ["S"],
            ["S"] // Vertical
        ]
    ],
    // *
    // ***
    [
        [
            ["S", null, null],
            ["S", "S", "S"]
        ],
        [
            ["S", "S"],
            ["S", null],
            ["S", null]
        ],
        [
            ["S", "S", "S"],
            [null, null, "S"]
        ],
        [
            [null, "S"],
            [null, "S"],
            ["S", "S"]
        ]
    ],
    //   *
    // ***
    [
        [
            [null, null, "S"],
            ["S", "S", "S"]
        ],
        [
            ["S", null],
            ["S", null],
            ["S", "S"]
        ],
        [
            ["S", "S", "S"],
            ["S", null, null]
        ],
        [
            ["S", "S"],
            [null, "S"],
            [null, "S"]
        ]
    ],
    // **
    // **
    [
        [
            ["S", "S"],
            ["S", "S"]
        ]
    ],
    //  **
    // **
    [
        [
            [null, "S", "S"],
            ["S", "S", null]
        ],
        [
            ["S", null],
            ["S", "S"],
            [null, "S"]
        ]
    ],
    // ***
    //  *
    [
        [
            ["S", "S", "S"],
            [null, "S", null]
        ],
        [
            [null, "S"],
            ["S", "S"],
            [null, "S"]
        ],
        [
            [null, "S", null],
            ["S", "S", "S"]
        ],
        [
            ["S", null],
            ["S", "S"],
            ["S", null]
        ]
    ],
    // **
    //  **
    [
        [
            ["S", "S", null],
            [null, "S", "S"]
        ],
        [
            [null, "S"],
            ["S", "S"],
            ["S", null]
        ]
    ]
];
// TODO: Better colors
COLORS = [
    "aqua",
    // "black",
    "blue",
    "fuchsia",
    "gray",
    "green",
    "lime",
    "maroon",
    "navy",
    "olive",
    "purple",
    "red",
    "silver",
    "teal",
    "white"
]
function getRandomColor(){
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

class Point {
    // TODO: Probably use a dict for this
    constructor(value, color = "black"){
        this.value = value;
        this.color = color;
    }
}

class Shape {
    constructor() {
        this.color = getRandomColor();
        this.template = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        this.template = this.template.map(pattern => pattern.map(row => row.map(point => new Point(point, this.color))));

        this.dir = 0; // pattern[dir]
        this.topLeft = null;
    }
    get image() {
        return this.template[this.dir]; // rotate = (dir + 1) % 4
    }
}

class Tetris {
    constructor($elem, $message) {
        this.ctx = $elem.getContext("2d");
        this.$score = $message.querySelector("span > span");
        this.$status = $message.querySelector("div");
        this.score = 0;

        this.isGameRunning = true;

        this.cols = 10;
        this.rows = 20;

        this.cellSize = 20;
        this.ctx.scale(this.cellSize, this.cellSize);
        this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(new Point(0)));
        this.spawnShape();
    }

    draw() {
        // Remember that ctx is scaled to this.cellSize
        this.ctx.clearRect(0, 0, this.cols, this.rows);
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[y].length; x++) {
                this.drawCell(x, y, this.board[y][x].color);
            }
        }
    }
    drawCell(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }
    spawnShape() {
        this.shape = new Shape();
        this.shape.topLeft = [];
        if (!this.projectShapeByXY(Math.floor(this.cols / 2) - 1, 0)) {
            this.gameOver();
        }
    }
    gameOver() {
        this.isGameRunning = false;
        this.$status.style.visibility = "visible";
        // this.$status.setAttribute("hidden", "false");
    }
    lockThenSpawnShape() {
        // Make the shape stuck on the board
        // this.board = this.board.map(y => y.map(x => x == "S" ? 1 : x));
        // this.board = this.board.map(y => y.map(x => x.value = x.value == "S" ? 1 : x.value));
        // Don't change color because when going from shape to lock, color stays the same
        this.board.forEach(y => y.forEach(x => x.value = x.value == "S" ? 1 : x.value));
        this.spawnShape();
    }
    isAtLastRowCleanup() {
        // Remove shape if at the bottom row
        if (this.shape.topLeft[1] + this.shape.image.length >= this.rows) {
            this.lockThenSpawnShape();
            return true;
        }
        return false;
    }

    isStuckCleanup() {
        // Collision by columns
        // Check if we can move down. If we can't, then lockThenSpawnShape()
        for (let y = 0; y < this.shape.image.length; y++) {
            for (let x = 0; x < this.shape.image[y].length; x++) {
                let tile = this.shape.image[y][x];
                let boardX = this.shape.topLeft[0] + x;
                let boardY = this.shape.topLeft[1] + y;
                if (this.board[boardY + 1][boardX].value == 1 && tile.value == "S") {
                    this.lockThenSpawnShape();
                    return true;
                }
            }
        }
        return false;
    }
    collisionFromOldToNew(newBoard) {
        for (let y = 0; y < this.shape.image.length; y++) {
            for (let x = 0; x < this.shape.image[y].length; x++) {
                // let tile = this.shape.image[y][x];
                let boardX = this.shape.topLeft[0] + x;
                let boardY = this.shape.topLeft[1] + y;
                if (this.board[boardY][boardX].value == 1 && newBoard[boardY][boardX].value == "S") {
                    return true;
                }
            }
        }
        return false;
    }
    applyShapeToTarget(target) {
        for (let y = 0; y < this.shape.image.length; y++) {
            for (let x = 0; x < this.shape.image[y].length; x++) {
                let tile = this.shape.image[y][x];
                let boardX = this.shape.topLeft[0] + x;
                let boardY = this.shape.topLeft[1] + y;
                if (tile.value == "S") {
                    target[boardY][boardX].value = tile.value;
                    target[boardY][boardX].color = tile.color;
                }
            }
        }
        return target;
    }
    copyBoard(){
        let res = [];
        for (let y = 0; y < this.board.length; y++){
            let row = []
            for (let x = 0; x < this.board[y].length; x++){
                let tile = this.board[y][x];
                row.push(new Point(tile.value, tile.color));
            }
            res.push(row);
        }
        return res;
    }
    projectShapeByRotation(newDir) {
        let oldBoard = this.copyBoard();
        this.board.forEach(y => y.forEach(x => {
            if (x.value == "S"){
                x.value = 0;
                x.color = "black";
            }
        }));
        let newBoard = this.copyBoard();

        let oldDir = this.shape.dir;
        this.shape.dir = newDir;

        if (this.shape.topLeft[0] < 0 || this.shape.topLeft[0] + this.shape.image[0].length > this.cols || this.shape.topLeft[1] < 0 || this.shape.topLeft[1] + this.shape.image.length > this.rows) {
            this.board = oldBoard;
            // If the shape can't be rotated, try rotating the shape one more time
            this.projectShapeByRotation((newDir + 1) % this.shape.template.length);
            return false;
        }

        newBoard = this.applyShapeToTarget(newBoard);

        if (this.collisionFromOldToNew()) {
            this.shape.dir = oldDir;
            this.board = oldBoard;
            return false;
        }
        this.board = newBoard;
        // Remove shape if at the bottom row
        if (this.isAtLastRowCleanup() || this.isStuckCleanup()) {
            this.clearRows();
            return false;
        }
        return true;

    }
    projectShapeByXY(newTopLeftX, newTopLeftY) {
        if (newTopLeftX < 0 || newTopLeftX + this.shape.image[0].length > this.cols || newTopLeftY < 0 || newTopLeftY + this.shape.image.length > this.rows) {
            return false;
        }
        let oldBoard = this.copyBoard();

        this.board.forEach(y => y.forEach(x => {
            if (x.value == "S"){
                x.value = 0;
                x.color = "black";
            }
        }));
        let newBoard = this.copyBoard();

        // Only update the one we need
        let oldTopLeft = [...this.shape.topLeft];
        this.shape.topLeft = [newTopLeftX, newTopLeftY];

        newBoard = this.applyShapeToTarget(newBoard);

        if (this.collisionFromOldToNew(newBoard)) {
            this.shape.topLeft = oldTopLeft;
            this.board = oldBoard;
            return false;
        }
        this.board = newBoard;

        if (this.isAtLastRowCleanup() || this.isStuckCleanup()) {
            // Clear the rows and update the score
            this.clearRows();
            return false;
        }
        return true;
    }
    receiveEvent(event) {
        if (!this.isGameRunning) {
            console.log("Really?");
            return;
        }
        switch (event) {
            case "left":
                this.projectShapeByXY(this.shape.topLeft[0] - 1, this.shape.topLeft[1]);
                this.draw();
                break;
            case "right":
                this.projectShapeByXY(this.shape.topLeft[0] + 1, this.shape.topLeft[1]);
                this.draw();
                break;
            case "rotate":
                this.projectShapeByRotation((this.shape.dir + 1) % this.shape.template.length);
                this.draw();
                break;
            case "softDrop":
                this.projectShapeByXY(this.shape.topLeft[0], this.shape.topLeft[1] + 1);
                this.draw();
                break;
            case "hardDrop":
                let res;
                do {
                    res = this.projectShapeByXY(this.shape.topLeft[0], this.shape.topLeft[1] + 1);
                } while (res);
                this.draw();
                break;
        }
    }
    clearRows() {
        let newBoard = [];
        let rowsCleared = 0;
        for (let y = this.board.length - 1; y >= 0; y--) {
            if (this.board[y].every(x => x.value == 1)) {
                rowsCleared++;
            } else {
                newBoard.unshift(this.board[y])
            }
        }
        while (newBoard.length < this.board.length) {
            // Make sure that that each row gets it own Point, not a reference
            newBoard.unshift(Array.from({length: this.cols}, () => new Point(0)));
        }
        this.board = newBoard;
        // todo fix
        if (rowsCleared > 0) {
            this.score += Math.round(100 * (Math.log(rowsCleared) / Math.log(10)) + 10);
            this.$score.textContent = this.score;
        }
    }
}
function TetrisGameHandler($game, $status){
    let game = new Tetris($game, $status);
    window.g = game;
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowLeft":
                game.receiveEvent("left");
                break;
            case "ArrowRight":
                game.receiveEvent("right");
                break;
            case "ArrowDown":
                game.receiveEvent("softDrop");
                break;
            case "ArrowUp":
                game.receiveEvent("rotate");
                break;
            case " ":
                game.receiveEvent("hardDrop");
                break;
        }
    });
    function loop() {
        game.draw();
        new Promise(resolve => setTimeout(resolve, 500)).then(() => {
            game.receiveEvent("softDrop");
            window.requestAnimationFrame(loop);
        })
    }
    loop();
}
function main() {
    TetrisGameHandler(document.querySelector("#game"), document.querySelector("#game-message"));
}

document.addEventListener("DOMContentLoaded", main)