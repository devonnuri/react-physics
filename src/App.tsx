import React, { useRef, useEffect } from 'react';
import katex from 'katex';
import styled from 'styled-components';
import { drawArrow, drawAxes, drawPoint, drawLine, drawMass, getPixelRatio, drawArc } from './utils/canvas';
import GlobalStyle from './globalStyles';

import 'katex/dist/katex.css';
import { drawGraph } from './utils/canvas';

const InfoContainer = styled.div`
  position: absolute;

  left: 10px;
  top: 10px;
`;

let labels: {[key: string]: HTMLSpanElement} = {};
let startTime: number;
let slopeAngle = 45;

const createLabel = (key: string, tex: string): HTMLSpanElement => {
  const element = document.createElement('span');
  element.style.position = 'absolute';
  katex.render(tex, element);
  labels[key] = element;

  return element;
};

const setSpanPosition = (ctx: CanvasRenderingContext2D, span: HTMLSpanElement, x: number, y: number) => {
  if (!span) return;

  const ratio = getPixelRatio(ctx);
  const style = getComputedStyle(span);
  const width = parseInt(style.getPropertyValue('width'));
  const height = parseInt(style.getPropertyValue('height'));
  span.style.left = `${x/ratio - width / 2}px`;
  span.style.top = `${y/ratio - height / 2}px`;
}

const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  const { width, height } = canvas;

  const slopeTangent = Math.tan(slopeAngle * Math.PI/180);
  const qx = width * 0.5 - width * 0.04;
  const qy = height * 0.8;
  const px = width * 0.08;
  const py = qy - (width * 0.5 - width * 0.12) * slopeTangent;
  const g = 9.8 * (qx - px) / 500;
  const h = qy - py;
  const v0 = Math.sqrt(2 * g * h / 3);

  if (!startTime) return;
  const t = (Date.now() - startTime) / 1000 * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Virtual Right Triangle
  drawLine(ctx, [
    [qx, qy],
    [px, qy],
    [px, py],
  ], 2);

  // Perpendicular Symbol
  drawLine(ctx, [
    [px, qy - 30],
    [px + 30, qy - 30],
    [px + 30, qy],
  ]);

  // Top Virtual Line
  drawLine(ctx, [
    [width * 0.06, py],
    [px, py]
  ], 2, [10, 10]);

  // Bottom Virtual Line
  drawLine(ctx, [
    [width * 0.06, qy],
    [px, qy]
  ], 2, [10, 10]);

  // Slope
  drawLine(ctx, [
    [width * 0.04, qy - (width * 0.5 - px) * slopeTangent],
    [width * 0.5, qy + (width * 0.04) * slopeTangent]
  ], 4);
  
  // Upper arrow
  drawArrow(ctx,
    [width * 0.07, (py + qy) / 2 - 40],
    [width * 0.07, py + 20]);

  // Lower arrow
  drawArrow(ctx,
    [width * 0.07, (py + qy) / 2 + 40],
    [width * 0.07, qy - 20]);
  
  // Label 'h'
  setSpanPosition(ctx, labels['h'], width * 0.07, (py + qy) / 2);

  const ax = px + (1/2 * g * t * t);
  const ay = py + (1/2 * g * t * t) * slopeTangent;

  const bx = qx + (1/2 * g * t * t - v0 * t);
  const by = qy + (1/2 * g * t * t - v0 * t) * slopeTangent;

  drawMass(ctx, ax, ay, slopeAngle);
  setSpanPosition(ctx, labels['a'], ax + 15, ay -20);
  drawMass(ctx, bx, by, slopeAngle);
  setSpanPosition(ctx, labels['b'], bx + 15, by -20);

  // Point P
  drawPoint(ctx, [px, py]);
  setSpanPosition(ctx, labels['p'], width * 0.09, py + 40);

  // Point Q
  drawPoint(ctx, [qx, qy]);
  setSpanPosition(ctx, labels['q'], width * 0.5 - width * 0.04, qy + 30);

  drawArc(ctx, [qx, qy], 75, Math.PI, Math.PI + slopeAngle * Math.PI/180);
  setSpanPosition(ctx, labels['theta'], qx - 90, qy - 30);

  // === Graph part
  const graphWidth = width * 0.15;
  const max_t = Math.sqrt((qx - px) * 2 / g);
  drawAxes(ctx, [width * 0.55, height * 0.4], graphWidth, graphWidth);
  setSpanPosition(ctx, labels['graph1_x'], width * 0.55 - 30, height * 0.4 - graphWidth);
  setSpanPosition(ctx, labels['graph1_t'], width * 0.55 + graphWidth, height * 0.4 + 30);
  drawGraph(ctx, [width * 0.55, height * 0.4], graphWidth, [0, t], [0, qx - px], [0, max_t], [0, graphWidth], (x: number) => 1/2 * g * x * x);

  drawAxes(ctx, [width * 0.75, height * 0.4], graphWidth, graphWidth);
  setSpanPosition(ctx, labels['graph2_v'], width * 0.75 - 30, height * 0.4 - graphWidth);
  setSpanPosition(ctx, labels['graph2_t'], width * 0.75 + graphWidth, height * 0.4 + 30);
  drawGraph(ctx, [width * 0.75, height * 0.4], graphWidth, [0, t], [0, g * max_t], [0, max_t], [0, graphWidth], (x: number) => g * x);

  drawAxes(ctx, [width * 0.55, height * 0.8 - graphWidth], graphWidth, 40, [40, 40 + graphWidth]);
  setSpanPosition(ctx, labels['graph3_x'], width * 0.55 - 30, height * 0.8 - graphWidth - 40);
  setSpanPosition(ctx, labels['graph3_t'], width * 0.55 + graphWidth, height * 0.8 - graphWidth + 30);
  drawGraph(ctx, [width * 0.55, height * 0.8 - graphWidth], graphWidth, [0, t], [-1/2 * v0 * v0 / g, 0], [0, max_t], [-graphWidth, 0], (x: number) => 1/2 * g * x * x - v0 * x);

  drawAxes(ctx, [width * 0.75, height * 0.8 - graphWidth / 2], graphWidth, graphWidth / 2, [40, 40 + graphWidth / 2]);
  setSpanPosition(ctx, labels['graph4_v'], width * 0.75 - 30, height * 0.8 - graphWidth);
  setSpanPosition(ctx, labels['graph4_t'], width * 0.75 + graphWidth, height * 0.8 - graphWidth / 2 + 30);
  drawGraph(ctx, [width * 0.75, height * 0.8 - graphWidth / 2], graphWidth, [0, t], [-v0, g * max_t - v0], [0, max_t], [-graphWidth / 2, graphWidth / 2], (x: number) => g * x - v0);
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    document.addEventListener('keydown', event => {
      if (event.code === 'ArrowUp') {
        slopeAngle = Math.min(slopeAngle + 5, 45);
        startTime = Date.now();
      } else if (event.code === 'ArrowDown') {
        slopeAngle = Math.max(slopeAngle - 5, 5);
        startTime = Date.now();
      }
      if (angleRef && angleRef.current) katex.render(`\\theta=${slopeAngle}\\degree`, angleRef.current);
    });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const ratio = getPixelRatio(ctx);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    let animationFrameId: number;
    startTime = Date.now();

    //Our draw came here
    const render = () => {
      draw(ctx, canvas);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    overlayRef.current?.appendChild(createLabel('h', 'h'));
    overlayRef.current?.appendChild(createLabel('p', '\\mathrm{P}'));
    overlayRef.current?.appendChild(createLabel('q', '\\mathrm{Q}'));
    overlayRef.current?.appendChild(createLabel('r', '\\mathrm{R}'));
    overlayRef.current?.appendChild(createLabel('theta', '\\theta'));
    overlayRef.current?.appendChild(createLabel('a', '\\mathrm{A}'));
    overlayRef.current?.appendChild(createLabel('b', '\\mathrm{B}'));
    overlayRef.current?.appendChild(createLabel('graph1_t', 't'));
    overlayRef.current?.appendChild(createLabel('graph2_t', 't'));
    overlayRef.current?.appendChild(createLabel('graph3_t', 't'));
    overlayRef.current?.appendChild(createLabel('graph4_t', 't'));
    overlayRef.current?.appendChild(createLabel('graph1_x', 'x_A'));
    overlayRef.current?.appendChild(createLabel('graph2_v', 'v_A'));
    overlayRef.current?.appendChild(createLabel('graph3_x', 'x_B'));
    overlayRef.current?.appendChild(createLabel('graph4_v', 'v_B'));

    if (angleRef && angleRef.current) katex.render(`\\theta=${slopeAngle}\\degree`, angleRef.current);
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [canvasRef]);

  return (
    <>
      <GlobalStyle />
      <canvas ref={canvasRef} />
      <div ref={overlayRef}>
      </div>
      <InfoContainer>
        Press Up or Down key to raise/lower the slope.
        <p ref={angleRef}></p>
      </InfoContainer>
    </>
  );
}

export default App;
