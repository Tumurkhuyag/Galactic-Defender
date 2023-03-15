class Sound {
  constructor(game) {
    this.waveBGM = document.createElement("audio");
    this.waveBGM.src = "src/sounds/wave_bgm.mp3";
    this.waveBGM.preload = 'auto';
    this.waveBGM.loop = true;

    this.bossIncomingBGM = document.createElement("audio");
    this.bossIncomingBGM.src = "src/sounds/boss_incoming_bgm.mp3";
    this.bossIncomingBGM.preload = 'auto';
    this.bossIncomingBGM.loop = true;

    this.bossBGM = document.createElement("audio");
    this.bossBGM.src = "src/sounds/boss_bgm.mp3"
    this.bossBGM.preload = 'auto';
    this.bossBGM.loop = true;

    this.playerDeathSound = document.createElement("audio");
    this.playerDeathSound.src = "src/sounds/player_death.wav"
    this.playerDeathSound.preload = 'auto';

    this.bossDeathSound = document.createElement("audio");
    this.bossDeathSound.src = "src/sounds/boss_death.mp3"
    this.bossDeathSound.preload = 'auto';

    this.gameOverSound = document.createElement("audio");
    this.gameOverSound.src = "src/sounds/game_over.mp3"
    this.gameOverSound.preload = 'auto';

    this.winSound = document.createElement("audio");
    this.winSound.src = "src/sounds/win.mp3"
    this.winSound.preload = 'auto';

    this.playerHurtSound = document.createElement("audio");
    this.playerHurtSound.src = "src/sounds/player_hurt.wav"
    this.playerHurtSound.preload = 'auto';

    this.audioSources = {
      defaultProjectile: "src/sounds/default_laser.wav",
      playerProjectile: "src/sounds/player_laser.wav",
      enemyProjectile: "src/sounds/enemy_laser.wav",
      bossProjectile: "src/sounds/boss_projectile.wav",
      explosion: "src/sounds/explosion.wav"
    }

    this.currentBGM = this.waveBGM;
    this.currentSounds = [];
    // this.toggle = false;
    this.toggle = true;
    this.game = game;

    this.bindToggleListener();
  }

  switchBGM(key) {
    this.currentBGM.pause();
    this.currentBGM.currentTime = 0;

    this.currentBGM = this[key];
    if (this.toggle) this.currentBGM.play();
  }

  playPlayerDeathSound() {
    this.currentBGM.pause();
    if (this.toggle) this.playerDeathSound.play();
  }

  playBossDeathSound() {
    this.currentBGM.pause();
    if (this.toggle) this.bossDeathSound.play();
  }

  playGameOverSound() {
    this.currentBGM.pause();
    if (this.toggle) this.gameOverSound.play();
  }

  playWinSound() {
    this.currentBGM.pause();
    if (this.toggle) this.winSound.play();
  }

  playPlayerHurtSound() {
    if (this.toggle) this.playerHurtSound.play();
  }

  toggleOff() {
    this.currentBGM.pause();
    this.reset();
    this.toggle = false;
  }

  toggleOn() {
    if (!this.game.startScreen && !this.game.gameOver && !this.game.win) {
      this.currentBGM.play();
    }
    this.toggle = true;
  }

  add(audioSourceKey) {
    // console.log(audioSourceKey);
    if (this.toggle) {
      const newAudio = document.createElement("audio");
      newAudio.src = this.audioSources[audioSourceKey];
      if (audioSourceKey === "enemyProjectile") newAudio.volume = 0.02;
      this.currentSounds.push(newAudio);
      newAudio.play();
    }
  }

  clear() {
    this.currentSounds = this.currentSounds.filter(sound => !sound.ended);
  }

  reset() {
    this.bossDeathSound.pause();
    this.bossDeathSound.currentTime = 0;

    this.playerDeathSound.pause();
    this.playerDeathSound.currentTime = 0;

    this.gameOverSound.pause();
    this.gameOverSound.currentTime = 0;

    this.winSound.pause();
    this.winSound.currentTime = 0;

    this.playerHurtSound.pause();
    this.playerHurtSound.currentTime = 0;

    this.waveBGM.pause();
    this.waveBGM.currentTime = 0;

    this.bossIncomingBGM.pause();
    this.bossIncomingBGM.currentTime = 0;

    this.bossBGM.pause();
    this.bossBGM.currentTime = 0;

    this.currentSounds.forEach(sound => sound.pause());
    this.currentSounds = [];
  }

  bindToggleListener() {

  }

  handleToggle(event) {

  }
}

export default Sound;