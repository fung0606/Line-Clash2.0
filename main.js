const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const choicePanel = document.getElementById("choicePanel");
const turnIndicator = document.getElementById("turnIndicator");
const winOverlay = document.getElementById("winOverlay");
const winText = document.getElementById("winText");
const restartBtn = document.getElementById("restartBtn");

let players = [
  { color: 'red', head: { x: 200, y: 300 }, lines: [] },
  { color: 'blue', head: { x: 1000, y: 300 }, lines: [] }
];
let currentPlayer = 0;
let isDragging = false;
let dragEnd = {};
let waitingForChoice = false;
let lastLine = null;

const MAX_DISTANCE = 150;

canvas.addEventListener("mousedown", (e) => {
  if (waitingForChoice) return;
  isDragging = true;
  dragEnd = getMousePos(e);
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging || waitingForChoice) return;
  dragEnd = limitDragToMax(getMousePos(e));
  draw();
});

canvas.addEventListener("mouseup", () => {
  if (!isDragging || waitingForChoice) return;
  isDragging = false;

  const head = players[currentPlayer].head;
  const dx = dragEnd.x - head.x, dy = dragEnd.y - head.y;
  const length = Math.sqrt(dx*dx + dy*dy);
  const scale = MAX_DISTANCE / length;
  const newEnd = length > MAX_DISTANCE 
    ? { x: head.x + dx*scale, y: head.y + dy*scale }
    : dragEnd;

  const newLine = { from: { ...head }, to: newEnd };
  lastLine = newLine;
  players[currentPlayer].lines.push(newLine);

  const hitPoint = checkHitOpponentLine(newLine);
  if (hitPoint) newLine.to = hitPoint;

  // 檢查是否打中對方頭
  const opponent = players[1 - currentPlayer];
  if (checkHitHead(newLine, opponent.head)) {
    const winner = players[currentPlayer].color === 'red' ? '紅色玩家' : '藍色玩家';
    winText.textContent = `${winner} 獲勝！`;
    winOverlay.style.display = "flex";
    return;
  }

  waitingForChoice = true;
  choicePanel.style.display = "block";
  draw();
});

function chooseNextStart(choice) {
  if (!lastLine) return;
  players[currentPlayer].head = choice === "end" ? { ...lastLine.to } : { ...lastLine.from };
  currentPlayer = 1 - currentPlayer;
  lastLine = null;
  waitingForChoice = false;
  choicePanel.style.display = "none";
  updateTurnIndicator();
  draw();
}

function updateTurnIndicator() {
  turnIndicator.textContent = `現在輪到：${players[currentPlayer].color === 'red' ? '紅色玩家' : '藍色玩家'}`;
}

restartBtn.addEventListener("click", () => {
  players = [
    { color: 'red', head: { x: 200, y: 300 }, lines: [] },
    { color: 'blue', head: { x: 1000, y: 300 }, lines: [] }
  ];
  currentPlayer = 0;
  lastLine = null;
  waitingForChoice = false;
  winOverlay.style.display = "none";
  updateTurnIndicator();
  draw();
});

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  players.forEach(p => {
    ctx.strokeStyle = p.color;
    p.lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();
    });
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.head.x, p.head.y, 5, 0, Math.PI*2);
    ctx.fill();
  });
  if (isDragging && !waitingForChoice) {
    ctx.setLineDash([5,5]);
    ctx.strokeStyle = players[currentPlayer].color;
    ctx.beginPath();
    ctx.moveTo(players[currentPlayer].head.x, players[currentPlayer].head.y);
    ctx.lineTo(dragEnd.x, dragEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function limitDragToMax(pos) {
  const head = players[currentPlayer].head;
  const dx = pos.x - head.x, dy = pos.y - head.y;
  const len = Math.sqrt(dx*dx + dy*dy);
  if (len <= MAX_DISTANCE) return pos;
  const scale = MAX_DISTANCE / len;
  return { x: head.x + dx*scale, y: head.y + dy*scale };
}

updateTurnIndicator();
draw();
