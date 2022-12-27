import ImprovedNoise from '../../../libs/improved-noise';

const config = [
  {
    q: 1 / 3,
    f: 0.05
  },
  {
    q: 1 / 30,
    f: 1
  },
  {
    q: 1 / 200,
    f: 1
  },
];

export default class NoiseGen {
  constructor() {
    this._noise = new ImprovedNoise();
  }

  get(x, y) {
    let res = 0;
    let f = 0;

    for (let i = 0; i < config.length; i++) {
      res += this._noise.noise(x * config[i].q, 0, y * config[i].q) * config[i].f;
      f += config[i].f;
    }

    return res / f;
  }
}