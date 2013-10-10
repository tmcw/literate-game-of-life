// # Game of Life
//
// [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life)
// is a very simple cellular automaton, which is fancy speak for "it's a simple
// system of rules that treats individual dots kind of like creatures." The
// creatures are usually called 'cells' and are represented as pixels, so
// we'll call them 'cells' here, and in this case, one cell is the same as
// one pixel.
//
// First, some housekeeping: the size of the game. Divide the 'real' size
// by 2 and then size it up in CSS. Blurrier but faster as a result, since
// there are fewer pixels to think about.
var width = 960 / 2,
    height = 500 / 2,
    // the colors of living and dead cells: this is in RGBA
    // space, so (255, 255, 255, 255) is white and (0, 0, 0, 255) is
    // black. We only set the `red` channel of the cells in this case,
    // so living cells are cyan `(0, 255, 255, 255)` and dead cells are white
    // `(255, 255, 255, 255)`
    alive = 0,
    dead = 255,
    canvas = document.getElementById('c');

canvas.width = width;
canvas.height = height;

var ctx = canvas.getContext('2d');

seed();
tick();

// First, seed the world with random data given to us by `Math.random()`
function seed() {
    // `.createImageData` asks a drawing context for a new, blank pixel
    // array. Pixel arrays are simple - they're just really long arrays
    // of pixel values, like `[r, g, b, a, r, g, b, a... ]`, so indexing into
    // them isn't too tricky.
    var after = ctx.createImageData(width, height);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            // for each pixel, color it either alive or dead randomly.
            write(after, x, y, (Math.random() > 0.5) ? alive : dead);
        }
    }
    // and then 'put' all of those random values into the picture, all at once.
    ctx.putImageData(after, 0, 0);
}

// The `tick`: this is the core of the game - some might also call it a 'step'.
// In each tick, we decide whether each cell should live or die, and at the
// end of the tick we put that new status, living or dead, into the world.
function tick() {
    // get both the state now and a new blank canvas to draw the results
    // of our decisions into.
    var before = ctx.getImageData(0, 0, width, height),
        after = ctx.createImageData(width, height);

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            // get our decision for whether this `x, y` position on the canvas
            // should live or die.
            var state = shouldLive(before, x, y);
            // write that decision into the image.
            write(after, x, y, state ? alive : dead);
        }
    }

    ctx.putImageData(after, 0, 0);
    window.setTimeout(tick, 100);
}

function shouldLive(before, x, y) {
    // get whether this cell is still alive.
    var self = cell(before, x, y),
        // get the number of neighbors still alive
        neighbors = neighborsLiving(before, x, y);

    // 1. Any live cell with fewer than two live neighbours dies, as if caused by under-population.
    // 2. Any live cell with two or three live neighbours lives on to the next generation.
    // 3. Any live cell with more than three live neighbours dies, as if by overcrowding.
    // 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    //
    // We can simplify these rules by only testing for the ones that are true, since
    // if they aren't true, then  the answer is false.
    return (self && (neighbors === 2 || neighbors === 3) ||
        (!self && neighbors === 3));
}

// Is a cell at `x, y` still alive? This answers with a 1 or a 0. It would
// be technically more accurate to say `true` or `false`, but it's convenient
// to use 1 and 0 because...
function cell(before, x, y) {
    return (before.data[(x * 4) + (y * width * 4)] === alive) ? 1 : 0;
}

// For our computation of living neighbors, we simply add together the values
// of calling `cell` on every neighbor in each of the 8 directions.
function neighborsLiving(before, x, y) {
    return cell(before, x - 1, y) +
        cell(before, x + 1, y) +
        cell(before, x + 0, y + 1) +
        cell(before, x + 0, y - 1) +
        cell(before, x + 1, y + 1) +
        cell(before, x + 1, y - 1) +
        cell(before, x - 1, y + 1) +
        cell(before, x - 1, y - 1);
}

// Finally, our really simple method to write the result of our decision
// for each cell. This doesn't need to return a value, since Javascript
// doesn't make a copy of the `after` array that we give as an argument -
// changes that we make to it are reflected everywhere.
function write(after, x, y, val) {
    var index = (x * 4) + (y * width * 4);
    after.data[index + 0] = val;
    after.data[index + 1] = 255;
    after.data[index + 2] = 255;
    after.data[index + 3] = 255;
}
