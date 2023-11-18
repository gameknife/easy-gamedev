import NoiseGenerator, { Perlin } from "../Util/NoiseGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Page2_Octave extends cc.Component {

    @property(cc.Graphics)
    pen: cc.Graphics = null;

    @property(cc.Slider)
    sliderFreq: cc.Slider = null;

    @property(cc.Slider)
    sliderAmp: cc.Slider = null;

    @property()
    drawBaseGraph = true;

    @property(cc.Color)
    baseColor = cc.color(50, 50, 255, 255);

    @property(cc.Color)
    finalColor = cc.color(255, 50, 50, 255);

    @property()
    graphWidth: number = 200;

    elapsedTime: number = 0;

    paramFreq: number = 0.02;
    paramAmp: number = 50;

    paramLacunarity: number = 2.0;
    paramPresistence: number = 1.0;

    @property(cc.Node)
    labelOfParam: cc.Node = null;

    start() {
        if(this.sliderFreq)
        this.sliderFreq.node.on('slide', this.onFreqChange, this);
        if(this.sliderAmp)
        this.sliderAmp.node.on('slide', this.onAmpChange, this);
        this.onUpdateLabel();
    }

    onFreqChange( slider : cc.Slider )
    {
        this.paramLacunarity = cc.misc.lerp(1.0, 4.0, slider.progress);
        this.onUpdateLabel();
    }

    onAmpChange( slider : cc.Slider )
    {
        this.paramPresistence = cc.misc.lerp(1.0, 0.1, slider.progress);
        this.onUpdateLabel();
    }

    onUpdateLabel()
    {
        if(this.labelOfParam)
        {
            const allLabels = this.labelOfParam.getComponentsInChildren(cc.Label);
            if(allLabels.length == 6)
            {
                allLabels[0].string = `频率: ${this.paramFreq.toFixed(2)} * ${this.paramLacunarity.toFixed(2)} ^ 0 = ${this.paramFreq.toFixed(2)}`
                allLabels[1].string = `频率: ${this.paramFreq.toFixed(2)} * ${this.paramLacunarity.toFixed(2)} ^ 1 = ${(this.paramFreq * this.paramLacunarity).toFixed(2)}`
                allLabels[2].string = `频率: ${this.paramFreq.toFixed(2)} * ${this.paramLacunarity.toFixed(2)} ^ 2 = ${(this.paramFreq * this.paramLacunarity * this.paramLacunarity).toFixed(2)}`
            
                allLabels[3].string = `振幅: ${this.paramAmp.toFixed(2)} * ${this.paramPresistence.toFixed(2)} ^ 0 = ${this.paramAmp.toFixed(2)}`
                allLabels[4].string = `振幅: ${this.paramAmp.toFixed(2)} * ${this.paramPresistence.toFixed(2)} ^ 1 = ${(this.paramAmp * this.paramPresistence).toFixed(2)}`
                allLabels[5].string = `振幅: ${this.paramAmp.toFixed(2)} * ${this.paramPresistence.toFixed(2)} ^ 2 = ${(this.paramAmp * this.paramPresistence * this.paramPresistence).toFixed(2)}`
            }
        }
    }


    update(dt) {

        let lineOneOffset = 50;
        let lineTwoOffset = -150;

        // init logic
        let width = this.graphWidth;
        let segment = 1;
        let speed = 25;

        // Lacunarity
        let lacunarity1 = Math.pow( this.paramLacunarity , 0);
        let lacunarity2 = Math.pow( this.paramLacunarity , 1);
        let lacunarity3 = Math.pow( this.paramLacunarity , 2);

        // Persistance
        let presistance1 = Math.pow( this.paramPresistence , 0);
        let presistance2 = Math.pow( this.paramPresistence , 1);
        let presistance3 = Math.pow( this.paramPresistence , 2);


        this.elapsedTime += dt * speed;
        this.pen.clear();

        let startX = 0 - width / 2;

        if(this.drawBaseGraph)
        {
            startX = 0 - width / 2 - width - 50;
            this.pen.strokeColor = this.baseColor;
            this.pen.moveTo(startX, lineOneOffset)
            for (let i = 0; i < width / segment; ++i) {
                this.pen.lineTo(segment * i + startX, lineOneOffset + NoiseGenerator.getNoise1DSigned(this.paramFreq * lacunarity1 * (i + this.elapsedTime)) * this.paramAmp * presistance1);
            }
            
            startX = 0 - width / 2;
            this.pen.moveTo(startX, lineOneOffset)
            for (let i = 0; i < width / segment; ++i) {
                this.pen.lineTo(segment * i + startX, lineOneOffset + NoiseGenerator.getNoise1DSigned(this.paramFreq * lacunarity2  * (i + this.elapsedTime)) * this.paramAmp * presistance2);
            }
    
            startX = 0 - width / 2 + width + 50;
            this.pen.moveTo(startX, lineOneOffset)
            for (let i = 0; i < width / segment; ++i) {
                this.pen.lineTo(segment * i + startX, lineOneOffset + NoiseGenerator.getNoise1DSigned(this.paramFreq * lacunarity3 * (i + this.elapsedTime)) * this.paramAmp * presistance3);
            }
            this.pen.stroke();
        }

        // merged
        startX = 0 - width / 2;
        this.pen.strokeColor = this.finalColor;
        this.pen.moveTo(startX, lineTwoOffset)
        for (let i = 0; i < width / segment; ++i) {

            let merged = lineTwoOffset;
            merged += NoiseGenerator.getNoise1DSigned(this.paramFreq * lacunarity1 * (i + this.elapsedTime)) * this.paramAmp * presistance1;
            merged += NoiseGenerator.getNoise1DSigned(this.paramFreq * lacunarity2 * (i + this.elapsedTime)) * this.paramAmp * presistance2;
            merged += NoiseGenerator.getNoise1DSigned(this.paramFreq * lacunarity3 * (i + this.elapsedTime)) * this.paramAmp * presistance3;

            this.pen.lineTo(segment * i + startX, merged);
        }
        this.pen.stroke();
    }
}
