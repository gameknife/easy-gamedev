import TerrainBlock from "../ProceduralGen/TerrainBlockSimple";
import NoiseGenerator, { Perlin } from "../Util/NoiseGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Page5_2DOctave extends cc.Component {

    @property(cc.Slider)
    sliderFreq: cc.Slider = null;

    @property(cc.Slider)
    sliderAmp: cc.Slider = null;

    @property(cc.Slider)
    sliderLac: cc.Slider = null;

    @property(cc.Slider)
    sliderPst: cc.Slider = null;

    @property(cc.Node)
    terrainNode: cc.Node = null;

    @property(cc.Label)
    debugInfo: cc.Label = null;

    graphWidth: number = 256;

    elapsedTime: number = 0;

    paramFreq: number = 0.01;
    paramAmp: number = 100;

    paramLacunarity: number = 4.0;
    paramPresistence: number = 0.18;


    start() {
        this.sliderFreq.node.on('slide', this.onFreqChange, this);
        this.sliderAmp.node.on('slide', this.onAmpChange, this);
        this.sliderLac.node.on('slide', this.onLacChange, this);
        this.sliderPst.node.on('slide', this.onPstChange, this);

        this.onFreqChange(this.sliderFreq);
        this.onAmpChange(this.sliderAmp);
        this.onLacChange(this.sliderLac);
        this.onPstChange(this.sliderPst);
    }

    updateTerrain()
    {
        const time = cc.director.getTotalTime();

        const block = this.terrainNode.getComponent(TerrainBlock);
        if(block)
        {
            block.updateDataSync(this.paramAmp, 0,0, 1.0 / this.paramFreq, 3, this.paramLacunarity, this.paramPresistence);
        }

        const elapsedTime = cc.director.getTotalTime() - time;
        this.debugInfo.string = `update time: ${Math.floor(elapsedTime)}ms`;
    }
    
    onFreqChange(slider: cc.Slider) {
        this.paramFreq = cc.misc.lerp(0.01, 0.1, slider.progress);
        this.updateTerrain();
    }

    onAmpChange(slider: cc.Slider) {
        this.paramAmp = cc.misc.lerp(0, 100, slider.progress);
        this.updateTerrain();
    }

    onLacChange(slider: cc.Slider) {
        this.paramLacunarity = cc.misc.lerp(0.0, 4.0, slider.progress);
        this.updateTerrain();
    }

    onPstChange(slider: cc.Slider) {
        this.paramPresistence = cc.misc.lerp(1.0, 0.0, slider.progress);
        this.updateTerrain();
    }

 
    update(dt) {
        // init logic
        this.elapsedTime += dt;
        this.terrainNode.eulerAngles = cc.v3(0,this.elapsedTime * 10,0);
    }
}
