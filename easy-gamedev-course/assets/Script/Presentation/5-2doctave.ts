import NoiseGenerator, { Perlin } from "../Util/NoiseGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Page5_2DOctave extends cc.Component {

    @property(cc.Graphics)
    pen: cc.Graphics = null;

    @property(cc.Node)
    imageNode: cc.Node = null;

    @property(cc.Slider)
    sliderFreq: cc.Slider = null;

    @property(cc.Slider)
    sliderAmp: cc.Slider = null;

    @property(cc.Slider)
    sliderLac: cc.Slider = null;

    @property(cc.Slider)
    sliderPst: cc.Slider = null;

    @property(cc.Button)
    btnPaint: cc.Button = null;

    graphWidth: number = 256;

    elapsedTime: number = 0;

    paramFreq: number = 0.1;
    paramAmp: number = 50;

    paramLacunarity: number = 1.0;
    paramPresistence: number = 1.0;

    noiseTexture: cc.Texture2D = null;
    noiseData: Uint8Array = null;

    paintMode: boolean = false;

    imageSize: number = 128;

    @property([cc.Color])
    layerColor: cc.Color[] = [];

    layerHeights: number[] = [0.3, 0.4, 0.42, 0.5, 0.6, 0.7, 0.8, 1];

    start() {
        this.sliderFreq.node.on('slide', this.onFreqChange, this);
        this.sliderAmp.node.on('slide', this.onAmpChange, this);
        this.sliderLac.node.on('slide', this.onLacChange, this);
        this.sliderPst.node.on('slide', this.onPstChange, this);

        this.btnPaint.node.on('click', this.onPaint, this);

        let pixelFormat = cc.Texture2D.PixelFormat.RGBA8888;
        let width = this.imageSize;
        let height = this.imageSize;
        this.noiseTexture = new cc.Texture2D();
        this.noiseTexture.initWithData(null, pixelFormat, width, height);
        this.noiseTexture.setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);

        this.noiseData = new Uint8Array(width * height * 4);

        const sprite = this.imageNode.getComponent(cc.Sprite);
        const spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(this.noiseTexture);

        sprite.spriteFrame = spriteFrame;
    }

    onFreqChange(slider: cc.Slider) {
        this.paramFreq = cc.misc.lerp(0.02, 0.2, slider.progress);
    }

    onAmpChange(slider: cc.Slider) {
        this.paramAmp = cc.misc.lerp(0, 255, slider.progress);
    }

    onLacChange(slider: cc.Slider) {
        this.paramLacunarity = cc.misc.lerp(1.0, 4.0, slider.progress);
    }

    onPstChange(slider: cc.Slider) {
        this.paramPresistence = cc.misc.lerp(1.0, 0.1, slider.progress);
    }

    onPaint(btn: cc.Button) {
        this.paintMode = !this.paintMode;
    }

    getColorByDisplayValue(value: number): cc.Color {
        const valueIn01 = value / 255;

        for (let i = 0; i < this.layerColor.length; ++i) {
            if (valueIn01 < this.layerHeights[i]) {
                return this.layerColor[i];
            }
        }
        return this.layerColor[this.layerColor.length - 1];
    }

    update(dt) {

        // init logic
        let width = this.graphWidth;
        let segment = 1;
        let speed = 10;
        let offsetY = 0;

        this.elapsedTime += dt * speed;
        this.pen.clear();

        this.pen.moveTo(0 - width / 2, offsetY)
        for (let i = 0; i < width / segment; ++i) {
            let merged = offsetY;
            merged += NoiseGenerator.getNoise1DSigned(this.paramFreq * (i + this.elapsedTime)) * this.paramAmp * 0.05;
            merged += NoiseGenerator.getNoise1DSigned(this.paramFreq * this.paramLacunarity * (i + this.elapsedTime)) * this.paramAmp * this.paramPresistence * 0.05;
            merged += NoiseGenerator.getNoise1DSigned(this.paramFreq * this.paramLacunarity * this.paramLacunarity * (i + this.elapsedTime)) * this.paramAmp * this.paramPresistence * this.paramPresistence * 0.05;

            this.pen.lineTo(segment * i - width / 2, merged);
        }

        this.pen.stroke();

        // buid the 2d noise
        for (let y = 0; y < this.imageSize; ++y) {
            for (let x = 0; x < this.imageSize; ++x) {
                const valueMain = (NoiseGenerator.getNoise2D(this.paramFreq * (x + this.elapsedTime), this.paramFreq * (y + this.elapsedTime))*0.5) * this.paramAmp;
                const valueBoulder = (NoiseGenerator.getNoise2D(this.paramFreq * this.paramLacunarity * (x + this.elapsedTime), this.paramFreq * this.paramLacunarity * (y + this.elapsedTime))*0.5) * this.paramAmp * this.paramPresistence;
                const valueSmallRock = (NoiseGenerator.getNoise2D(this.paramFreq * this.paramLacunarity * this.paramLacunarity * (x + this.elapsedTime), this.paramFreq * this.paramLacunarity * this.paramLacunarity * (y + this.elapsedTime))*0.5) * this.paramAmp * this.paramPresistence * this.paramPresistence;

                let displayValue = cc.misc.clampf(128 + valueMain + valueBoulder + valueSmallRock, 0, 255);

                if (this.paintMode) {
                    const color = this.getColorByDisplayValue(displayValue);
                    this.noiseData[y * this.imageSize * 4 + x * 4 + 0] = color.r;
                    this.noiseData[y * this.imageSize * 4 + x * 4 + 1] = color.g;
                    this.noiseData[y * this.imageSize * 4 + x * 4 + 2] = color.b;
                    this.noiseData[y * this.imageSize * 4 + x * 4 + 3] = 255;
                }
                else {
                    this.noiseData[y * this.imageSize * 4 + x * 4 + 0] = displayValue;
                    this.noiseData[y * this.imageSize * 4 + x * 4 + 1] = displayValue;
                    this.noiseData[y * this.imageSize * 4 + x * 4 + 2] = displayValue;
                    this.noiseData[y * this.imageSize * 4 + x * 4 + 3] = 255;
                }
            }
        }

        let updateTextureOptions: any = {
            format: cc.Texture2D.PixelFormat.RGBA8888,
            width: this.imageSize,
            height: this.imageSize,
            genMipMaps: false,
            wrapS: cc.Texture2D.WrapMode.CLAMP_TO_EDGE,
            wrapT: cc.Texture2D.WrapMode.CLAMP_TO_EDGE,
            minFilter: cc.Texture2D.Filter.NEAREST,
            magFilter: cc.Texture2D.Filter.NEAREST,
            premultiplyAlpha: false,
            images: []
        };

        updateTextureOptions.images[0] = this.noiseData;
        this.noiseTexture.update(updateTextureOptions);
    }
}
