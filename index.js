//v1.0
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const ENV = {
    GROUND_HEIGHT: 40
}

const player = {
    posX: canvas.width / 2,
    posY: canvas.height - 50,
    radius: 10,
    speed: 3,
    jumpSpeed: 3,
}

const pressedButtons = {
    right: false,
    left: false,
    space: false
}

const blocks = [
    {
        x: 0,
        y: 300,
        width: 300,
        height: 30,
    },
    {
        x: 0,
        y: 450,
        width: 400,
        height: 50,
    },
    {
        x: 400,
        y: 100,
        width: 400,
        height: 30,
    },
]

const enemies = [

]
/*
{
    startX:
    startY:
    toX:
    toY:
}
*/

const bullets = [

]

let isCanMoveRight = true
let isCanMoveLeft = true
let isCanJump = true
let isCanFall = false
let jumpState = -1 // -1 - на земле, 1 прыгает вверх, 1 - 0.5 - инерция вверх(пробел отпущен), 0 - падение
let freeFallSpeed = 0
function playerMove() {
    const posPlusRadius = player.posX + player.radius
    const posMinusRadius = player.posX - player.radius

    const canvasRightLimit = posPlusRadius > 0 && posPlusRadius < canvas.width
    const canvasLeftLimit = posMinusRadius > 0 && posMinusRadius < canvas.width
    const canvasBottomLimit = player.posY < canvas.height - ENV.GROUND_HEIGHT - player.radius
    const canvasTopLimit = player.posY > player.radius


    if (pressedButtons.right && canvasRightLimit) {
        for(const block of blocks) {
            const isPlayerAgainstBlock = player.posY > block.y && player.posY < block.y + block.height
            const isPlayerTochBlockLeft = player.posX + player.radius  > block.x && player.posX < block.x + block.width
            isCanMoveRight = (isPlayerAgainstBlock && !isPlayerTochBlockLeft) || !isPlayerAgainstBlock
            if (!isCanMoveRight) break
        }
        if(isCanMoveRight) {

            player.posX += player.speed

        }
    }
    if (pressedButtons.left && canvasLeftLimit) {
        for(const block of blocks) {
            const isPlayerAgainstBlock = player.posY > block.y && player.posY < block.y + block.height
            const isPlayerTochBlockRight = player.posX - player.radius  < block.x + block.width && player.posX > block.x
            isCanMoveLeft = (isPlayerAgainstBlock && !isPlayerTochBlockRight) || !isPlayerAgainstBlock
            if (!isCanMoveLeft) break
        }

        if(isCanMoveLeft) {

            player.posX -= player.speed
        }
    }
    if (pressedButtons.space) {
        jumpState = 1
        freeFallSpeed = 0

        for(const block of blocks) {
            const isPlayerNotUnderBlock = (player.posX < block.x) || (player.posX > (block.x + block.width))
            const isPlayerTouchBlockBottom = player.posY > block.y + block.height + player.radius || player.posY < block.y
            isCanJump = isPlayerNotUnderBlock || (!isPlayerNotUnderBlock && isPlayerTouchBlockBottom)
            if (!isCanJump) break
        }

        if (canvasTopLimit && isCanJump) {
            player.posY -= player.jumpSpeed
        }

    }
    if (!pressedButtons.space){
        isCanJump = true
        for(const block of blocks) {
            const isPlayerNotUpperBlock = (player.posX < block.x) || (player.posX > (block.x + block.width))
            const isPlayerTouchBlockTop = player.posY < block.y - player.radius || player.posY > block.y + block.height
            isCanFall = isPlayerNotUpperBlock || (!isPlayerNotUpperBlock && isPlayerTouchBlockTop)
            if (!isCanFall) {
                jumpState = -1
                break
            }
        }

        if (jumpState <= 1 && jumpState > 0) {
            jumpState -= 0.005
        }
        if (jumpState <= 0.5) {
            freeFallSpeed += 0.005
        }

        if (jumpState > 0.5) {
            for(const block of blocks) {
                const isPlayerNotUnderBlock = (player.posX < block.x) || (player.posX > (block.x + block.width))
                const isPlayerTouchBlockBottom = player.posY > block.y + block.height + player.radius || player.posY < block.y
                isCanJump = isPlayerNotUnderBlock || (!isPlayerNotUnderBlock && isPlayerTouchBlockBottom)
                if (!isCanJump) {
                    jumpState = 0.5
                    break
                }
            }
            if (isCanJump && canvasTopLimit) {
                player.posY -= player.jumpSpeed * (1 - Math.sin(Math.acos(jumpState)))
            } else {
                jumpState = 0.5
            }
        } else if (isCanFall && canvasBottomLimit) {
            player.posY += player.jumpSpeed * freeFallSpeed
        } else {
            freeFallSpeed = 0
        }

    }
}

function randomForEnemiesX(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
}


function drawEnemies(){
    enemies.forEach((enemy)=>{
        enemy.enemyY += 1
        ctx.beginPath();
        ctx.rect(enemy.enemyX, enemy.enemyY, 50, 50);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();
    })
}

function drawPlayer() {
    playerMove()
    ctx.beginPath();
    ctx.arc(player.posX, player.posY, player.radius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBlocks() {
    blocks.forEach((block) => {
        ctx.beginPath();
        ctx.rect(block.x, block.y, block.width, block.height);
        ctx.fillStyle = "brown";
        ctx.fill();
        ctx.closePath();
    })
}

function drawBullets() {
    bullets.forEach((bullet) => {
        bullet.startY += bullet.coefY
        bullet.startX += bullet.coefX
        
        ctx.beginPath();
        ctx.rect(bullet.startX, bullet.startY, 3, 3);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    })
}
function ground() {
    ctx.beginPath();
    ctx.rect(0, canvas.height - ENV.GROUND_HEIGHT, canvas.width, ENV.GROUND_HEIGHT);
    ctx.fillStyle = "brown";
    ctx.fill();
    ctx.closePath();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ground()
    drawBlocks()
    drawPlayer()
    drawBullets()
    drawEnemies()


    requestAnimationFrame(render);
}

render();

addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
        pressedButtons.right = true
    }
    if (event.key === "ArrowLeft") {
        pressedButtons.left = true
    }
    if (event.code === "Space") {
        pressedButtons.space = true
    }
})
addEventListener("keyup", (event) => {
    if (event.key === "ArrowRight") {
        pressedButtons.right = false
    }
    if (event.key === "ArrowLeft") {
        pressedButtons.left = false
    }
    if (event.code === "Space") {
        pressedButtons.space = false
    }
})
addEventListener("click", (event) => {
    let x = event.x - player.posX;
    let y = event.y - player.posY;
    let max = Math.max(Math.abs(x), Math.abs(y));

    bullets.push({
        startX: player.posX,
        startY: player.posY,
        coefY: y/max,
        coefX: x/max,
    })
})
function addEnemy() {
  enemies.push({
    enemyX : randomForEnemiesX(0, canvas.width),
    enemyY : -10,
  })
  
  }
  

  setInterval(addEnemy, 1000)

  
  
