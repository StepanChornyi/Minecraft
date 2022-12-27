import { BIOME_WETHER_FACTOR, BIOME_TYPES } from "./biome-types";
import NoiseGen from "./noise-gen";

const BIOMES = [
  BIOME_TYPES.FOREST,
  BIOME_TYPES.DESERT,
];

const BIOME_NOISE = {};

BIOME_NOISE[BIOME_TYPES.FOREST] = new NoiseGen();
BIOME_NOISE[BIOME_TYPES.DESERT] = new NoiseGen();

export default class BiomeGen {
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