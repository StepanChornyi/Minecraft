import { BIOME_WETHER_FACTOR, BLOCK_TYPES_TEST } from "./block-types-test";
import NoiseGen from "./noise-gen";

const BIOMES = [
  BLOCK_TYPES_TEST.FOREST,
  BLOCK_TYPES_TEST.DESERT,
];

const BIOME_NOISE = {};

BIOME_NOISE[BLOCK_TYPES_TEST.FOREST] = new NoiseGen();
BIOME_NOISE[BLOCK_TYPES_TEST.DESERT] = new NoiseGen();

export class LevelGenTest {
  static getBiome(x, y) {
    const noises = [];

    for (let i = 0; i < BIOMES.length; i++) {
      const noise = BIOME_NOISE[BIOMES[i]].get(x, y);

      noises.push({
        biome: BIOMES[i],
        noise: BIOME_WETHER_FACTOR[BIOMES[i]].correct(noise, 0, 0)
      });
    }

    noises.sort((a, b) => b.noise - a.noise);

    return noises[0].biome;
  }
}