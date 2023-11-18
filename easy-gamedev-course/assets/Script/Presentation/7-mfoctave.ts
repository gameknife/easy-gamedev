import NoiseMap from "../ProceduralGen/NoiseMapSimple";
import NoiseGenerator, { Perlin } from "../Util/NoiseGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Page7_MFOctave extends cc.Component {

    @property(cc.Node)
    imageNode: cc.Node = null;

    @property(cc.Slider)
    sliderFreq: cc.Slider = null;

    @property(cc.Slider)
    sliderLac: cc.Slider = null;

    @property(cc.Slider)
    sliderPst: cc.Slider = null;

    @property()
    turbulence: boolean = false;

    @property()
    ridge: boolean = false;



    graphWidth: number = 256;

    elapsedTime: number = 0;

    paramFreq: number = 100;
    paramAmp: number = 50;

    paramLacunarity: number = 1.0;
    paramPresistence: number = 1.0;

    noiseMap: NoiseMap = null;
    mapSize: number = 512;

    @property([cc.Color])
    layerColor: cc.Color[] = [];

    layerHeights: number[] = [0.3, 0.4, 0.42, 0.5, 0.6, 0.7, 0.8, 1];

    start() {
        this.sliderFreq.node.on('slide', this.onFreqChange, this);
        this.sliderLac.node.on('slide', this.onLacChange, this);
        this.sliderPst.node.on('slide', this.onPstChange, this);
        
        // 基础高程
        this.noiseMap = new NoiseMap(this.mapSize, this.mapSize);

        const sprite = this.imageNode.getComponent(cc.Sprite);
        const spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(this.noiseMap.getTexture());
        sprite.spriteFrame = spriteFrame;

        this.onFreqChange(this.sliderFreq);
        this.onLacChange(this.sliderLac);
        this.onPstChange(this.sliderPst);
    }

    onFreqChange(slider: cc.Slider) {
        this.paramFreq = cc.misc.lerp(100, 10, slider.progress);
        this.sliderFreq.node.getChildByName("New Label").getComponent(cc.Label).string = `频率: ${this.paramFreq.toFixed(2)}`;
        this.noiseMap.generateDataOctave(0,0,this.paramFreq, 4, this.paramLacunarity, this.paramPresistence, false, this.ridge);
    }

    onLacChange(slider: cc.Slider) {
        this.paramLacunarity = cc.misc.lerp(1.0, 4.0, slider.progress);
        this.sliderLac.node.getChildByName("New Label").getComponent(cc.Label).string = `分形: ${this.paramLacunarity.toFixed(2)}`;
        this.noiseMap.generateDataOctave(0,0,this.paramFreq, 4, this.paramLacunarity, this.paramPresistence, false, this.ridge);
    }

    onPstChange(slider: cc.Slider) {
        this.paramPresistence = cc.misc.lerp(1.0, 0.1, slider.progress);
        this.sliderPst.node.getChildByName("New Label").getComponent(cc.Label).string = `持续: ${this.paramPresistence.toFixed(2)}`;
        this.noiseMap.generateDataOctave(0,0,this.paramFreq, 4, this.paramLacunarity, this.paramPresistence, false, this.ridge);
    }

    // update(dt) {
     
    // }
}
