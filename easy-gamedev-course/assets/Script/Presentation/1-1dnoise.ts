import NoiseGenerator, { Perlin } from "../Util/NoiseGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Page1_1DNoise extends cc.Component {

    @property(cc.Graphics)
    pen: cc.Graphics = null;

    @property(cc.Slider)
    sliderFreq: cc.Slider = null;

    @property(cc.Slider)
    sliderAmp: cc.Slider = null;

    @property()
    graphWidth: number = 500;

    elapsedTime: number = 0;

    paramFreq: number = 0.1;
    paramAmp: number = 50;

    start() {

        this.sliderFreq.node.on('slide', this.onFreqChange, this);
        this.sliderAmp.node.on('slide', this.onAmpChange, this);
    }

    onFreqChange( slider : cc.Slider )
    {
        this.paramFreq = cc.misc.lerp(0.02, 0.2, slider.progress);
    }

    onAmpChange( slider : cc.Slider )
    {
        this.paramAmp = cc.misc.lerp(0, 100, slider.progress);
    }


    update(dt) {

        // init logic
        let width = this.graphWidth;
        let segment = 1;
        let speed = 25;

        this.elapsedTime += dt * speed;
        this.pen.clear();

        this.pen.moveTo(0 - width / 2, 0)
        for (let i = 0; i < width / segment; ++i) {
            this.pen.lineTo(segment * i - width / 2, NoiseGenerator.getNoise1DSigned(this.paramFreq * (i + this.elapsedTime)) * this.paramAmp);
        }

        this.pen.stroke();
    }
}
