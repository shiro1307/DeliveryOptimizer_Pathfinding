import { WIDTH, HEIGHT, OBSTACLE_NOISE, OBSTACLE_MAZE } from "./config.js";
import { noise } from "./noise.js";

const dnx = [1, 0, -1, 0];
const dny = [0, 1, 0, -1];

function makeCell(x, y) {
  return {
    x,
    y,
    wall: false,
    parentx: -1,
    parenty: -1,
    isopen: 0,
    isclosed: 0,
    g: 0,
  };
}

export function createEmptyGrid() {
  const grid = [];
  for (let y = 0; y < HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < WIDTH; x++) {
      grid[y][x] = makeCell(x, y);
    }
  }
  return grid;
}

function resetCellPhysics(c) {
  c.parentx = -1;
  c.parenty = -1;
  c.isopen = 0;
  c.isclosed = 0;
  c.g = 0;
}

function shuffleDirs() {
  const dirs = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = dirs[i];
    dirs[i] = dirs[j];
    dirs[j] = t;
  }
  return dirs;
}

function generateMaze(grid, x, y) {
  grid[y][x].wall = false;

  const dirs = shuffleDirs();
  for (let i = 0; i < 4; i++) {
    const d = dirs[i];
    const nx = x + dnx[d];
    const ny = y + dny[d];
    const ndx = x + 2 * dnx[d];
    const ndy = y + 2 * dny[d];

    if (
      ndx >= 0 &&
      ndx < WIDTH &&
      ndy >= 0 &&
      ndy < HEIGHT &&
      grid[ndy][ndx].wall
    ) {
      grid[ny][nx].wall = false;
      generateMaze(grid, ndx, ndy);
    }
  }
}

export function initGrid(obstacleMode) {
  const grid = createEmptyGrid();

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      grid[y][x].wall = true;
      resetCellPhysics(grid[y][x]);
    }
  }

  const randomSeed = Math.floor(Math.random() * 70);

  if (obstacleMode === OBSTACLE_NOISE) {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const v = noise(x + randomSeed, y + randomSeed) + 0.5;
        grid[y][x].wall = (v | 0) !== 0;
      }
    }
  } else if (obstacleMode === OBSTACLE_MAZE) {
    const sx = 1 + 2 * Math.floor(Math.random() * ((WIDTH - 1) / 2));
    const sy = 1 + 2 * Math.floor(Math.random() * ((HEIGHT - 1) / 2));
    generateMaze(grid, sx, sy);
  }

  return grid;
}

export function isWall(grid, x, y) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return true;
  return grid[y][x].wall;
}

export function clampToWalkable(grid, x, y) {
  if (!grid[y][x].wall) return { x, y };
  for (let cy = 0; cy < HEIGHT; cy++) {
    for (let cx = 0; cx < WIDTH; cx++) {
      if (!grid[cy][cx].wall) return { x: cx, y: cy };
    }
  }
  return { x: 0, y: 0 };
}
