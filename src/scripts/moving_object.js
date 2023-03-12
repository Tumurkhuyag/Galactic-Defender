class MovingObject {
  static NORMAL_FRAME_TIME_DELTA = 1000 / 60;

  constructor(argsObject) {
    this.position = argsObject["position"];
    this.velocity = argsObject["velocity"];
    this.health = argsObject["health"];
    this.game = argsObject["game"];
    this.width = argsObject["width"];
    this.height = argsObject["height"];
    this.image = argsObject["image"];

    // this.position[0] = Math.round(this.position[0]);
    // this.position[1] = Math.round(this.position[1]);
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.position[0], this.position[1], this.width, this.height);
  }

  collideCheck(otherObj) {
    // console.log("collide check");
    const thisHitboxes = this.getHitbox();
    const otherHitboxes = otherObj.getHitbox();

    // let found = false;
    const found = thisHitboxes.some((thisBox) => {
      return otherHitboxes.some((otherBox) => {
        return this.rectangleCollision(thisBox, otherBox);
      })
    })

    if (found) {
      // console.log("collision");
      this.handleCollided(otherObj);
    }
  }

  handleCollided(otherObj) {
    // two case: enemy/player to projectile, player to enemy
    const otherObjClass = otherObj.constructor.name;

    if (otherObjClass === "Projectile") {
      // console.log("projectile collision");
      const damage = otherObj.health;
      otherObj.remove();
      this.damageTaken(damage);
    } else if (otherObjClass === "EnemyShip") {
      // take 1 damage if collided with enemy
      console.log("enemy collision");
    } else if (otherObjClass === "Boss") {
      // take more damage if collided with boss
      console.log("boss collision");
    }
  }

  rectangleCollision(box1, box2) {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.height + box1.y > box2.y
    )
  }

  getHitbox() {
    // to be overwritten for complex boss shapes (multiple x,y,width,height);
    // return an array of hitboxes
    const [x, y] = this.position;
    const width = this.width;
    const height = this.height;
    return [{
      x: x,
      y: y,
      width: width,
      height: height
    }]
  }

  move() {
    const newX = this.position[0] + this.velocity[0];
    const newY = this.position[1] + this.velocity[1];

    if (this.inXBounds(newX)) this.position[0] = newX;
    if (this.inYBounds(newY)) this.position[1] = newY;
  }

  move(timeDelta) {
    const velocityScale = timeDelta / MovingObject.NORMAL_FRAME_TIME_DELTA;
    const offsetX = this.velocity[0] * velocityScale;
    const offsetY = this.velocity[1] * velocityScale;

    const newX = this.position[0] + offsetX;
    const newY = this.position[1] + offsetY;

    if (this.inXBounds(newX)) this.position[0] = newX;
    if (this.inYBounds(newY)) this.position[1] = newY;
  }

  inXBounds(x) {
    return (x > 0 && x < this.game.canvasWidth - this.width);
  }

  inYBounds(y) {
    return (y > 0 && y < this.game.canvasHeight - this.height);
  }

  inBounds(position) {
    return this.inXBounds(position[0]) && this.inYBounds(position[1]);
  }
}

export default MovingObject;