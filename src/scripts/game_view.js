import Game from "./game";
import Boss from "./boss";

class GameView {
  static UP_KEYS = ["ArrowUp", 'w']
  static DOWN_KEYS = ["ArrowDown", 's']
  static RIGHT_KEYS = ["ArrowRight", 'd']
  static LEFT_KEYS = ["ArrowLeft", 'a']
  static IGNORE_TARGETS = [
    "sound-on", 
    "sound-off", 
    "sound-icons-container", 
    "touch-on", 
    "touch-off", 
    "touch-container"
  ]

  constructor(canvas, ctx) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.game = new Game(canvas, this);

    this.scoreSpan = document.getElementById("score");
    this.playerHealthBar = document.getElementById("player-health-bar");
    this.bossHealthBar = document.getElementById("boss-health-bar");
    this.bossInfo = document.getElementById("boss-info");
    this.waveInfo = document.getElementById("wave-info");
    this.waveSpan = document.getElementById("wave-number");
    this.enemiesRemainingSpan = document.getElementById("enemies-remaining");

    const backgroundImg = new Image();
    backgroundImg.src = "src/assets/images/game_background.png";
    this.backgroundOptions = {
      img: backgroundImg,
      scale: 550 / backgroundImg.height,
      x: 0,
      y: 0,
      dy: .75
    }

    this.touchOnElement = document.getElementById("touch-on");
    this.touchOffElement = document.getElementById("touch-off");
    this.bindMouseFollowListener();
    this.bindToggleKeybindListener();

    this.pause = false;
    this.messageDrawn = false;
    this.bindStartHandler();
  }

  start() {
    this.lastTime = 0;
    requestAnimationFrame(this.animate.bind(this));
  }

  animate(time) {
    if (this.game.startScreen || this.game.gameOver || this.game.win) {
      this.drawStartWinGameOver();
    } else if (this.pause) {

    } else {
      this.updateInformation();
      this.draw();
      const timeDelta = time - this.lastTime;
      this.game.step(timeDelta);
    }

    this.lastTime = time;
    requestAnimationFrame(this.animate.bind(this));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.drawBackground();

    for (let key in this.game.allMovingObjects) {
      Object.values(this.game.allMovingObjects[key]).forEach(obj => obj.draw(this.ctx));
    }
  }

  drawBackground() {
    const img = this.backgroundOptions.img;
    const scale = this.backgroundOptions.scale;
    let imgW = img.width;
    let imgH = img.height;
    const x = this.backgroundOptions.x;

    if (imgH * scale > this.canvasHeight) this.backgroundOptions.y = this.canvasHeight - imgH;

    if (imgH * scale <= this.canvasHeight) {
      if (this.backgroundOptions.y > this.canvasHeight) this.backgroundOptions.y = -imgH + this.backgroundOptions.y;
      if (this.backgroundOptions.y > 0) this.ctx.drawImage(img, x, -imgH + this.backgroundOptions.y, imgW, imgH);
      if (this.backgroundOptions.y - imgH > 0) this.ctx.drawImage(img, x, -imgH * 2 + this.backgroundOptions.y, imgW, imgH);
    } else {
      if (this.backgroundOptions.y > this.canvasHeight) this.backgroundOptions.y = this.canvasHeight - imgH;
      if (this.backgroundOptions.y > this.canvasHeight - imgH) this.ctx.drawImage(img, x, this.backgroundOptions.y - imgH + 1, imgW, imgH);
    }

    this.ctx.drawImage(img, x, this.backgroundOptions.y, imgW, imgH);
    this.backgroundOptions.y += this.backgroundOptions.dy;
  }

  updateInformation() {
    this.updateScore();
    this.updateHealthBar('player');

    if (this.game.bossFight) {
      this.updateHealthBar('boss');
    } else {
      this.waveSpan.innerText = this.game.enemyWave;
      this.enemiesRemainingSpan.innerText = this.game.enemiesRemaining;
    }
  }

  updateScore() {
    this.scoreSpan.innerText = this.game.score;
  }

  updateHealthBar(type) {
    let obj, healthBar;
    if (type === 'player') {
      obj = this.game.player;
      healthBar = this.playerHealthBar;
    } else {
      obj = this.game.boss;
      healthBar = this.bossHealthBar;
    }
    let health = obj.health;

    const healthPoint = document.createElement("li");
    healthPoint.setAttribute("class", `${type}-health-point`);

    if (type === 'boss') health = Math.ceil(health / (Boss.MAX_HEALTH / 10));

    if (healthBar.children.length < health) {
      for (let i = 0; i < health - healthBar.children.length; i++) {
        healthBar.appendChild(healthPoint);
      }
    } else if ((healthBar.children.length > health)) {
      for (let i = 0; i < healthBar.children.length - health; i++) {
        const lastChild = healthBar.lastChild;
        if (lastChild) healthBar.removeChild(healthBar.lastChild);
      }
    }
  }

  switchGameInformation() {
    if (this.game.bossFight) {
      this.waveInfo.style.display = "none";
      this.bossInfo.style.display = "flex";
    } else {
      this.waveInfo.style.display = "flex";
      this.bossInfo.style.display = "none";
    }
  }

  drawStartWinGameOver() {
    if (!this.messageDrawn) {
      const message = this.game.startScreen 
                      ?  ["Press any key or click here to", "START"]
                      : this.game.gameOver
                        ? "GAME OVER"
                        : "YOU WIN"

      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";

      if (this.game.startScreen) {
        this.ctx.font = "40px roboto";
        this.ctx.fillText(message[0], this.canvasWidth/2, this.canvasHeight/2 - 50);
        this.ctx.font = "48px roboto";
        this.ctx.fillText(message[1], this.canvasWidth/2, this.canvasHeight/2);
      } else {
        this.ctx.font = "48px roboto";
        this.ctx.fillText(message, this.canvasWidth/2, this.canvasHeight/2);
      }
      this.messageDrawn = true;

      if (this.game.gameOver || this.game.win) {
        this.removeControlHandlers();
        this.updateScore();
        setTimeout(this.drawRetryKey.bind(this, this.ctx), 3000)
      };
    }
  }

  drawRetryKey() {
    this.ctx.font = "24px roboto";
    this.ctx.fillText("(press any key or click here to retry)", this.canvasWidth/2, this.canvasHeight/2 + 50);
    this.bindRetryHandler();
  }

  bindStartHandler() {
    this.startHandler = this.handleStartKey.bind(this);
    document.addEventListener("keypress", this.startHandler);
    this.canvas.addEventListener("click", this.startHandler);
  }

  handleStartKey(event) {
    if (event?.key === " ") event.preventDefault();

    this.game.sounds.switchBGM("waveBGM");
    this.game.startScreen = false;
    document.removeEventListener("keypress", this.startHandler)
    this.canvas.removeEventListener("click", this.startHandler)
    this.bindControlHandlers();
    setTimeout(this.game.resetAddEnemyCooldown.bind(this.game), 1500);
    this.messageDrawn = false;
  }

  bindRetryHandler() {
    this.retryHandler = this.handleRetryKey.bind(this);
    document.addEventListener("keypress", this.retryHandler);
    this.canvas.addEventListener("click", this.retryHandler);
  }

  handleRetryKey(event) {
    if (event?.key === " ") event.preventDefault();

    document.removeEventListener("keypress", this.retryHandler);
    this.canvas.removeEventListener("click", this.retryHandler);
    this.game.reset();
    this.bindControlHandlers();
    setTimeout(this.game.resetAddEnemyCooldown.bind(this.game), 1500);
    this.messageDrawn = false;
  }

  handleKeyDown(event) {
    event.preventDefault();

    if (GameView.RIGHT_KEYS.includes(event.key)) this.game.player.keysPressed.right = true;
    else if (GameView.LEFT_KEYS.includes(event.key)) this.game.player.keysPressed.left = true;
    else if (GameView.UP_KEYS.includes(event.key)) this.game.player.keysPressed.up = true;
    else if (GameView.DOWN_KEYS.includes(event.key)) this.game.player.keysPressed.down = true;
    else if (event.key === " ") this.game.player.keysPressed.shoot = true;
  }
  
  handleKeyUp(event) {
    if (event.key === " ") event.preventDefault();

    if (GameView.RIGHT_KEYS.includes(event.key)) this.game.player.keysPressed.right = false;
    else if (GameView.LEFT_KEYS.includes(event.key)) this.game.player.keysPressed.left = false;
    else if (GameView.UP_KEYS.includes(event.key)) this.game.player.keysPressed.up = false;
    else if (GameView.DOWN_KEYS.includes(event.key)) this.game.player.keysPressed.down = false;
    else if (event.key === " ") this.game.player.keysPressed.shoot = false;
  }

  handleMouseDown(event) {
    const parentId = event.target.parentNode.id;
    if (!GameView.IGNORE_TARGETS.includes(parentId)) this.game.player.keysPressed.shoot = true;
  }

  handleMouseUp() {
    this.game.player.keysPressed.shoot = false;
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const xScale = this.canvas.width / rect.width;
    const yScale = this.canvas.height / rect.height;
    const x = (event.clientX - rect.left) * xScale;
    const y = (event.clientY - rect.top) * yScale;
    this.game.player.mousePosition = {x, y};
  }

  handleMouseOut() {
    this.game.player.mousePosition = null;
  }

  handleMouseFollowToggle() {
    if (this.game.player.mouseFollow) {
      this.touchOnElement.style.display = 'none';
      this.touchOffElement.style.display = 'block';
    } else {
      this.touchOnElement.style.display = 'block';
      this.touchOffElement.style.display = 'none';
    }

    this.game.player.mouseFollow = !this.game.player.mouseFollow;
  }

  bindMouseFollowListener() {
    const touchContainer = document.getElementById("touch-icons-container");
    touchContainer.addEventListener("click", this.handleMouseFollowToggle.bind(this));
  }

  handlePauseToggle() {
    // add pause function to sounds later
    // also pause all setTimeouts and setIntervals
    this.pause = !this.pause;
  }

  handleToggleKeybinds(event) {
    if (event.key === " ") event.preventDefault();
    else if (event.key === "m") this.handleMouseFollowToggle();
    else if (event.key === "k") this.game.sounds.handleSoundToggle();
    else if (event.key === "p") this.handlePauseToggle();
  }

  bindToggleKeybindListener() {
    document.addEventListener("keydown", this.handleToggleKeybinds.bind(this));
  }

  bindControlHandlers() {
    this.keyDownHandler = this.handleKeyDown.bind(this);
    this.keyUpHandler = this.handleKeyUp.bind(this);
    this.mouseDownHandler = this.handleMouseDown.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.mouseOutHandler = this.handleMouseOut.bind(this);

    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);
    document.addEventListener("mousedown", this.mouseDownHandler);
    document.addEventListener("mouseup", this.mouseUpHandler);
    document.addEventListener("mousemove", this.mouseMoveHandler);
    document.addEventListener("mouseout", this.mouseOutHandler);
  }

  removeControlHandlers() {
    document.removeEventListener("keydown", this.keyDownHandler);
    document.removeEventListener("keyup", this.keyUpHandler);
    document.removeEventListener("mousedown", this.mouseDownHandler);
    document.removeEventListener("mouseup", this.mouseUpHandler);
    document.removeEventListener("mousemove", this.mouseMoveHandler);
    document.removeEventListener("mouseout", this.mouseOutHandler);
  }
}

export default GameView;