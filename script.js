function checkHitHead(line, head) {
  const distance = pointToSegmentDistance(head, line.from, line.to);
  return distance < 10;
}

function pointToSegmentDistance(p, v, w) {
  const l2 = distanceSquared(v, w);
  if (l2 === 0) return distance(p, v);
  let t = ((p.x - v.x)*(w.x - v.x) + (p.y - v.y)*(w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distance(p, {
    x: v.x + t*(w.x - v.x),
    y: v.y + t*(w.y - v.y)
  });
}

function distance(a, b) {
  return Math.sqrt(distanceSquared(a, b));
}

function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx*dx + dy*dy;
}

function checkHitOpponentLine(line) {
  const opponent = players[1 - currentPlayer];
  for (let oppLine of opponent.lines) {
    const intersection = getLineIntersection(line.from, line.to, oppLine.from, oppLine.to);
    if (intersection) return intersection;
  }
  return null;
}

// 線段交點
function getLineIntersection(p1, p2, p3, p4) {
  const s1_x = p2.x - p1.x, s1_y = p2.y - p1.y;
  const s2_x = p4.x - p3.x, s2_y = p4.y - p3.y;
  const denom = (-s2_x * s1_y + s1_x * s2_y);
  if (denom === 0) return null;
  const s = (-s1_y*(p1.x - p3.x) + s1_x*(p1.y - p3.y)) / denom;
  const t = ( s2_x*(p1.y - p3.y) - s2_y*(p1.x - p3.x)) / denom;
  if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    return { x: p1.x + t*s1_x, y: p1.y + t*s1_y };
  return null;
}
