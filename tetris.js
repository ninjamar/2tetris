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
]

class Shape {
    constructor(){
        this.template = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        // TODO: Which rotation are shapes when placed
        this.dir = 0; // pattern[dir]

        // this.topLeft = [x, y];
        this.topLeft = null;
    }
    get image(){
        return this.template[this.dir]; // rotate = (dir + 1) % 4
    }
}

class Tetris {
    constructor($elem, $message){
        this.ctx = $elem.getContext("2d");
        this.$score = $message.querySelector("span > span");
        this.$status = $message.querySelector("div");
        this.score = 0;

        this.isGameRunning = true;

        this.cols = 10;
        this.rows = 20;
        
        this.cellSize = 20;
        this.ctx.scale(this.cellSize, this.cellSize);
        this.board = Array.from({length: this.rows}, () => Array(this.cols).fill(0));

        this.spawnShape();
    }

    draw(){
        // Remember that ctx is scaled to this.cellSize
        this.ctx.clearRect(0, 0, this.cols, this.rows);
        for (let y = 0; y < this.board.length; y++){
            for (let x = 0; x < this.board[y].length; x++){
                let color = this.board[y][x] == "S" || this.board[y][x] == 1 ? "white" : "black";
                this.drawCell(x, y, color);
            }
        }
    }
    drawCell(x, y, color){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }
    spawnShape(){
        this.shape = new Shape();
        this.shape.topLeft = [];
        // TODO: Game over doesn't get triggered
        if (this.projectShapeByXY(Math.floor(this.cols / 2) - 1, 0) < 0){
            this.gameOver();
        }
    }
    gameOver(){
        this.isGameRunning = false;
        this.$status.style.visibility = "visible";
    }
    lockThenSpawnShape(){
        // Make the shape stuck on the board
        this.board = this.board.map(y => y.map(x => x == "S" ? 1 : x));
        this.spawnShape();
    }
    setAndCheckCollision(){
        // returns false if there is a collision
        // Check for collision left to right to make sure we can place the shape
        for (let y = 0; y < this.shape.image.length; y++){
            for (let x = 0; x < this.shape.image[y].length; x++){
                let tile = this.shape.image[y][x];
                let boardX = this.shape.topLeft[0] + x;
                let boardY = this.shape.topLeft[1] + y;
                // No collision, so set
                if (this.board[boardY][boardX] == 0 && tile == "S"){
                    this.board[boardY][boardX] = "S";
                }
                // Collision by X
                if (this.board[boardY][boardX] == 1 && tile == "S"){
                    // collisionFN(boardX, boardY, x, y);
                    // this.lockThenSpawnShape();
                    return false;
                }
            }
        }
        return true;
    }

    projectShapeByRotation(newDir){
        this.board = this.board.map(y => y.map(x => x == "S" ? 0: x));

        let oldDir = this.shape.dir;
        this.shape.dir = newDir;

        let oldBoard = structuredClone(this.board);

        if (!this.setAndCheckCollision()) {
            this.board = oldBoard;
            this.shape.dir = oldDir;
            return false;
        };
        // Remove shape if at the bottom row
        if (this.isAtLastRowCleanup() || this.isStuckCleanup()){
            return true;
        }
        return true;
    }

    isAtLastRowCleanup(){
        // Remove shape if at the bottom row
        if (this.shape.topLeft[1] + this.shape.image.length >= this.rows){
            this.lockThenSpawnShape();
            return true;
        }
        return false;
    }

    isStuckCleanup(){
        // Collision by columns
        // Check if we can move down. If we can't, then lockThenSpawnShape()
        for (let y = 0; y < this.shape.image.length; y++){
            for (let x = 0; x < this.shape.image[y].length; x++){
                let tile = this.shape.image[y][x];
                let boardX = this.shape.topLeft[0] + x;
                let boardY = this.shape.topLeft[1] + y;
            
                // Row 0 = Top of board
                // Collision
                if (this.board[boardY + 1][boardX] == 1 && tile == "S"){
                    this.lockThenSpawnShape();
                    return true;
                }
            }
        }
        return false;
    }

    projectShapeByXY(newTopLeftX, newTopLeftY){
        // returns -2 if coordinate failure, -1 if collision, no success, 0 if at bottom row/collision, and sucess, 1 if sucess
        if (newTopLeftX < 0 || newTopLeftX + this.shape.image[0].length > this.cols || newTopLeftY < 0 || newTopLeftY + this.shape.image.length > this.rows){
            return -2;
        }
        // OR: arr.forEach, but I prefer map
        this.board = this.board.map(y => y.map(x => x == "S" ? 0 : x)); // Clear board of current shape
        // if the x coordinates are out of bounds, don't move the shape
        let oldTopLeft = [...this.shape.topLeft];
        // Only update the one we need
        this.shape.topLeft = [newTopLeftX, newTopLeftY];
        // This is  a terrible idea, but it's 10pm and I don't have a better way to do this
        // TODO: Copy by value 2d
        let oldBoard = structuredClone(this.board);

        // Collision by rows
        // If there is a collision with the board, don't move the shape
        if (!this.setAndCheckCollision()) {
            this.board = oldBoard;
            this.shape.topLeft = oldTopLeft;
            // Since the shape isn't on the grid in the clear version, projecti t
            // IMHO this is a hacky way to revert the shape back
            this.projectShapeByXY(this.shape.topLeft[0], this.shape.topLeft[1]);
            return -1;
        }
        // Remove shape if at the bottom row
        if (this.isAtLastRowCleanup() || this.isStuckCleanup()){
            // Clear the rows and update the score
            this.clearRows();
            return 0;
        }
        
        return 1;
    }
    // TODO: Score, game ends if shape can't be spawned
    receiveEvent(event){
        if (!this.isGameRunning){
            console.log("Bruh");
            return;
        }
        switch (event){
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
                // debugger;
                let res;
                do {
                    res = this.projectShapeByXY(this.shape.topLeft[0], this.shape.topLeft[1] + 1)
                } while (res == 1);
                this.draw()
                break;
        }
    }
    clearRows(){
        let newBoard = [];
        let rowsCleared = 0;
        for (let y = this.board.length - 1; y >= 0; y--){
            if (this.board[y].every(x => x == 1)){
                rowsCleared++;
            } else {
                newBoard.unshift(this.board[y])
            }
        }
        while (newBoard.length < this.board.length){
            newBoard.unshift(Array(this.cols).fill(0));
        }
        this.board = newBoard;
        // todo fix
        if (rowsCleared > 0){
            this.score += Math.round(100 * (Math.log(rowsCleared) / Math.log(10)) + 10);
            this.$score.textContent = this.score;
        }
    }

}

function main(){
    // TODO: Debugging purposes
    window.t = new Tetris(document.querySelector("#game"), document.querySelector("#game-message"));

    document.addEventListener("keydown", (event) => {
        switch (event.key){
            case "ArrowLeft":
                t.receiveEvent("left");
                break;
            case "ArrowRight":
                t.receiveEvent("right");
                break;
            case "ArrowDown":
                t.receiveEvent("softDrop");
                break;
            case "ArrowUp":
                t.receiveEvent("rotate");
                break;
            case " ":
                t.receiveEvent("hardDrop");
                break;
        }
    });

    function loop(){
        t.draw();
        // TODO: Move down
        new Promise(resolve => setTimeout(resolve, 500)).then(() => {
            window.requestAnimationFrame(loop);
        })
    }

    loop();
}

document.addEventListener("DOMContentLoaded", main)