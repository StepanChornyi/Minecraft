import ChunkPos from "../../../utils/chunk-pos";

const
  E = 1,
  W = 2,
  N = 4,
  S = 8,
  NE = 16,
  NW = 32,
  SE = 64,
  SW = 128;

const CHUNK_DIR = {
  EAST: E,
  WEST: W,
  NORTH: N,
  SOUTH: S,
  NORTH_EAST: NE,
  NORTH_WEST: NW,
  SOUTH_EAST: SE,
  SOUTH_WEST: SW,
  ALL: E | W | N | S | NE | NW | SE | SW,
  ALL_STRAIGHT: E | W | N | S,
  E, W, N, S, NE, NW, SE, SW
};

const CHUNK_DIR_VECTOR = {};

CHUNK_DIR_VECTOR[E] = new ChunkPos(1, 0);
CHUNK_DIR_VECTOR[W] = new ChunkPos(-1, 0);
CHUNK_DIR_VECTOR[N] = new ChunkPos(0, -1);
CHUNK_DIR_VECTOR[S] = new ChunkPos(0, 1);
CHUNK_DIR_VECTOR[NE] = CHUNK_DIR_VECTOR[N].clone().add(CHUNK_DIR_VECTOR[E]);
CHUNK_DIR_VECTOR[NW] = CHUNK_DIR_VECTOR[N].clone().add(CHUNK_DIR_VECTOR[W]);
CHUNK_DIR_VECTOR[SE] = CHUNK_DIR_VECTOR[S].clone().add(CHUNK_DIR_VECTOR[E]);
CHUNK_DIR_VECTOR[SW] = CHUNK_DIR_VECTOR[S].clone().add(CHUNK_DIR_VECTOR[W]);

const INVERTED_CHUNK_DIR = {};

INVERTED_CHUNK_DIR[E] = W;
INVERTED_CHUNK_DIR[W] = E;
INVERTED_CHUNK_DIR[S] = N;
INVERTED_CHUNK_DIR[N] = S;
INVERTED_CHUNK_DIR[SE] = NW;
INVERTED_CHUNK_DIR[NE] = SW;
INVERTED_CHUNK_DIR[SW] = NE;
INVERTED_CHUNK_DIR[NW] = SE;

const PERPENDICULAR_CHUNK_DIR = {};

PERPENDICULAR_CHUNK_DIR[E] = PERPENDICULAR_CHUNK_DIR[W] = [S, N];
PERPENDICULAR_CHUNK_DIR[S] = PERPENDICULAR_CHUNK_DIR[N] = [E, W];

const CHUNK_DIR_ARR = [E, W, N, S, NE, NW, SE, SW];
const STRAIGHT_DIR_ARR = [E, W, N, S];
const DIAGONAL_DIR_ARR = [SE, NE, SW, NW];

function invertChunkDir(dir) {
  return INVERTED_CHUNK_DIR[dir];
}

function getPerpendicular(dir) {
  return PERPENDICULAR_CHUNK_DIR[dir];
}

function isFilledBtwChunks(chunkA, chunkB) {
  const dx = chunkA.x - chunkB.x;
  const dz = chunkA.z - chunkB.z;

  if (Math.abs(dx) + Math.abs(dz) !== 1) {
    return console.warn(`Non neighborhood chunk check. dx=${dx}, dz=${dz}`);
  }

  let dir;

  if (dx === 0) {
    dir = dz < 0 ? S : N;
  } else if (dz === 0) {
    dir = dx < 0 ? E : W;
  } else {
    return console.warn(`Non chunk check. dx=${dx}, dz=${dz}`);
  }

  return chunkA.lightSidesFilled.get(dir);
}

export { CHUNK_DIR, CHUNK_DIR_ARR, CHUNK_DIR_VECTOR, STRAIGHT_DIR_ARR, DIAGONAL_DIR_ARR, invertChunkDir, isFilledBtwChunks, getPerpendicular };