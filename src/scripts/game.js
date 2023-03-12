import PlayerShip from "./player_ship";
import EnemyShip from "./enemy_ship";
import Boss from "./boss";

class Game {
  constructor(canvas) {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    // this.enemyWave = 0;
    this.enemyWave = 10;

    this.addEnemyOnCooldown = false;
    this.addedEnemies = 0;
    this.enemiesRemaining = 0;
    this.enemyWaveCount = 0;

    this.enemiesDefeated = 0;
    this.gameOver = false;
    
    this.allMovingObjects = {
      player: new PlayerShip(this),
      enemies: [],
      projectiles: [],
      particles: []
    };

    this.boss = new Boss(this);
  }

  clearNulls() {
    for (let key in this.allMovingObjects) {
      const objectsValue = this.allMovingObjects[key]
      if (objectsValue instanceof Array) {
        objectsValue.filter(el => el);
      }
    }
  }

  moveObjects() {
    for (let key in this.allMovingObjects) {
      const objectsValue = this.allMovingObjects[key]
      if (objectsValue instanceof Array) {
        objectsValue.forEach(obj => {
          if (obj) obj.move()
        });
      } else {
        if (objectsValue) objectsValue.move();
      }
    }
  }

  draw(ctx) {
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let key in this.allMovingObjects) {
      const objectsValue = this.allMovingObjects[key]
      if (objectsValue instanceof Array) {
        objectsValue.forEach(obj => {
          if (obj) obj.draw(ctx);
        });
      } else {
        if (objectsValue) objectsValue.draw(ctx);
      }
    }
  }

  updateInformation() {
    const player = this.allMovingObjects.player;
    const playerHealthBar = document.getElementById("player-health-bar");

    const playerHealthPoint = document.createElement("li");
    playerHealthPoint.setAttribute("class", "player-health-point");

    if (playerHealthBar.children.length < player.health) {
      for (let i = 0; i < player.health - playerHealthBar.children.length; i++) {
        playerHealthBar.appendChild(playerHealthPoint);
      }
    } else if ((playerHealthBar.children.length > player.health)) {
      for (let i = 0; i < playerHealthBar.children.length - player.health; i++) {
        playerHealthBar.removeChild();
      }
    }

    const waveSpan = document.getElementById("wave-number");
    waveSpan.innerText = this.enemyWave;

    const enemiesRemainingSpan = document.getElementById("enemies-remaining");
    enemiesRemainingSpan.innerText = this.enemiesRemaining;
  }

  setEnemies() {
    if (this.enemiesRemaining === 0) {
      if (this.enemyWave < 10) {
        this.enemyWave += 1;
        this.enemyWaveCount = this.enemyWave * 5;
        this.enemiesRemaining = this.enemyWaveCount;
        this.addedEnemies = 0;
      } else {
        this.setBoss();
      }
    }

    if (!this.addEnemyOnCooldown && this.addedEnemies < this.enemyWaveCount) {
      const remaining = this.enemyWaveCount - this.addedEnemies;

      let numNewEnemies;
      if (remaining < 10) {
        numNewEnemies = remaining;
      } else {
        numNewEnemies = Math.floor(Math.random() * (10 - 3) + 3);
      }
      this.addedEnemies += numNewEnemies;

      for (let i = 0; i < numNewEnemies; i++) {
        const randPosX = Math.floor(Math.random() * this.canvasWidth);
        const randSpeed = Math.floor(Math.random() * (5 - 2) + 2)
        const randCooldown = Math.floor(Math.random() * (1000 - 450) + 450);

        this.allMovingObjects.enemies.push(new EnemyShip(this, randPosX, randSpeed, randCooldown));
      }

      this.addEnemyOnCooldown = true;
      const randTimeOut = Math.random() * (3000 - 1000) + 1000;
      setTimeout(this.resetAddEnemyCooldown.bind(this), randTimeOut);
    }
  }

  resetAddEnemyCooldown() {
    this.addEnemyOnCooldown = false;
  }

  setBoss() {
    this.switchGameInformation();
    this.allMovingObjects.enemies.push(this.boss);
  }

  switchGameInformation() {

  }
}

export default Game;