let grid,
  cols,
  rows,
  mineCount,
  remainingFlags = 0;
let w = 30;
let Minefactor = 0.1;
let noOfBombs = 0;
let tileImg, emptyTile, bombImg, flagImg;
let isGameOver = false;
let font;
let flagDiv;
let revealedArray = [],
  confirmedBombs = [],
  uncheckedCellQueue = [],
  guessedElements = [];
  
let AIsolvedCount = [0];
let isAlerted = false;
let activateAI,
  isAISolving = false;
let finalResult = [];
let gameNumber = 0;
let continuousAI = false;
let results = { winsCount: 0, lossesDueToRandom: 0, lossesDueToGuess: 0 };
let testCount = 100;

function preload() {
  tileImg = loadImage("./src/tile.png");
  emptyTile = loadImage("./src/tile1.png");
  bombImg = loadImage("./src/bomb.png");
  flagImg = loadImage("./src/flag.png");
  font = loadFont("./src/font.ttf");
}
function setup() {
  fill(200);
  topBar = createDiv("");
  flagDiv = createDiv("No of flags left : " + remainingFlags);
  topBar.elt.className = "topBar";
  flagDiv.elt.className = "topBarText";
  topBar.elt.append(flagDiv.elt);

  refreshBtn = document.createElement("IMG");
  refreshBtn.src = "./src/refresh.svg";
  refreshBtn.height = 20;
  refreshBtn.className = "refreshImage";
  topBar.elt.append(refreshBtn);

  createCanvas(601, 601);
  activateAI = createButton("Activate Ai");
  activateAI.mousePressed(_ => {
    isAISolving ? " " : initiateAI();
  });
  col = color(127, 0.5);
  activateAI.style("background-color", col);
  activateAI.style("outline-width", 0);
  activateAI.elt.className = "activateButton";

  activateContinuousAI = createButton("Run "+testCount+" tests for AI");
  activateContinuousAI.mousePressed(_ => {
    continuousAI = true;
    initiateAI();
  });
  activateContinuousAI.style("background-color", col);
  activateContinuousAI.style("outline-width", 0);
  activateContinuousAI.elt.className = "activateButton multipleAI";

  continuousAI ? "" : frameRate(5);
  cols = floor(width / w);
  rows = floor(height / w);
  noOfBombs = Minefactor * rows * cols;
  grid = new Array(cols);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = new Array(rows);
  }

  newGame();
}

function gameOver() {
  isAISolving = false;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].isFlagged ? (grid[i][j].isFlagged = false) : "";
      grid[i][j].isMine ? (grid[i][j].isRevealed = true) : "";
      isGameOver = true;
    }
  }
  if (results.winsCount + results.lossesDueToGuess + results.lossesDueToRandom < testCount && continuousAI) {
    setTimeout(() => {
      newGame();
      gameNumber++;
      initiateAI();
    }, 0);
  } else if (results.winsCount + results.lossesDueToGuess + results.lossesDueToRandom > testCount) console.log(results);
}
function declareIfWin() {
  if (revealedArray.length + confirmedBombs.length == rows * cols && !isGameOver) {
    isGameOver = true;
    isAISolving = false;
    setTimeout(
      () => {
        if (isAlerted === false) {
          continuousAI ? "" : alert("Congratulations You Won");
          isAlerted = true;
          finalResult[gameNumber] = "Win";
          results.winsCount++;
          if (results.winsCount + results.lossesDueToGuess + results.lossesDueToRandom < testCount && continuousAI) {
            setTimeout(() => {
              newGame();
              gameNumber++;
              initiateAI();
            }, 0);
          } else if (results.winsCount + results.lossesDueToGuess + results.lossesDueToRandom > testCount)
            console.log(results);
        }
      },
      continuousAI ? 0 : 100
    );
  }
}

function newGame() {
  isGameOver = false;
  (revealedArray = []), (confirmedBombs = []), (uncheckedCellQueue = []), (guessedElements = []);
  AIsolvedCount = [0];
  isAlerted = false;
  activateAI.show();
  activateContinuousAI.show()
  isAISolving = false;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j, w);
    }
  }

  for (mineCount = 0; mineCount < Math.floor(noOfBombs); ) {
    let i = floor(random(cols));
    let j = floor(random(rows));

    if (!grid[i][j].isMine) {
      grid[i][j].isMine = true;
      mineCount++;
      for (let x = i - 1; x <= i + 1; x++) {
        for (let y = j - 1; y <= j + 1; y++) {
          if (grid[x] && grid[x][y]) {
            grid[x][y].neighbourCount++;
          }
        }
      }
    }
  }
  remainingFlags = floor(noOfBombs);
  flagDiv.elt.innerHTML = "No of flags left : " + remainingFlags;
}

function initiateAI() {
  let ai = new AI();
  isAISolving = true;
  ai.beginSolving(ai);
  activateAI.hide();
  activateContinuousAI.hide();

  if (confirmedBombs.length > 0 && confirmedBombs.length < noOfBombs) {
    confirmedBombs.forEach(ele => {
      ele.isFlagged = false;
    });
    confirmedBombs = [];
    remainingFlags = floor(noOfBombs);
  }
}

function mousePressed(e) {
  if (e.target === refreshBtn) {
    newGame();
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].contains(mouseX, mouseY) && !isGameOver) {
        if (e.metaKey && remainingFlags >= 0 && !grid[i][j].isRevealed) {
          setFlagAt(i, j);
        } else if (!grid[i][j].isFlagged && !(remainingFlags == 0 && e.metaKey)) {
          if (!grid[i][j].isRevealed) {
            grid[i][j].reveal();
          }
        }
      }
    }
  }
}
function setFlagAt(i, j, unflag = true) {
  if (unflag) {
    if (grid[i][j].isFlagged) {
      grid[i][j].isFlagged = false;
      remainingFlags++;
      confirmedBombs = confirmedBombs.filter(comparer([grid[i][j]]));
    } else {
      grid[i][j].isFlagged = true;
      remainingFlags--;
      confirmedBombs.push(grid[i][j]);
    }
  } else {
    if (!grid[i][j].isFlagged) {
      remainingFlags--;
      confirmedBombs.push(grid[i][j]);
    }
    grid[i][j].isFlagged ? "" : (grid[i][j].isFlagged = true);
  }
  flagDiv.elt.innerHTML = "No of flags left : " + remainingFlags;
  declareIfWin();
}

function draw() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }
}
