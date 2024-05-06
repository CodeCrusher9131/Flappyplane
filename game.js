
class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.score = 0;
        this.gameOver = false;
        this.bird = new Bird(this);
        this.obstacles = [];
        this.spawnInterval = 1500;
        this.lastSpawnTime = 0;
        this.background = new Background(this);
        this.image = new Image();
        this.image.src = 'Fighter.png';

        this.image.onload = () => {
            this.animate();
        };

        this.canvas.addEventListener('click', () => {
            if (!this.gameOver) {
                this.bird.flap();
            } else {
                this.restart();
            }
        });

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.background.resize(this.canvas.width, this.canvas.height);
        });

        this.animate();
    }

    animate() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background.draw();
        this.bird.update();
        this.bird.draw();
        this.updateObstacles();
        this.drawScore();

        if (!this.gameOver) {
            requestAnimationFrame(() => this.animate());
        }
    }

    updateObstacles() {
        const currentTime = new Date().getTime();
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.obstacles.push(new Obstacle(this));
            this.lastSpawnTime = currentTime;
        }

        this.obstacles.forEach((obstacle, index) => {
            obstacle.update();
            obstacle.draw();

            if (obstacle.collidesWith(this.bird)) {
                this.endGame();
            }

            if (obstacle.isOffScreen()) {
                this.obstacles.splice(index, 1);
                this.score++;
            }
        });
    }

    drawScore() {
        this.context.fillStyle = '#000';
        this.context.font = '24px Arial';
        this.context.fillText(`Score: ${this.score}`, 20, 40);
    }

    endGame() {
        this.gameOver = true;
        this.context.fillStyle = '#000';
        this.context.font = '48px Arial';
        this.context.fillText('Game Over', this.canvas.width / 2 - 120, this.canvas.height / 2);
    }

    restart() {
        this.score = 0;
        this.gameOver = false;
        this.bird.reset();
        this.obstacles = [];
        this.lastSpawnTime = new Date().getTime();
        this.animate();
    }
}

class Background {
    constructor(game) {
        this.game = game;
        this.image = new Image();
        this.image.src = 'background.jpg';
        this.speed = -1;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        // Load the image and update its dimensions
        this.image.onload = () => {
            this.resize(this.game.canvas.width, this.game.canvas.height);
        };
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    draw() {
        // Draw the background image at the appropriate size and position
        this.game.context.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.game.context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        this.x += this.speed;

        // Reset the position if the background has scrolled completely
        if (this.x <= -this.width) this.x = 0;
    }
}

class Bird {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 100;
        this.x = 200;
        this.y = this.game.canvas.height / 2 - this.height / 2;
        this.velocity = 0;
        this.gravity = 0.4;
        this.jumpStrength = -8;
        this.image = new Image();
        this.image.src = 'Fighter.png';
    }

    draw() {
        this.game.context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        if (this.y < 0 || this.y + this.height > this.game.canvas.height) {
            this.game.endGame();
        }

        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height > this.game.canvas.height) {
            this.y = this.game.canvas.height - this.height;
            this.velocity = 0;
        }
    }

    flap() {
        this.velocity = this.jumpStrength;
    }

    reset() {
        this.y = this.game.canvas.height / 2 - this.height / 2;
        this.velocity = 0;
    }
}

class Obstacle {
    constructor(game) {
        this.game = game;
        this.width = 150;
        this.height = Math.random() * 200 + 50;
        this.x = this.game.canvas.width;
        this.y = Math.random() * (this.game.canvas.height - this.height);
        this.speed = 5;
        this.image = new Image();
        this.image.src = 'pillar.png';
    }

    draw() {
        this.game.context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(bird) {
        return (
            bird.x < this.x + this.width &&
            bird.x + bird.width > this.x &&
            bird.y < this.y + this.height &&
            bird.y + bird.height > this.y
        );
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
