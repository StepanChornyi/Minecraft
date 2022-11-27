import { Black, CapsStyle, ColorHelper, DisplayObject, Graphics, RGB, Sprite, Vector } from "black-engine";
import ResizeActionComponent from "../../libs/resize-action-component";
import MathUtils from "../../utils/MathUtils";
import { BIOME_WETHER_FACTOR, BLOCK_COLOR, BLOCK_TYPES_TEST } from "./block-types-test";
import { ChunkTest2D } from "./chunk-test-2d";
import NoiseGenTest from "./noise-gen-test";

const noise1 = new NoiseGenTest();
const noise2 = new NoiseGenTest();

const BIOMES = [
  BLOCK_TYPES_TEST.FOREST,
  BLOCK_TYPES_TEST.DESERT,
];

const BIOME_NOISE = {};

BIOME_NOISE[BLOCK_TYPES_TEST.FOREST] = new NoiseGenTest();
BIOME_NOISE[BLOCK_TYPES_TEST.DESERT] = new NoiseGenTest();

export class LevelGenTest extends DisplayObject {
  constructor() {
    super();

    this._wrapper = this.addChild(new DisplayObject());

    this._init();

    this.getBiome(20, 20, 0.2);
  }

  _init() {
    const noise1 = new NoiseGenTest();
    const noise2 = new NoiseGenTest();

    const F = 10;
    const S = 16;

    const BIOMES = [
      // BLOCK_TYPES_TEST.PLAINS,
      BLOCK_TYPES_TEST.FOREST,
      // BLOCK_TYPES_TEST.MOUNTAINS,
      // BLOCK_TYPES_TEST.SWAMP,
      // BLOCK_TYPES_TEST.TAIGA,
      BLOCK_TYPES_TEST.DESERT,
      // BLOCK_TYPES_TEST.TUNDRA,
    ];

    const BIOME_NOISE = {};

    BIOME_NOISE[BLOCK_TYPES_TEST.PLAINS] = new NoiseGenTest();
    BIOME_NOISE[BLOCK_TYPES_TEST.FOREST] = new NoiseGenTest();
    // BIOME_NOISE[BLOCK_TYPES_TEST.MOUNTAINS] = new NoiseGenTest();
    BIOME_NOISE[BLOCK_TYPES_TEST.SWAMP] = new NoiseGenTest();
    BIOME_NOISE[BLOCK_TYPES_TEST.TAIGA] = new NoiseGenTest();
    BIOME_NOISE[BLOCK_TYPES_TEST.DESERT] = new NoiseGenTest();
    // BIOME_NOISE[BLOCK_TYPES_TEST.TUNDRA] = new NoiseGenTest();

    for (let y = -F; y < F; y++) {
      for (let x = -F; x < F; x++) {
        if (MathUtils.isOutOfRadius(x + 0.5, y + 0.5, F)) {
          continue;
        }

        const chunk = new ChunkTest2D();
        const color = new RGB();

        chunk.x = x * S;
        chunk.y = y * S;

        for (let yy = 0; yy < S; yy++) {
          for (let xx = 0; xx < S; xx++) {

            const temp = noise1.get(x * S + xx, y * S + yy);
            const hum = noise2.get(x * S + xx, y * S + yy);

            const noises = [];

            for (let i = 0; i < BIOMES.length; i++) {
              const noise = BIOME_NOISE[BIOMES[i]].get(x * S + xx + 3000, y * S + yy);

              noises.push({
                biome: BIOMES[i],
                noise: BIOME_WETHER_FACTOR[BIOMES[i]].correct(noise, temp, hum)
              });
            }

            noises.sort((a, b) => b.noise - a.noise);

            // const a1 = noise1.get(x * S + xx + 3000, y * S + yy)
            // const a2 = noise2.get(x * S + xx + 3000, y * S + yy)

            // const vec = new Vector(a1, a2);

            // vec.normalize();

            // vec.x = Math.round(vec.x * 255);
            // vec.y = Math.round(vec.y * 255);


            // color.r = color.g = color.b = Math.round(noise1.get(x * S + xx + 3000, y * S + yy) * 255);

            // chunk.setColor(xx, yy, color);
            // chunk.setColor(xx, yy, BLOCK_COLOR[(vec.x < 30 && vec.y > 70) ? BLOCK_TYPES_TEST.RAIN_FOREST : BLOCK_TYPES_TEST.DESERT]);
            chunk.setColor(xx, yy, BLOCK_COLOR[noises[0].biome]);
            // chunk.setColor(xx, yy, this.getBiome(
            //   noise1.get(x * S + xx + 3000, y * S + yy),
            //   noise2.get(x * S + xx + 3000, y * S + yy),
            //   1
            // ));
          }
        }

        this._wrapper.addChild(chunk);

        chunk.updateView();
      }
    }
  }

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

  getBiome(tem, hum, f) {
    let block = null;

    const vec = new Vector(tem, hum);

    vec.normalize();

    tem = Math.round(vec.x * 100 * f);
    hum = Math.round(vec.y * 100 * f);

    // console.log(tem, hum);


    if (tem > 75) {
      if (hum > 75) {
        // console.log("RAIN_FOREST");
        block = BLOCK_TYPES_TEST.RAIN_FOREST;
      } else if (hum > 50) {
        // console.log("SEASONAL_FOREST");
        block = BLOCK_TYPES_TEST.SEASONAL_FOREST;
      } else if (hum > 25) {
        // console.log("SAVANNA");
        block = BLOCK_TYPES_TEST.SAVANNA;
      } else {
        // console.log("DESERT");
        block = BLOCK_TYPES_TEST.DESERT;
      }

      return BLOCK_COLOR[block];
    }

    if (tem > 50) {
      if (hum > 75) {
        // console.log("SWAMP");
        block = BLOCK_TYPES_TEST.SWAMP;
      } else if (hum > 50) {
        // console.log("FOREST");
        block = BLOCK_TYPES_TEST.FOREST;
      } else if (hum > 25) {
        // console.log("WOODS");
        block = BLOCK_TYPES_TEST.WOODS;
      } else {
        if (tem > 65) {
          // console.log("DESERT");
          block = BLOCK_TYPES_TEST.DESERT;
        } else {
          // console.log("GRASS_DESERT");
          block = BLOCK_TYPES_TEST.GRASS_DESERT;
        }
      }

      return BLOCK_COLOR[block];
    }

    if (tem > 25) {
      if (hum > 25) {
        // console.log("TAIGA");
        block = BLOCK_TYPES_TEST.TAIGA;
      } else {
        // console.log("GRASS_DESERT");
        block = BLOCK_TYPES_TEST.GRASS_DESERT;
      }

      return BLOCK_COLOR[block];
    }

    // console.log("TUNDRA");
    block = BLOCK_TYPES_TEST.TUNDRA;

    return BLOCK_COLOR[block];
  }

  onAdded() {
    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  onResize() {
    const stageBounds = Black.stage.bounds;

    this.x = stageBounds.center().x;
    this.y = stageBounds.center().y;

    this.scale = 1.5;
  }
}