/* Global variables */
const canvas = document.querySelector("#game");
const game = canvas.getContext("2d");
const $btnContainer = document.querySelector(".btns");
const $lifes = document.querySelector("#lifes");
const $tiempo = document.querySelector("#tiempo");
const $record = document.querySelector("#record");
const $recordContainer = document.querySelector("#recordContainer");

/* Functions */
function formatUnitTime(unitTime) {
  return `${unitTime}`.padStart(2, "0");
}
function formatTime(ms) {
  const cs = parseInt(ms / 10) % 100; //centisegundos
  const seg = parseInt(ms / 1000) % 60; //segundos
  const min = parseInt(ms / 60000) % 60; //minutos
  const hr = parseInt(ms / 3600000) % 24; //horas
  const csStr = formatUnitTime(cs);
  const segStr = formatUnitTime(seg);
  const minStr = formatUnitTime(min);
  const hrStr = formatUnitTime(hr);
  return `${hrStr}:${minStr}:${segStr}:${csStr}`;
}

function fixNumber(num) {
  return Number(num.toFixed(3));
}

/* Class */

class ElementGame {
  constructor({ x = null, y = null }) {
    this.x = x;
    this.y = y;
  }
}
class Player extends ElementGame {
  constructor({ x = null, y = null, limitTopLive = 3 }) {
    super({ x, y });
    this.limitTopLive = limitTopLive;
    this.life = limitTopLive;
    this.minimumLifeLimit = 0;
    this.tiempo = null;
    this.emoji = emojis["PLAYER"];
  }
  moveByKey(evt) {
    const key = evt.key;
    const objKeyToMove = {
      ArrowUp: function () {
        player.moveUp();
      },
      ArrowDown: function () {
        player.moveDown();
      },
      ArrowLeft: function () {
        player.moveLeft();
      },
      ArrowRight: function () {
        player.moveRight();
      },
    };

    const move = objKeyToMove[key] || function () {};

    move();
    objCanvas.clearGame();
    objCanvas.validarColision();
    objCanvas.renderGame();
  }
  moveByBtn(evt) {
    const target = evt.target;
    const targetId = target.getAttribute("id");
    const objBtns = {
      up: function () {
        player.moveUp();
      },
      down: function () {
        player.moveDown();
      },
      left: function () {
        player.moveLeft();
      },
      right: function () {
        player.moveRight();
      },
    };

    const move = objBtns[targetId] || function () {};
    move();
    objCanvas.clearGame();
    objCanvas.validarColision();
    objCanvas.renderGame();
  }
  moveUp() {
    const nextMove = this.y - objCanvas.elementsSize;
    this.y = fixNumber(nextMove);
    objCanvas.limitTop = objCanvas.elementsSize;
    if (this.y < objCanvas.limitTop) {
      this.y = objCanvas.limitTop;
    }
  }
  moveDown() {
    const nextMove = this.y + objCanvas.elementsSize;
    this.y = fixNumber(nextMove);
    objCanvas.limitBottom = objCanvas.size;

    if (this.y >= objCanvas.limitBottom) {
      this.y = objCanvas.limitBottom;
    }
  }
  moveLeft() {
    const nextMove = this.x - objCanvas.elementsSize;
    this.x = fixNumber(nextMove);
    objCanvas.limitLeft = objCanvas.elementsSize;
    if (this.x < objCanvas.limitLeft) {
      this.x = objCanvas.limitLeft;
    }
  }
  moveRight() {
    const nextMove = this.x + objCanvas.elementsSize;
    this.x = fixNumber(nextMove);
    objCanvas.limitRight = objCanvas.size;

    if (this.x >= objCanvas.limitRight) {
      this.x = objCanvas.limitRight;
    }
  }
  resetPositionPlayer() {
    this.x = null;
    this.y = null;
  }
  renderPlayer() {
    game.fillText(this.emoji, this.x, this.y);
  }
  renderLife() {
    const emojiLife = emojis["HEART"];
    $lifes.textContent = emojiLife.repeat(this.lifes);
  }
  resetLifePlayer() {
    this.lifes = this.limitTopLive;
  }
  loseLife() {
    this.lifes--;
    const { lifes, minimumLifeLimit } = this;
    if (lifes < minimumLifeLimit) {
      objCanvas.loseGame();
      return;
    }
    this.resetPositionPlayer();
  }
  repositionPlayer() {
    if (this.x && this.y) {
      const porcentTotalCanvas = 100; //100%
      const porcentX = (this.x * porcentTotalCanvas) / objCanvas.oldSize;
      const porcentY = (this.y * porcentTotalCanvas) / objCanvas.oldSize;
      this.x = (porcentX * objCanvas.size) / porcentTotalCanvas;
      this.y = (porcentY * objCanvas.size) / porcentTotalCanvas;
    }
  }
}
class Canvas {
  constructor({ lvl = null }) {
    this.size = null;
    this.limitRight = this.size;
    this.limitLeft = null;
    this.limitTop = null;
    this.lvl = lvl;
    this.elementsSize = null;
    this.record = null;
    this.timeStart = null;
    this.enemiesPositions = [];
    this.arrMapLvl = null;
    this.timeInterval = null;
  }
  clearGame() {
    game.clearRect(0, 0, this.size, this.size);
  }
  resetTime() {
    $tiempo.textContent = "";
    player.tiempo = null;
    clearInterval(this.timeInterval);
  }
  resetGame() {
    this.resetTime();
    this.lvl = null;
    player.resetLifePlayer();
    this.selectMap();
    player.resetPositionPlayer();
  }
  loseGame() {
    this.startGame();
  }
  ajustarRecord() {
    this.record = JSON.parse(localStorage.getItem("record"));
    const tiempo = String(player.tiempo);
    if (!this.record || tiempo < this.record) {
      console.log(2);
      localStorage.setItem("record", tiempo);
    }
  }
  renderRecord() {
    this.ajustarRecord();
    if (this.record) {
      $recordContainer.classList.remove("inactive");
      $record.textContent = formatTime(this.record);
    }
  }
  gameEnd() {
    this.renderRecord();
    clearInterval(this.timeInterval);
    this.startGame();
  }
  levelUp() {
    this.lvl++;
    if (!maps[this.lvl]) {
      this.gameEnd();
      return;
    }

    this.selectMap();
  }
  validarColision() {
    const premioX = fixNumber(premio.x);
    const playerX = fixNumber(player.x);
    const premioY = fixNumber(premio.y);
    const playerY = fixNumber(player.y);
    const isColitionHorizontal = premioX === playerX;
    const isColitionVertical = premioY === playerY;
    if (isColitionHorizontal && isColitionVertical) {
      this.levelUp();
    }
    const enemyPosition = this.enemiesPositions.find(({ x, y }) => {
      const enemyX = fixNumber(x);
      const enemyY = fixNumber(y);
      const isColitionHorizontal = enemyX === playerX;
      const isColitionVertical = enemyY === playerY;
      return isColitionHorizontal && isColitionVertical;
    });

    if (enemyPosition) {
      player.loseLife();
    }
  }
  selectMap() {
    if (!this.lvl) {
      this.lvl = 0;
    }
    const map = maps[this.lvl];
    const mapRows = map.trim().split("\n");
    this.arrMapLvl = mapRows.map((row) => row.trim().split(""));
  }

  setCanvasSize() {
    this.oldSize = this.size;

    const porcentWidth = 0.7;

    if (window.innerHeight > window.innerWidth) {
      this.size = window.innerWidth * porcentWidth;
    }
    if (window.innerHeight < window.innerWidth) {
      this.size = window.innerHeight * porcentWidth;
    }

    canvas.setAttribute("width", this.size);
    canvas.setAttribute("height", this.size);

    const elementsQuantity = 10;

    this.elementsSize = this.size / elementsQuantity;

    game.font = this.elementsSize + "px verdana";
    game.textAlign = "end";

    player.repositionPlayer();
    this.renderGame();
  }
  renderTime() {
    const ms = Date.now() - this.timeStart;
    player.tiempo = ms;
    $tiempo.textContent = formatTime(ms);
  }
  renderGame() {
    this.enemiesPositions = [];
    this.arrMapLvl.forEach((row, rowI) => {
      row.forEach((col, colI) => {
        const emoji = emojis[col];
        const posX = this.elementsSize * (colI + 1);
        const posY = this.elementsSize * (rowI + 1);
        game.fillText(emoji, posX, posY);
        const { x, y } = player;
        if (col === "O") {
          if (!x && !y) {
            player.x = posX;
            player.y = posY;
          }
        }
        if (col === "I") {
          premio.x = posX;
          premio.y = posY;
        }
        if (col === "X") {
          this.enemiesPositions.push({
            x: posX,
            y: posY,
          });
        }
      });
    });
    player.renderPlayer();
    player.renderLife();
  }
  startCountTime() {
    this.timeStart = Date.now();
    const msInterval = 1;
    this.timeInterval = setInterval(this.renderTime.bind(this), msInterval);
  }
  startGame() {
    this.resetGame();
    this.renderRecord();
    this.setCanvasSize();
    this.startCountTime();
  }
}
const objCanvas = new Canvas({});
const premio = new ElementGame({});
const player = new Player({});

/* addEventListeners */

window.addEventListener("load", objCanvas.startGame.bind(objCanvas));
window.addEventListener("resize", objCanvas.setCanvasSize.bind(objCanvas));
$btnContainer.addEventListener("click", player.moveByBtn.bind(player));
window.addEventListener("keydown", player.moveByKey.bind(player));
