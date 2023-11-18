// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GridMesh from "./GridMesh";
import LayerMap from "./LayerMap";
import NoiseMap from "./NoiseMap";
import PointCloudMesh from "./PointCloudMesh";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TerrainBlock extends cc.Component {

    @property(cc.Material)
    terrainMat: cc.Material = null;

    @property(cc.Material)
    foliageMat: cc.Material = null;

    @property([cc.Color])
    layerColor: cc.Color[] = [];

    @property([cc.Float])
    layerHeights: number[] = [];

    // runtime properties
    noiseMap: NoiseMap = null;
    layerMap: LayerMap = null;
    gridMeshes: GridMesh[] = [];
    foliageMesh: PointCloudMesh = null;
    foliageNode: cc.Node = null;
    currLod: number = -1;

    autoInit: boolean = true;

    start() {
        if (this.autoInit) {
            this.initData(200,1);
            this.updateDataSync(100,0,0,100,4,4,0.19);
        }
    }

    initData(mapSize: number, gridUnit: number) {
        // 基础参数
        const pixelLength = 1.0 / (mapSize + 1);

        // 基础高程
        this.noiseMap = new NoiseMap(mapSize + 1, mapSize + 1);

        // 基础颜色
        this.layerMap = new LayerMap(16, this.layerColor, this.layerHeights);

        // 材质参数
        const mr = this.node.addComponent(cc.MeshRenderer);
        mr.setMaterial(0, this.terrainMat);
        mr.getMaterial(0).setProperty('textureparam', [pixelLength, pixelLength, gridUnit, gridUnit]);

        // 网格LOD
        let meshSize = mapSize;
        let meshGridUnit = gridUnit;
        for (let i = 0; i < 4; ++i) {
            const gridMesh = GridMesh.createMesh(meshSize, meshSize, meshGridUnit);
            this.gridMeshes.push(gridMesh);
            meshSize = meshSize / 2;
            meshGridUnit = meshGridUnit * 2;
        }
        this.switchLOD(0);

        // 植被
        this.foliageNode = new cc.Node("foliage");
        this.foliageNode.is3DNode = true;
        this.node.addChild(this.foliageNode);
        const mrFoliage = this.foliageNode.addComponent(cc.MeshRenderer);
        //mrFoliage.setMaterial(0, this.foliageMat);
        //mrFoliage.getMaterial(0).setProperty('texture', this.noiseMap.getTexture());
    }

    async updateDataAsync(maxAltitude, offsetx, offsety, scale, octave, lacunarity, presistence) {
        await this.noiseMap.generateDataOctave(this, maxAltitude, offsetx, offsety, scale, 1.0 / maxAltitude, octave, lacunarity, presistence);
        this.updateFoliage();  

        const mr = this.node.getComponent(cc.MeshRenderer);
        if (mr) {
            mr.getMaterial(0).setProperty('texture', this.noiseMap.getTexture());
            mr.getMaterial(0).setProperty('normaltexture', this.noiseMap.getTextureNormal());
            mr.getMaterial(0).setProperty('layertexture', this.layerMap.getTexture());
            mr.getMaterial(0).setProperty('terrainparam', [maxAltitude, 0, 0, 0]);
        }
    }

    updateDataSync(maxAltitude, offsetx, offsety, scale, octave, lacunarity, presistence) {
        this.noiseMap.generateDataOctave(null, maxAltitude, offsetx, offsety, scale, 1.0 / maxAltitude, octave, lacunarity, presistence);
        this.updateFoliage();  

        const mr = this.node.getComponent(cc.MeshRenderer);
        if (mr) {
            mr.getMaterial(0).setProperty('texture', this.noiseMap.getTexture());
            mr.getMaterial(0).setProperty('normaltexture', this.noiseMap.getTextureNormal());
            mr.getMaterial(0).setProperty('layertexture', this.layerMap.getTexture());
            mr.getMaterial(0).setProperty('terrainparam', [maxAltitude, 0, 0, 0]);
        }
    }

    updateFoliage() {
        if (this.foliageNode) {
            if(this.foliageMesh)
            {
                this.foliageMesh.meshInstance.destroy();
            }
            this.foliageMesh = new PointCloudMesh(this.noiseMap.foliagePos, this.noiseMap.foliageScale);
            const mrFoliage = this.foliageNode.getComponent(cc.MeshRenderer);
            mrFoliage.mesh = this.foliageMesh.getMesh();
            mrFoliage.setMaterial(0, this.foliageMat);
            mrFoliage.getMaterial(0).setProperty('texture', this.noiseMap.getTexture());
        }
    }

    switchLOD(lod: number) {
        if (this.currLod != lod && lod < this.gridMeshes.length) {
            this.currLod = lod;
            const mr = this.node.getComponent(cc.MeshRenderer);
            mr.mesh = this.gridMeshes[this.currLod].getMesh();
        }
    }

    update(dt: number): void {
        this.node.eulerAngles = cc.v3(0, this.node.eulerAngles.y + dt * 10, 0);
    }

}
