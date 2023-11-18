// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GridMesh from "./GridMesh";
import LayerMap from "./LayerMap";
import NoiseMap from "./NoiseMapSimple";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TerrainBlock extends cc.Component {

    @property(cc.Material)
    terrainMat: cc.Material = null;

    @property([cc.Color])
    layerColor: cc.Color[] = [];

    @property([cc.Float])
    layerHeights: number[] = [];

    @property()
    octave: number = 4;

    @property()
    ridge: boolean = false;

    // runtime properties
    noiseMap: NoiseMap = null;
    layerMap: LayerMap = null;

    start() {
        this.initData(200,1);
        this.updateDataSync(100,0,0,100,4,4,0.19);
    }

    initData(mapSize: number, gridUnit: number) {
        console.info('init terrain')
        // 基础参数
        const pixelLength = 1.0 / (mapSize + 1);
        // 基础高程
        this.noiseMap = new NoiseMap(mapSize + 1, mapSize + 1);
        // 基础颜色
        this.layerMap = new LayerMap(12, this.layerColor, this.layerHeights);
        // 材质参数
        const mr = this.node.addComponent(cc.MeshRenderer);

        // create material from shader
        mr.setMaterial(0, this.terrainMat);
        mr.getMaterial(0).setProperty('textureparam', [pixelLength, pixelLength, gridUnit, gridUnit]);

        // 网格LOD
        const gridMesh = GridMesh.createMesh(mapSize, mapSize, gridUnit);
        mr.mesh = gridMesh.getMesh();
    }

    updateDataSync(maxAltitude, offsetx, offsety, scale, octave, lacunarity, presistence) {
        this.noiseMap.generateDataOctave( offsetx, offsety, scale, this.octave, lacunarity, presistence, false, this.ridge);

        const mr = this.node.getComponent(cc.MeshRenderer);
        if (mr) {
            mr.getMaterial(0).setProperty('texture', this.noiseMap.getTexture());
            mr.getMaterial(0).setProperty('layertexture', this.layerMap.getTexture());
            mr.getMaterial(0).setProperty('terrainparam', [maxAltitude, 0, 0, 0]);
        }
    }
}
