/*window.printChunk = () => {
  const obj = new OBJ();

  for (let i = 0; i < this.world.chunks.length; i++) {
    const chunk = this.world.chunks[i];
    
    ChunkOBJExporter.toOBJ(chunk, obj, {
      x: chunk.x * CONFIG.CHUNK_SIZE,
      z: chunk.z * CONFIG.CHUNK_SIZE,
    });
  }

  console.log(`${obj}`);
}*/

export class ChunkOBJExporter {
  static toOBJ(chunk, obj = new OBJ(), offset = { x: 0, z: 0 }) {
    for (let i = 0; i < chunk.subChunks.length; i++) {
      saveSubChunk(obj, chunk.subChunks[i], offset);
    }

    return obj;
  }
}

function saveSubChunk(obj, subChunk, offset) {
  const vertices = subChunk.mesh.vertices;
  const indices = subChunk.mesh.indices;
  const floatsPerVertice = 7;

  let vCount = 0;

  const fOffset = obj.fOffset;

  for (let i = 0; i < vertices.length; i += floatsPerVertice) {
    const x = offset.x + vertices[i];
    const y = subChunk.mesh.y + vertices[i + 1];
    const z = offset.z + vertices[i + 2];

    const u = vertices[i + 3];
    const v = vertices[i + 4];

    obj.v.push(`v ${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)}`);
    obj.vt.push({
      val: `vt ${u.toFixed(5)} ${(1 - v).toFixed(5)}`
    });

    vCount++;
  }

  for (let i = 0, f0, f1, f2; i < indices.length; i += 3) {
    f0 = fOffset + indices[i] + 1;
    f1 = fOffset + indices[i + 1] + 1;
    f2 = fOffset + indices[i + 2] + 1;

    obj.f.push(
      {
        v: f0,
        vt: f0
      },
      {
        v: f1,
        vt: f1
      },
      {
        v: f2,
        vt: f2
      }
    );
  }

  obj.fOffset = fOffset + vCount;

  return obj;
}

export class OBJ {
  constructor() {
    this.v = [];
    this.vt = [];
    this.f = [];

    this.fOffset = 0;
  }

  toString() {
    return this._toStringOptimized();
  }

  _toString() {
    let v = this.v.join('\n');
    let vt = this.vt.map(e => e.val).join('\n');
    let f = "";

    for (let i = 0; i < this.f.length; i += 3) {
      const f0 = this.f[i];
      const f1 = this.f[i + 1];
      const f2 = this.f[i + 2];

      if (f.length) {
        f += "\n";
      }

      f += `f ${f0.v}/${f0.vt} ${f1.v}/${f1.vt} ${f2.v}/${f2.vt}`;
    }

    return `${v}\n${vt}\n${f}`
  }

  _toStringOptimized() {
    const vtSet = {};

    for (let i = 0; i < this.vt.length; i++) {
      if (vtSet[this.vt[i].val]) {
        this.vt[i] = vtSet[this.vt[i].val];
        continue;
      }

      vtSet[this.vt[i].val] = this.vt[i];
    }

    for (let i = 0; i < this.f.length; i++) {
      const vtIndex = this.f[i].vt - 1;

      this.f[i].vt = this.vt[vtIndex];
    }

    this.vt = [];

    for (const key in vtSet) {
      if (Object.hasOwnProperty.call(vtSet, key)) {
        this.vt.push(vtSet[key]);
      }
    }

    this.vt = this.vt.filter(e => !!e)

    for (let i = 0; i < this.f.length; i++) {
      this.f[i].vt = this.vt.indexOf(this.f[i].vt) + 1;
    }

    return this._toString();
  }
}