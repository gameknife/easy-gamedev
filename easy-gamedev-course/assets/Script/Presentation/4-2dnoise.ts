import NoiseGenerator, { Perlin } from "../Util/NoiseGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Page4_2DNoise extends cc.Component {

    @property(cc.Graphics)
    pen: cc.Graphics = null;

    @property(cc.Node)
    imageNode: cc.Node = null;

    @property(cc.Slider)
    sliderFreq: cc.Slider = null;

    @property(cc.Slider)
    sliderAmp: cc.Slider = null;

    graphWidth: number = 256;

    elapsedTime: number = 0;

    paramFreq: number = 0.1;
    paramAmp: number = 50;

    noiseTexture: cc.Texture2D = null;
    noiseData: Uint8Array = null;

    imageSize: number = 32;

    start() {
        this.sliderFreq.node.on('slide', this.onFreqChange, this);
        this.sliderAmp.node.on('slide', this.onAmpChange, this);

        let pixelFormat = cc.Texture2D.PixelFormat.RGBA8888;
        let width = this.imageSize;
        let height = this.imageSize;
        this.noiseTexture = new cc.Texture2D();
        this.noiseTexture.initWithData(null, pixelFormat, width, height);
        this.noiseTexture.setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);

        this.noiseData = new Uint8Array(width * height * 4);

        const sprite = this.imageNode.getComponent(cc.Sprite);
        const spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(  this.noiseTexture );
        
        sprite.spriteFrame = spriteFrame;
        //sprite.setMaterial(0, cc.Material.getBuiltinMaterial('builtin-2d-sprite'));
    }

    onFreqChange( slider : cc.Slider )
    {
        this.paramFreq = cc.misc.lerp(0.02, 0.2, slider.progress);
    }

    onAmpChange( slider : cc.Slider )
    {
        this.paramAmp = cc.misc.lerp(0, 255, slider.progress);
    }

    update(dt) {

        // init logic
        let width = this.graphWidth;
        let segment = 1;
        let speed = 25;
        let offsetY = 0;

        this.elapsedTime += dt * speed;
        this.pen.clear();

        this.pen.moveTo(0 - width / 2, offsetY)
        for (let i = 0; i < width / segment; ++i) {
            this.pen.lineTo(segment * i - width / 2, offsetY + NoiseGenerator.getNoise1DSigned(this.paramFreq * (i + this.elapsedTime)) * this.paramAmp * 0.25);
        }

        this.pen.stroke();

        // buid the 2d noise
        for( let y = 0; y < this.imageSize; ++y)
        {
            for( let x = 0; x < this.imageSize; ++x)
            {
                const value = NoiseGenerator.getNoise2D(this.paramFreq * (x + this.elapsedTime), this.paramFreq * (y + this.elapsedTime));
                let displayValue = cc.misc.clampf(128 + value * this.paramAmp, 0, 255);
                this.noiseData[y * this.imageSize * 4 + x * 4 + 0] = displayValue;
                this.noiseData[y * this.imageSize * 4 + x * 4 + 1] = displayValue;
                this.noiseData[y * this.imageSize * 4 + x * 4 + 2] = displayValue;
                this.noiseData[y * this.imageSize * 4 + x * 4 + 3] = 255;
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
