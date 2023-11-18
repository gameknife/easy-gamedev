// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class GridMesh {

    meshInstance: cc.Mesh = null;

    constructor(width: number, height: number, unitSize: number) {
        // 辅助变量
        const ccRoot: any = cc;
        const gfx = ccRoot.gfx;
        const _vertFormat = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
        ]);

        // 数据结构
        const vertsAll = (width + 1) * (height + 1)
        const indicesAll = width * height * 2 * 3;
        let posData = new Float32Array(vertsAll * 3);
        let uvData = new Float32Array(vertsAll * 2);
        let indiceData = new Uint16Array(indicesAll);

        // 顶点设置
        for (let y = 0; y < (height + 1); ++y) {
            for (let x = 0; x < (width + 1); ++x) {
                posData[(y * (width + 1) + x) * 3 + 0] = x * unitSize - width * unitSize * 0.5;
                posData[(y * (width + 1) + x) * 3 + 1] = 0;
                posData[(y * (width + 1) + x) * 3 + 2] = y * unitSize - height * unitSize * 0.5;
                uvData[(y * (width + 1) + x) * 2 + 0] = x / width;
                uvData[(y * (width + 1) + x) * 2 + 1] = y / height;
            }
        }

        // 三角面设置
        let index = 0;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                indiceData[index++] = y * (width + 1) + x;
                indiceData[index++] = (y + 1) * (width + 1) + x;
                indiceData[index++] = y * (width + 1) + x + 1;

                indiceData[index++] = y * (width + 1) + x + 1;
                indiceData[index++] = (y + 1) * (width + 1) + x;
                indiceData[index++] = (y + 1) * (width + 1) + x + 1;
            }
        }

        // mesh设置
        this.meshInstance = new cc.Mesh();
        this.meshInstance.init(_vertFormat, vertsAll, false);
        this.meshInstance.setVertices(gfx.ATTR_POSITION, posData);
        this.meshInstance.setVertices(gfx.ATTR_UV0, uvData);
        this.meshInstance.setIndices(indiceData, 0, false);
        this.meshInstance.setPrimitiveType(gfx.PT_TRIANGLES, 0);
    }

    getMesh(): cc.Mesh {
        return this.meshInstance;
    }

    static cachedMeshs: any = {};

    static createMesh(width: number, height: number, unitSize: number) : GridMesh
    {
        const key = `${width}-${height}-${unitSize}`;
        if(!this.cachedMeshs[key])
        {
            this.cachedMeshs[key] = new GridMesh(width, height, unitSize);
        }
        return this.cachedMeshs[key];
    }
}
