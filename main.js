const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const MAX_DISTANCE = 150; // 最大射擊距離
let players = [
  { color: "red", head: { x: 300, y: 300 }, lines: [] },
  { color: "blue", head: { x: 900, y: 300 }, lines: [] }
];
let currentPlayer = 0;
let isAiming = false;
let aimStart = null;
let aimEnd = null;
let roundNumber = 1;
let waitingForChoice = false;

function updateTurnIndicator() {
  const color = players[currentPlayer].color;
  const text = color === 'red' ? '紅色玩家' : '藍色玩家';
  document.getElementById("turnIndicator").innerHTML = `現在輪到：<span style="color:${color}">${text}</span>`;
  document.getElementById("roundIndicator").textContent = `回合：第 ${roundNumber} 回合`;
}

function chooseNextStart(which) {
  if (which === "end") {
    players[currentPlayer].head = { ...players[currentPlayer].lines.slice(-1)[0].end };
  } else {
    players[currentPlayer].head = { ...players[currentPlayer].lines.slice(-1)[0].start };
  }
  document.getElementById("choicePanel").style.display = "none";
  currentPlayer = 1 - currentPlayer;
  roundNumber++;
  updateTurnIndicator();
  draw();
}

function resetGame() {
  players = [
    { color: "red", head: { x: 300, y: 300 }, lines: [] },
    { color: "blue", head: { x: 900, y: 300 }, lines: [] }
  ];
  currentPlayer = 0;
  roundNumber = 1;
  document.getElementById("winPanel").style.display = "none";
  document.getElementById("distanceIndicator").textContent = "射擊距離：0 px";
  updateTurnIndicator();
  draw();
}

canvas.addEventListener("mousedown", e => {
  isAiming = true;
  aimStart = { ...players[currentPlayer].head };
  aimEnd = { x: e.offsetX, y: e.offsetY };
});

canvas.addEventListener("mousemove", e => {
  if (isAiming) {
    let dx = e.offsetX - aimStart.x;
    let dy = e.offsetY - aimStart.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > MAX_DISTANCE) {
      let ratio = MAX_DISTANCE / dist;
      dx *= ratio;
      dy *= ratio;
    }
    aimEnd = { x: aimStart.x + dx, y: aimStart.y + dy };
    document.getElementById("distanceIndicator").textContent = `射擊距離：${Math.round(Math.sqrt(dx*dx+dy*dy))} px`;
    draw();
  }
});

canvas.addEventListener("mouseup", () => {
  if (isAiming) {
    isAiming = false;
    let newLine = { start: aimStart, end: aimEnd };
    players[currentPlayer].lines.push(newLine);

    const opponent = players[1 - currentPlayer];
    if (checkHitHead(newLine, opponent.head)) {
      const winner = players[currentPlayer].color === "red" ? "紅色玩家" : "藍色玩家";
      document.getElementById("winText").textContent = `${winner} 獲勝！`;
      document.getElementById("winPanel").style.display = "block";
      return;
    }
    document.getElementById("choicePanel").style.display = "block";
    draw();
  }
});

function checkHitHead(line, head) {
  const dist = distancePointToLine(head, line.start, line.end);
  return dist < 10;
}

function distancePointToLine(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx*dx + dy*dy;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  players.forEach(p => {
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 4;
    p.lines.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l.start.x, l.start.y);
      ctx.lineTo(l.end.x, l.end.y);
      ctx.stroke();
    });
  });

  players.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.head.x, p.head.y, 8, 0, Math.PI*2);
    ctx.fill();
  });

  if (isAiming && aimStart && aimEnd) {
    ctx.strokeStyle = "#555";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(aimStart.x, aimStart.y);
    ctx.lineTo(aimEnd.x, aimEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

updateTurnIndicator();
draw();
