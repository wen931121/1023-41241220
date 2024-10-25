// 獲取 canvas 並設置上下文
const canvas = document.getElementById("brickBreaker");
const ctx = canvas.getContext("2d");
// 遊戲元素的初始設置
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 20; // 將球的位置調整為在橫桿的上方
let dx = 0; // 初始 X 方向速度為 0
let dy = 0; // 初始 Y 方向速度為 0
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let isPaddleJumping = false;  // 判斷擋板是否正在跳躍
let jumpCooldown = false;     // 判斷是否在冷卻期間
let paddleY = canvas.height - paddleHeight; 
let powerUps = []; // 存儲當前的所有道具
let hasPowerUp = false; // 記錄是否有道具生效
let consecutiveHits = 0; // 連續擊破的計數器
let hasGainedLifeAt500 = false; // 標記是否已經在 500 分時增加生命
let hasGainedLifeAt1000 = false; // 標記是否已經在 1000 分時增加生命
let hasGainedLifeAt3000 = false; // 標記是否已經在 3000 分時增加生命
let powerUpDuration = 5000; // 道具效果持續 5 秒
let powerUpTimer; // 定時器變量，用於清除定時器

// 爆炸效果数组
let explosions = [];



// 磚塊設置
let brickRowCount; // 行數
let brickColumnCount; // 列數
const brickWidth = 60; // 縮小寬度以適應畫布
const brickHeight = 15; // 縮小高度
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 20;
const jumpHeight = 50;        // 跳躍高度
const jumpSpeed = 2;          // 跳躍速度（每幀上升的像素數）
const cooldownDuration = 1500; // 跳躍冷卻時間 (毫秒)
const powerUpWidth = 20;  // 道具的寬度
const powerUpHeight = 20; // 道具的高度
const powerUpFallSpeed = 2; // 道具下落的速度
const bonusScorePerHit = 5; // 每次連續擊破獲得的額外分數
let originalPaddleWidth = paddleWidth; // 存儲原始橫桿寬度，用於重置
let bricks = [];

// 初始化分數和生命
let score = 0;
let lives = 3;

// 發射球的標誌
let ballReleased = false; // 是否已發射
let paddleMovable = false; // 橫桿是否可移動

// 設定遊戲難度
let difficulty = 'easy'; // 預設為簡單

// 加載音效
const hitSound = new Audio('sounds/hit.mp3');
const backgroundMusic = new Audio('sounds/b.mp3'); // 加载背景音乐

// 設定背景圖片
let backgroundImage = new Image();
backgroundImage.src = 'images/night.jpeg'; // 預設背景為夜空

// 開始遊戲
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("difficultyMenu").style.display = "flex"; // 顯示難度選擇介面
});

// 在遊戲開始時播放背景音樂
function startBackgroundMusic() {
    backgroundMusic.loop = true; // 設定為循環播放
    backgroundMusic.volume = 0.5; // 設置音量（可根據需要調整）
    backgroundMusic.play(); // 播放背景音樂
}

// 初始化磚塊
function initializeBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            if (difficulty === 'medium' && Math.random() < 0.3 && r > 0) { // 中等難度特殊磚塊約佔30%
                bricks[c][r] = { x: 0, y: 0, status: 2 }; // status 2 表示特殊磚塊
            } else if (difficulty === 'hard' && Math.random() < 0.5) { // 困難難度特殊磚塊約佔50%
                bricks[c][r] = { x: 0, y: 0, status: 2 }; // status 2 表示特殊磚塊
            } else if (difficulty === 'hardTimed' && Math.random() < 0.5) { // 困難計時難度特殊磚塊約佔50%
                bricks[c][r] = { x: 0, y: 0, status: 2 }; // status 2 表示特殊磚塊
            } else {
                bricks[c][r] = { x: 0, y: 0, status: 1 }; // status 1 表示普通磚塊
            }
        }
    }
}

// 設定遊戲難度
function setDifficulty(level) {
    difficulty = level;
    adjustGameSettings(); // 根據選擇的難度調整遊戲設置
    document.getElementById("difficultyMenu").style.display = "none"; // 隱藏難度選擇介面
    canvas.style.display = "block"; // 顯示畫布
    resetGame(); // 重置遊戲
    draw(); // 開始繪製遊戲
    startBackgroundMusic(); // 開始播放背景音樂
}

// 根據選擇的難度調整遊戲設置
function adjustGameSettings() {
    switch (difficulty) {
        case 'easy':
            brickRowCount = 3; // 簡單難度行數
            brickColumnCount = 6; // 簡單難度列數
            dx = 1.6; // 簡單難度，球速較慢
            dy = -1.6;
            break;
        case 'medium':
            brickRowCount = 5; // 中等難度行數
            brickColumnCount = 6; // 中等難度列數
            dx = 2.4; // 中等難度，球速中等
            dy = -2.4;
            break;
        case 'hard':
            brickRowCount = 8; // 困難難度行數
            brickColumnCount = 6; // 困難難度列數
            dx = 3.2; // 困難難度，球速較快
            dy = -3.2;
            break;
        case 'hardTimed':
            brickRowCount = 8; // 困難難度行數
            brickColumnCount = 6; // 困難難度列數
            dx = 1.6; // 困難難度，球速較快
            dy = -1.6;
            startTimer(120); // 開始120秒的倒數計時
            break;
    }
    
    // 重新初始化磚塊
    initializeBricks();
}


let timer; // 用於儲存計時器
let timeLeft; // 剩餘時間

function startTimer(seconds) {
    timeLeft = seconds;
    document.getElementById("timerDisplay").style.display = "block"; // 顯示倒數計時
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timerDisplay").innerHTML = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer); // 停止計時
            if (!checkAllBricksCleared()) { // 如果磚塊還沒清空
                endGame(false); // 結束遊戲並顯示失敗
            }
        }
    }, 1000);
}

// 檢查所有磚塊是否都已經打完
function checkAllBricksCleared() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status > 0) {
                return false; // 還有磚塊未清除
            }
        }
    }
    return true; // 所有磚塊已經清除
}

// 結束遊戲
function endGame(success) {
    document.getElementById("gameOverMenu").style.display = "flex"; // 顯示遊戲結束介面
    if (!success) {
        document.getElementById("gameOverMenu").querySelector("h1").innerHTML = "遊戲失敗！";
    } else {
        document.getElementById("gameOverMenu").querySelector("h1").innerHTML = "恭喜過關！";
    }
    document.getElementById("brickBreaker").style.display = "none"; // 隱藏遊戲畫布
    document.getElementById("timerDisplay").style.display = "none"; // 隱藏倒數計時
}
// 監聽滑鼠移動事件
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false); // 監聽滑鼠按下事件

function mouseMoveHandler(e) {
    // 橫桿可移動時才更新位置
    if (paddleMovable) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }
}

function mouseDownHandler(e) {
    // 當滑鼠左鍵按下時發射球，並設置橫桿為可移動
    if (!ballReleased) {
        ballReleased = true; // 設置為已發射
        dx = 2.5; // 設置 X 方向的速度
        dy = -2.5; // 設置 Y 方向的速度
        paddleMovable = true; // 設置橫桿可移動
    } else if (lives > 0) {
        // 如果遊戲進行中且生命值大於 0，允許移動橫桿
        paddleMovable = true;
    }
}



// 監聽鍵盤按下事件
document.addEventListener("keydown", handleKeydown, false);

function handleKeydown(e) {
    if (e.code === "Space" && !isPaddleJumping && !jumpCooldown) {
        jumpPaddle(); // 呼叫跳躍函數
    }
}

function jumpPaddle() {
    isPaddleJumping = true;
    jumpCooldown = true;  // 開始冷卻

    const initialY = canvas.height - paddleHeight;  // 擋板初始位置
    const targetY = initialY - jumpHeight;  // 跳躍的目標位置

    // 呼叫逐幀跳躍動畫
    requestAnimationFrame(() => performJump(initialY, targetY, "up"));

    // 在 cooldownDuration 結束後解除冷卻
    setTimeout(() => {
        jumpCooldown = false;
    }, cooldownDuration);
}

// 跳躍動畫邏輯
function performJump(initialY, targetY, direction) {
    if (direction === "up" && paddleY > targetY) {
        // 擋板上升
        paddleY -= jumpSpeed;  // 向上移動
        drawPaddle();
        requestAnimationFrame(() => performJump(initialY, targetY, "up"));
    } else if (direction === "down" && paddleY < initialY) {
        // 擋板下降
        paddleY += jumpSpeed;  // 向下移動
        drawPaddle();
        requestAnimationFrame(() => performJump(initialY, targetY, "down"));
    } else if (direction === "up") {
        // 上升結束，開始下降
        requestAnimationFrame(() => performJump(initialY, targetY, "down"));
    } else {
        // 跳躍結束，重置狀態
        isPaddleJumping = false;
    }
}


// 繪製分數
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("分數: " + score, 8, 20); // 在 (8, 20) 的位置繪製分數
}

// 繪製生命
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("生命: " + lives, canvas.width - 100, 20); // 在右上角繪製生命
}

// 繪製勝利訊息
function drawWin() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "green";
    ctx.fillText("你贏了", canvas.width / 2 - 80, canvas.height / 2);
}

// 繪製球
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);  // 使用 paddleY 控制垂直位置
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// 繪製磚塊
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                ctx.fillStyle = "#0095DD"; // 普通磚塊顏色
            } else if (b.status === 2) {
                ctx.fillStyle = "red"; // 特殊磚塊顏色
            }
            if (b.status > 0) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 添加爆炸效果
function addExplosion(x, y) {
    explosions.push({
        x: x, // 爆炸中心的 X 坐标
        y: y, // 爆炸中心的 Y 坐标
        radius: 0, // 初始半径
        maxRadius: 30, // 最大半径
        opacity: 1 // 初始透明度
    });
}

// 绘制爆炸效果
function drawExplosions() {
    for (let i = 0; i < explosions.length; i++) {
        const explosion = explosions[i];
        if (explosion.radius < explosion.maxRadius) {
            // 绘制爆炸圆圈
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 165, 0, ${explosion.opacity})`; // 使用橙色，并根据透明度变化
            ctx.fill();
            ctx.closePath();

            // 更新爆炸属性
            explosion.radius += 2; // 增加半径
            explosion.opacity -= 0.01; // 减少透明度
        } else {
            // 移除已完成的爆炸效果
            explosions.splice(i, 1);
            i--;
        }
    }
}


function collisionDetection() {
    let hitDetected = false; // 用於檢查當前是否有擊破磚塊
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1 || b.status === 2) { // 檢查普通和特殊磚塊
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;

                    hitSound.currentTime = 0; // 重置音效播放位置
                    hitSound.play(); // 播放音效

                    // 添加爆炸效果，爆炸位置在磚塊中心
                    addExplosion(b.x + brickWidth / 2, b.y + brickHeight / 2);

                    if (b.status === 2) {
                        b.status = 1; // 特殊磚塊變為普通磚塊
                        // 隨機掉落道具（黃色或紅色）
                        const randomEffect = Math.random() < 0.5 ? 'increase' : 'decrease'; // 隨機選擇效果
                        const color = randomEffect === 'increase' ? 'yellow' : 'red'; // 根據效果決定顏色

                        // 創建新的道具
                        powerUps.push({
                            x: b.x + brickWidth / 2 - powerUpWidth / 2,  // 道具的初始 X 位置
                            y: b.y,  // 道具的初始 Y 位置
                            active: true, // 道具是否還在運動中
                            type: randomEffect, // 道具的類型（增加或減少）
                            color: color // 道具的顏色
                        });
                    } else {
                        b.status = 0; // 普通磚塊被打碎
                        score++; // 增加分數
                        consecutiveHits++; // 增加連擊計數器

                        // 添加額外的分數
                        score += consecutiveHits * bonusScorePerHit;

                        // 檢查分數並增加生命
                        if (score > 500 && !hasGainedLifeAt500) { // 確保不超過最大生命數
                            lives++; // 分數超過 500 時增加生命
                            hasGainedLifeAt500 = true; // 設置已經增加生命的標誌
                        } else if (score > 1000 && !hasGainedLifeAt1000) {
                            lives++; // 分數超過 1000 時再增加生命
                            hasGainedLifeAt1000 = true; // 設置已經增加生命的標誌
                        } else if (score > 3000 && !hasGainedLifeAt3000) {
                            lives++; // 分數超過 3000 時再增加生命
                            hasGainedLifeAt3000 = true; // 設置已經增加生命的標誌
                        }
                    }

                    dx *= 1.01;  // 每次擊中磚塊時，速度增加 1%
                    dy *= 1.01;  // 每次擊中磚塊時，速度增加 1%
                    hitDetected = true; // 標記已經擊破磚塊
                }
            }
        }
    }

    // 檢查是否所有磚塊都已被擊破
    if (!hitDetected && areAllBricksCleared()) {
        showScoreAndButton(); // 顯示分數和按鈕
    }
}


// 檢查是否所有磚塊都已被擊破
function areAllBricksCleared() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status > 0) { // 檢查是否有尚未被擊破的磚塊
                return false; // 只要有一個磚塊未被擊破，返回 false
            }
        }
    }
    return true; // 所有磚塊都被擊破，返回 true
}

// 顯示分數和按鈕
function showScoreAndButton() {
    // 隱藏遊戲畫面
    canvas.style.display = "none"; // 假設 canvas 是遊戲畫布的元素 ID

    const scoreDisplay = document.getElementById("scoreDisplay");
    scoreDisplay.innerText = `Your Score: ${score}`;
    scoreDisplay.style.display = "block"; // 顯示分數

    const continueButton = document.getElementById("continueButton");
    continueButton.style.display = "block"; // 顯示按鈕

    continueButton.onclick = function() {
        // 按下按鈕後隱藏分數和按鈕
        scoreDisplay.style.display = "none"; // 隱藏分數
        continueButton.style.display = "none"; // 隱藏按鈕

        // 重置遊戲狀態
        resetGame(); // 您需要自定義這個函數以重置遊戲狀態

        // 呼叫顯示難度選擇的函數
        showDifficultySelection(); // 這個函數需要您自定義
    };
}

// 假設這是重置遊戲的函數
function resetGame() {
    score = 0;
    lives = 3;
    initializeBricks();
    x = canvas.width / 2;
    y = canvas.height - 20;
    ballReleased = false;
    paddleMovable = false;
    adjustGameSettings();
}

// 假設這是顯示難度選擇的函數
function showDifficultySelection() {
    document.getElementById("difficultyMenu").style.display = "flex"; // 顯示選擇難度的介面
    // 如果需要，您可以在這裡重新設定其他遊戲狀態
}

function drawPowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        let powerUp = powerUps[i];

        if (powerUp.active) {
            ctx.beginPath();
            ctx.rect(powerUp.x, powerUp.y, powerUpWidth, powerUpHeight);  // 繪製道具
            ctx.fillStyle = powerUp.color;  // 道具的顏色
            ctx.fill();
            ctx.closePath();

            powerUp.y += powerUpFallSpeed;  // 更新道具的 Y 位置，使其下落

            // 檢測道具是否與橫桿碰撞
            if (powerUp.y + powerUpHeight >= canvas.height - paddleHeight &&
                powerUp.x > paddleX && powerUp.x < paddleX + paddleWidth) {
                if (powerUp.type === 'increase') {
                    paddleWidth += 50;  // 增加橫桿的寬度
                } else {
                    paddleWidth = Math.max(10, paddleWidth - 50); // 減少橫桿的寬度，保證最小為 10
                }

                hasPowerUp = true; // 設置道具生效標誌
                powerUp.active = false;  // 道具失效
                // 清除已有的定時器，確保不會有多個效果重疊
                clearTimeout(powerUpTimer);      
                
                // 啟動新的定時器，在5秒後恢復橫桿的原始大小
                powerUpTimer = setTimeout(() => {
                    paddleWidth = originalPaddleWidth;
                    hasPowerUp = false; // 道具效果結束
                }, powerUpDuration);
            }

            // 檢查道具是否超出畫布
            if (powerUp.y > canvas.height) {
                powerUps[i].active = false;  // 道具掉落到畫布外
            }
        }
    }
    // 清除失效的道具
    powerUps = powerUps.filter(powerUp => powerUp.active);
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // 清空畫布
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);  // 繪製背景
    drawBricks();  // 繪製磚塊
    drawBall();  // 繪製球
    drawPaddle();  // 繪製橫桿
    drawScore();  // 繪製分數
    drawLives();  // 繪製生命
    collisionDetection();  // 碰撞檢測
    drawPowerUps();  // 繪製和更新道具
    drawExplosions();  // 繪製爆炸效果

    // 更新球的運動
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;  // 改變 X 方向
    }
    if (y + dy < ballRadius) {
        dy = -dy;  // 改變 Y 方向
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;  // 球與橫桿碰撞
        } else {
            lives--;  // 生命減少
            if (lives === 0) {
                document.getElementById("gameOverMenu").style.display = "flex";  // 顯示遊戲結束介面
                canvas.style.display = "none";  // 隱藏畫布
            } else {
                // 重置球和橫桿的位置
                x = canvas.width / 2;
                y = canvas.height - 20;
                dx = 0;
                dy = 0;
                ballReleased = false;
                paddleMovable = false;
            }
        }
    }

    // 更新球的位置
    if (ballReleased) {
        x += dx;
        y += dy;
    }

    requestAnimationFrame(draw);  // 持續更新畫面
}



// 重置遊戲
function resetGame() {
    // 初始化分數和生命
    score = 0;
    lives = 3;
    // 初始化磚塊狀態
    initializeBricks();
    x = canvas.width / 2; // 重置球的 X 位置
    y = canvas.height - 20; // 重置球的 Y 位置
    dx = 0; // 重置速度
    dy = 0; // 重置速度
    ballReleased = false; // 重新發射
    paddleMovable = false; // 橫桿不可移動
}

// 返回到選擇難度
function showDifficultyMenu() {
    document.getElementById("gameOverMenu").style.display = "none"; // 隱藏遊戲結束介面
    document.getElementById("difficultyMenu").style.display = "flex"; // 顯示難度選擇介面
}

// 開始遊戲
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("difficultyMenu").style.display = "flex"; // 顯示難度選擇介面
});

// 改變背景
function changeBackground() {
    const selectedBackground = document.getElementById("backgroundSelect").value;
    switch (selectedBackground) {
        case 'night':
            backgroundImage.src = 'images/night.jpeg';
            break;
        case 'forest':
            backgroundImage.src = 'images/forest.jpg';
            break;
        case 'city':
            backgroundImage.src = 'images/city.png';
            break;
    }
}