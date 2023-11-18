import NoiseGenerator, { Perlin } from "../Util/NoiseGenerator";

const { ccclass, property } = cc._decorator;

function rand(i)
{
    let x = Math.sin(i) * 43758.5453;
    let y = Math.floor(x);
    return y - x;
}

function frac(i)
{
    return i - Math.floor(i);
}

function floor(i)
{
    return Math.floor(i);
}

@ccclass
export default class Page0_BNoise extends cc.Component {

    @property(cc.Graphics)
    pen: cc.Graphics = null;

    @property(cc.Slider)
    sliderFreq: cc.Slider = null;

    @property(cc.Slider)
    sliderAmp: cc.Slider = null;

    @property()
    graphWidth: number = 500;

    @property()
    noiseType = 0;

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

simpleNoise(x: number)
{
    let i = floor(x);
    let f = frac(x);
    return rand(i);
    return rand(i) * (1.0 - f) + rand(i + 1.0) * f;
    let u = f * f * (3.0 - 2.0 * f );
    return rand(i) * (1.0 - u) + rand(i + 1.0) * u;
}

lerpNoise(x: number)
{
    let i = floor(x);
    let f = frac(x);
    return rand(i) * (1.0 - f) + rand(i + 1.0) * f;
}

cubicNoise(x: number)
{
    let i = floor(x);
    let f = frac(x);
    let u = f * f * (3.0 - 2.0 * f );
    return rand(i) * (1.0 - u) + rand(i + 1.0) * u;
}

Noise(x: number)
{
    switch(this.noiseType)
    {
        case 0:
            return this.simpleNoise(x);
        case 1:
            return this.lerpNoise(x);
        case 2:
            return this.cubicNoise(x);
    }
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
            this.pen.lineTo(segment * i - width / 2, this.Noise(this.paramFreq * (i + this.elapsedTime)) * this.paramAmp);
        }

        this.pen.stroke();
    }
}
