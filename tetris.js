const SHAPES = [
    // Use null instead of 0 because we need to show that the shape only takes up the space it needs
    // ****
    [
        [
            [1, 1, 1, 1] // Horizontal
        ],
        [
            [1],
            [1],
            [1],
            [1] // Vertical
        ]
    ],
    // *
    // ***
    [
        [
            [1, null, null],
            [1, 1, 1]
        ],
        [
            [1, 1],
            [1, null],
            [1, null]
        ],
        [
            [1, 1, 1],
            [null, null, 1]
        ],
        [
            [null, 1],
            [null, 1],
            [1, 1]
        ]
    ],
    //   *
    // ***
    [
        [
            [null, null, 1],
            [1, 1, 1]
        ],
        [
            [1, null],
            [1, null],
            [1, 1]
        ],
        [
            [1, 1, 1],
            [1, null, null]
        ],
        [
            [1, 1],
            [null, 1],
            [null, 1]
        ]
    ],
    // **
    // **
    [
        [
            [1, 1],
            [1, 1]
        ]
    ],
    //  **
    // **
    [
        [
            [null, 1, 1],
            [1, 1, null]
        ],
        [
            [1, null],
            [1, 1],
            [null, 1]
        ]
    ],
    // ***
    //  *
    [
        [
            [1, 1, 1],
            [null, 1, null]
        ],
        [
            [null, 1],
            [1, 1],
            [null, 1]
        ],
        [
            [null, 1, null],
            [1, 1, 1]
        ],
        [
            [1, null],
            [1, 1],
            [1, null]
        ]
    ],
    // **
    //  **
    [
        [
            [1, 1, null],
            [null, 1, 1]
        ],
        [
            [null, 1],
            [1, 1],
            [1, null]
        ]
    ]
]
class Shape {
    constructor(x, y){
        this.template = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        // TODO: Which rotation are shapes when placed
        this.dir = 0; // pattern[dir]

        this.topLeft = [x, y];

    }

    get image(){
        return this.template[this.dir]; // rotate = (dir + 1) % 4
    }
}

class Tetris {
    constructor($elem){
        // $elem = canvas
        this.ctx = $elem.getContext("2d");

        this.cols = 10;
        this.rows = 20;

        this.cellSize = 20;

        this.ctx.scale(this.cellSize, this.cellSize);

        // 0 = White, 1 == Black
        this.board = Array.from({length: this.rows}, () => Array(this.cols).fill(0));

        this.spawnShape();
        this.projectShape();
        // this.shape = new Shape();
    }
    spawnShape(){
        // Make shape sticky, and spawn new shape
        this.shape = new Shape(null, null);
        this.shape.topLeft = [Math.floor(this.cols / 2) - 1, 0];
        // this.shape.topLeft = [Math.floor(Math.random() * (this.cols - 1)), this.shape.image.length];

    }

    draw(){
        // Remember that ctx is scaled to this.cellSize
        this.ctx.clearRect(0, 0, this.cols, this.rows);
        for (let y = 0; y < this.board.length; y++){
            for (let x = 0; x < this.board[y].length; x++){
                let color = this.board[y][x] == 1 ? "white" : "black";
                this.drawCell(x, y, color);
            }
        }
    }
    drawCell(x, y, color){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }

    receiveEvent(e){
        switch (e){
            case "left":
                // TODO: Inverse the directions, TODO: Need a diagram to show why
                // https://excalidraw.com/#json=sWcWtwIrBwHCbFljKqUbG,timNS_XbT0Mi8e5kSeDwtA
                // Move left. If < 0, use max to set to zero
                //this.moveShape({newTopLeftX: Math.max(this.shape.topLeft[0] - 1, 0)});
                this.moveShape({newTopLeftX: this.shape.topLeft[0] - 1});
                this.draw();
                break;
            case "right":
                // Move right. If > len, set to lens
                //this.moveShape({newTopLeftX: Math.max(this.shape.topLeft[0] + 1, this.cols)});
                this.moveShape({newTopLeftX: this.shape.topLeft[0] + 1});
                this.draw()
                break;
            case "softDrop":
                this.moveShape({newTopLeftY: this.shape.topLeft[1] + 1});
                this.draw()
                break;
            case "rotate":
                // 4 directions, so up down left right
                // TODO: doesnt work
                this.moveShape({newDir: (this.shape.dir + 1) % this.shape.template.length});
                this.draw();
                break;
            case "hardDrop":
                // Move shape down until it can't move any more. Then draw it.
                while (this.moveShape({newTopLeftX: this.shape.topLeft[0] + 1})){
                    this.draw();
                }
                break;
        }
    }
    
    checkBounds(x, y){
        return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
    }
    moveShape({newTopLeftX = null, newTopLeftY = null, newDir = null} = {}){
        if (this.projectShape({newTopLeftX: newTopLeftX, newTopLeftY: newTopLeftY, newDir: newDir})){
            return true;
        } else {
            // TOOD: Don't run check if on the last row
            // Check if shape could still posibly move more down, and if so, lock shape, then spawn a new shape
            for (let y = 0; y < this.shape.image.length; y++){
                for (let x = 0; x < this.shape.image[y].length; x++){
                    // if current spot on board - 1 is occupied, AND is not part of shape
                    const boardX = this.shape.topLeft[0] + x;
                    const boardY = this.shape.topLeft[1] + y;
                    // Last 
                    if (y == this.shape.image.length){
                        if (this.board[boardY + 1][boardX] == 1){
                            // TODO: Doesn't work
                            this.spawnShape();
                            return false;
                        }
                    } else {
                        if (this.board[boardY + 1][boardX] == 1 && this.shape.image[y + 1][x] != 1){
                            this.spawnShape()
                            return false;
                        }
                    }
                }
            }
        }
    }
    projectShape({newTopLeftX = null, newTopLeftY = null, newDir = null} = {}){
        // debugger;
        // Remove the old shape
        for (let y = 0; y < this.shape.image.length; y++){
            for (let x = 0; x < this.shape.image[y].length; x++){
                // Calculate board cords
                let boardX = this.shape.topLeft[0] + x;
                let boardY = this.shape.topLeft[1] + y;
                // Check if the tile is in the shape
                if (this.checkBounds(boardX, boardY)){
                    // If the tile is occupied on the board AND is part of the shape
                    if (this.board[boardY][boardX] == 1 && this.shape.image[y][x] == 1){
                        // Reset it
                        this.board[boardY][boardX] = 0;
                    }
                }
            }
        }
        
        // Copy the old top left
        let oldTopLeft = [...this.shape.topLeft];
        // Set new top left
        this.shape.topLeft = [
            newTopLeftX != null ? newTopLeftX : this.shape.topLeft[0],
            newTopLeftY != null ? newTopLeftY : this.shape.topLeft[1]
        ];

        let oldDir = this.shape.dir;
        this.shape.dir = newDir != null ? newDir : this.shape.dir;

        // This is probably a terrible idea, but it's 10pm and I don't have a better way to do this
        // TODO: Copy by value 2d
        let oldBoard = structuredClone(this.board);

        // TODO: is direction correct? i start from the top
        // Iterate over the shape
        for (let y = 0; y < this.shape.image.length; y++){
            for (let x = 0; x < this.shape.image[y].length; x++){
                // Check if the current tile is occupied
                if (this.shape.image[y][x] == 1){
                    const boardX = this.shape.topLeft[0] + x;
                    const boardY = this.shape.topLeft[1] + y;
                    // Check bounds and collision
                    if (this.board[boardY][boardX] == 1){
                        // Reset changes
                        this.board = oldBoard;
                        this.shape.topLeft = oldTopLeft;
                        this.shape.dir = oldDir;
                        return false;
                    }
                    // Can only change
                    if (this.checkBounds(boardX, boardY)){
                        this.board[boardY][boardX] = 1;
                    }
                }
            }
        }
        // Shape projection worked
        return true;
    }
}

function main(){
    // TODO: Debugging purposes
    window.t = new Tetris(document.querySelector("#game"));

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