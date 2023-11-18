// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import CommonUtil from "../Util/CommonUtil";
import GridMesh from "./GridMesh";
import TerrainBlock from "./TerrainBlock";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TerrainManager extends cc.Component {

    @property(cc.Material)
    terrainMat: cc.Material = null;

    @property(cc.Material)
    foliageMat: cc.Material = null;

    @property(cc.Material)
    waterMat: cc.Material = null;

    @property([cc.Color])
    layerColor: cc.Color[] = [];

    @property([cc.Float])
    layerHeights: number[] = [];

    @property()
    mapSize: number = 128;

    @property()
    maxAltitude: number = 20;

    @property()
    scale: number = 10;

    @property()
    octave: number = 3;

    @property()
    lacunarity: number = 3.5;

    @property()
    presistence: number = 0.3;

    @property()
    radius: number = 3;

    @property()
    playerPos: cc.Vec3 = cc.v3(0, 10, 0);

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    blocks: any = {}

    asyncInitTasks: TerrainBlock[] = [];

    currTaskWaiting: number = 0;
    currTasking: number = 0;

    waterRender: cc.MeshRenderer = null;

    startGen() {
        // add water
        const meshWater = GridMesh.createMesh(100, 100, 20);
        const waterNode = new cc.Node("water");
        waterNode.is3DNode = true;
        this.node.addChild(waterNode);
        waterNode.position = cc.v3(0, this.maxAltitude * 0.39, 0);

        this.genForRange(this.playerPos, 1, false);

        this.waterRender = waterNode.addComponent(cc.MeshRenderer);
        this.waterRender.setMaterial(0, this.waterMat);
        this.waterRender.mesh = meshWater.getMesh();
    }

    update(dt) {
        if(this.waterRender)
        {
            this.genForRange(this.playerPos, this.radius, true);
            this.waterRender.node.position = cc.v3(this.playerPos.x, this.maxAltitude * 0.39, this.playerPos.z);
        }
    }

    genForRange(pos: cc.Vec3, radius: number, async: boolean) {
        // floor the pos
        const x = Math.floor((pos.x + this.mapSize * 0.5) / this.mapSize);
        const y = Math.floor((pos.z + this.mapSize * 0.5) / this.mapSize);

        for (const block in this.blocks) {
            const tblock = this.blocks[block] as TerrainBlock;
            if (tblock) {
                tblock.node.opacity = 0;
            }
        }

        for (let dx = -radius; dx <= radius; ++dx) {
            for (let dy = -radius; dy <= radius; ++dy) {

                const rx = x + dx;
                const ry = y + dy;

                if ((dx * dx + dy * dy) < radius * radius) {
                    // build if not exist
                    const key = `${rx}_${ry}`;
                    let blockComponent = this.blocks[key] as TerrainBlock;
                    if (!blockComponent) {
                        const newNode = new cc.Node(key);
                        newNode.is3DNode = true;
                        this.node.addChild(newNode);
                        blockComponent = newNode.addComponent(TerrainBlock);
                        this.blocks[key] = blockComponent;

                        blockComponent.autoInit = false;

                        blockComponent.terrainMat = this.terrainMat;
                        blockComponent.foliageMat = this.foliageMat;
                        blockComponent.layerColor = this.layerColor;
                        blockComponent.layerHeights = this.layerHeights;

                        this.genBlockTasks(rx, ry, blockComponent, async);

                        newNode.position = cc.v3(rx * this.mapSize, 0, ry * this.mapSize);
                    }

                    blockComponent.node.opacity = 255;
                    blockComponent.switchLOD(Math.abs(dx) <= 1 && Math.abs(dy) <= 1 ? 0 : 1);
                }
            }
        }
    }

    async genBlockTasks(rx: number, ry: number, blockComponent: TerrainBlock, async: boolean) {
        if (this.currTasking != 0 && async) {

            this.currTaskWaiting++;
            // wait
            while (true) {
                await CommonUtil.waitSelf(this, 0);
                if (this.currTasking == 0) {
                    break;
                }
            }
            this.currTaskWaiting--;
        }

        this.currTasking++;
        blockComponent.initData(this.mapSize, 1);
        if (async) {
            await CommonUtil.waitSelf(this, 0);
            await blockComponent.updateDataAsync(this.maxAltitude, rx * this.mapSize, ry * this.mapSize, this.scale, this.octave, this.lacunarity, this.presistence);
            await CommonUtil.waitSelf(this, 0);
        }
        else
        {
            blockComponent.updateDataSync(this.maxAltitude, rx * this.mapSize, ry * this.mapSize, this.scale, this.octave, this.lacunarity, this.presistence);
        }

        this.currTasking--;
    }
}
