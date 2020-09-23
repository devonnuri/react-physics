export const getPixelRatio = (context: any) => {
  var backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;
    
    return (window.devicePixelRatio || 1) / backingStore;
};

export const drawLine = (
    ctx: CanvasRenderingContext2D,
    points: [number, number][],
    lineWidth: number = 2, lineDash: number[] = []) => {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(lineDash);
  ctx.moveTo(points[0][0], points[0][1]);
  for (const point of points.slice(1)) {
    ctx.lineTo(point[0], point[1]);
  }
  ctx.stroke();
};

export const drawArrowHead = (
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  to: [number, number], 
  radius: number) => {
  const x_center = to[0];
  const y_center = to[1];

  let angle;
  let x;
  let y;

  ctx.beginPath();

  angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  x = radius * Math.cos(angle) + x_center;
  y = radius * Math.sin(angle) + y_center;
  ctx.moveTo(x, y);

  angle += (1.0/3.0) * (2 * Math.PI);
  x = radius * Math.cos(angle) + x_center;
  y = radius * Math.sin(angle) + y_center;
  ctx.lineTo(x, y);

  angle += (1.0/3.0) * (2 * Math.PI);
  x = radius * Math.cos(angle) + x_center;
  y = radius * Math.sin(angle) + y_center;
  ctx.lineTo(x, y);

  ctx.closePath();
  ctx.fill();
};

export const drawArrow = (
    ctx: CanvasRenderingContext2D,
    from: [number, number],
    to: [number, number], 
    radius: number = 10,
    lineWidth: number = 2) => {
  drawLine(ctx, [from, to], lineWidth);
  drawArrowHead(ctx, from, to, radius);
};

export const drawPoint = (
    ctx: CanvasRenderingContext2D,
    center: [number, number],
    radius: number = 7) => {
  ctx.beginPath();
  ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
  ctx.fill();
};

export const drawArc = (
    ctx: CanvasRenderingContext2D,
    center: [number, number],
    radius: number = 7,
    startAngle: number, endAngle: number,
    lineWidth: number = 2) => {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.arc(center[0], center[1], radius, startAngle, endAngle);
  ctx.stroke();
};

export const drawMass = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    angle: number,
    width: number = 100,
    height: number = 50) => {
  ctx.beginPath();
  ctx.fillStyle = '#999999';
  ctx.lineWidth = 5;

  ctx.translate(x, y);
  ctx.rotate(angle * Math.PI/180);
  ctx.translate(-x, -y);
  
  ctx.rect(x - width / 2, y - height, width, height);
  ctx.stroke();
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

export const drawAxes = (
  ctx: CanvasRenderingContext2D,
  origin: [number, number],
  width: number, height: number,
  offset: [number, number] = [40, 40]) => {
  drawArrow(ctx, [origin[0] - offset[0], origin[1]], [origin[0] + width, origin[1]]);
  drawArrow(ctx, [origin[0], origin[1] + offset[1]], [origin[0], origin[1] - height]);
};

const lerpWithRange = (
    value: number,
    min: number, max: number,
    newMin: number, newMax: number): number => {
  const ratio = (value - min) / (max - min);
  return newMin + (newMax - newMin) * ratio;
};

export const drawGraph = (
  ctx: CanvasRenderingContext2D,
  origin: [number, number],
  width: number,
  domain: [number, number],
  codomain: [number, number],
  scale: [number, number],
  coscale: [number, number],
  func: (x: number) => number,
  step: number = 0.01, lineWidth: number = 4) => {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.moveTo(
    origin[0],
    origin[1] + -lerpWithRange(func(domain[0]), codomain[0], codomain[1], coscale[0], coscale[1]));
  for (let x = domain[0] + step; x <= Math.min(domain[1], scale[1]); x += step) {
    if (codomain[0] <= func(x) && func(x) <= codomain[1])
      ctx.lineTo(
        origin[0] + lerpWithRange(x, scale[0], scale[1], 0, width),
        origin[1] + -lerpWithRange(func(x), codomain[0], codomain[1], coscale[0], coscale[1]));
  }
  ctx.stroke();
};