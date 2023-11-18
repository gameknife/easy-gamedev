// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PointCloudMesh {

    meshInstance: cc.Mesh = null;

    constructor(positions : cc.Vec3[] ,scale : number[]) {
        // 辅助变量
        const ccRoot: any = cc;
        const gfx = ccRoot.gfx;
        const _vertFormat = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 4 },
        ]);

        // 数据结构
        const vertsAll = positions.length * 4;
        const indicesAll = positions.length * 2 *3;
        let posData = new Float32Array(vertsAll * 3);
        let uvData = new Float32Array(vertsAll * 4);
        let indiceData = new Uint16Array(indicesAll);

        // 顶点设置
        for( let i = 0; i < positions.length; ++i )
        {
            // 每一个植被的quad
            posData[ (i*4+0) * 3 + 0] = positions[i].x;
            posData[ (i*4+0) * 3 + 1] = positions[i].y;
            posData[ (i*4+0) * 3 + 2] = positions[i].z;

            uvData[ (i*4+0) * 4 + 0] = 0;
            uvData[ (i*4+0) * 4 + 1] = 0;
            uvData[ (i*4+0) * 4 + 2] = scale[i];

            posData[ (i*4+1) * 3 + 0] = positions[i].x;
            posData[ (i*4+1) * 3 + 1] = positions[i].y;
            posData[ (i*4+1) * 3 + 2] = positions[i].z;

            uvData[ (i*4+1) * 4 + 0] = 1;
            uvData[ (i*4+1) * 4 + 1] = 0;
            uvData[ (i*4+1) * 4 + 2] = scale[i];

            posData[ (i*4+2) * 3 + 0] = positions[i].x;
            posData[ (i*4+2) * 3 + 1] = positions[i].y;
            posData[ (i*4+2) * 3 + 2] = positions[i].z;

            uvData[ (i*4+2) * 4 + 0] = 0;
            uvData[ (i*4+2) * 4 + 1] = 1;
            uvData[ (i*4+2) * 4 + 2] = scale[i];

            posData[ (i*4+3) * 3 + 0] = positions[i].x;
            posData[ (i*4+3) * 3 + 1] = positions[i].y;
            posData[ (i*4+3) * 3 + 2] = positions[i].z;
        
            uvData[ (i*4+3) * 4 + 0] = 1;
            uvData[ (i*4+3) * 4 + 1] = 1;
            uvData[ (i*4+3) * 4 + 2] = scale[i];
        }

        // 三角面设置
        let index = 0;
        for( let i = 0; i < positions.length; ++i )
        {
            indiceData[index++] = i * 4 + 0;
            indiceData[index++] = i * 4 + 1;
            indiceData[index++] = i * 4 + 2;

            indiceData[index++] = i * 4 + 2;
            indiceData[index++] = i * 4 + 1;
            indiceData[index++] = i * 4 + 3;
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

}
