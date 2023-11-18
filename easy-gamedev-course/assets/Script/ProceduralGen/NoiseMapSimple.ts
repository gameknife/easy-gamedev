// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import NoiseGenerator from "../Util/NoiseGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NoiseMap {

    texture: cc.Texture2D = null;
    dataTexture: Uint8Array = null;

    width: number = 0;
    height: number = 0;

    constructor(width: number, height: number) {
        this.dataTexture = new Uint8Array(width * height * 4);
        this.width = width;
        this.height = height;
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                this.setU8DataByRealAddress(x, y, 0, 255);
                this.setU8DataByRealAddress(x, y, 1, 255);
                this.setU8DataByRealAddress(x, y, 2, 255);
                this.setU8DataByRealAddress(x, y, 3, 255);
            }
        }
    }

    setU8DataByRealAddress(x: number, y: number, channel: number, value: number) {
        this.dataTexture[(y * this.width + x) * 4 + channel] = value;
    }

    ridge(h:number, offset:number)
    {
        h = Math.abs(h);
        h = offset - h;
        h = h * h;
        return h;
    }

    generateDataOctave(offsetX: number, offsetY: number, scale: number, octaves: number, lacunarity: number, persistence: number, turbulence: boolean, ridge: boolean) {
        // gen raw data
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {

                let amplitude = 0.5;
                let freq = 1;
                let sum = 0;
                let prev = 1;

                for (let o = 0; o < octaves; ++o) {
                    let modX = (x + offsetX) / scale * freq;
                    let modY = (y + offsetY) / scale * freq;

                    let pValue = NoiseGenerator.getNoise2D(modX, modY);
                    if(turbulence)
                    {
                        pValue = Math.abs(pValue);
                    }
                    if(ridge)
                    {
                        pValue = this.ridge(pValue, 0.9); 
                        sum += pValue * amplitude * prev;
                    }
                    sum += pValue * amplitude;
                    prev = pValue;

                    
                    amplitude *= persistence;
                    freq *= lacunarity;
                }

                if(ridge || turbulence)
                {

                }
                else
                {
                    sum = sum * 0.5 + 0.5;
                }

                let heightIn01 = cc.misc.clamp01(sum);
                this.setU8DataByRealAddress(x, y, 0, heightIn01 * 255);
                this.setU8DataByRealAddress(x, y, 1, heightIn01 * 255);
                this.setU8DataByRealAddress(x, y, 2, heightIn01 * 255);
            }
        }
      
        // update
        this.updateTexture();
    }

    updateTexture() {
        let updateTextureOptions: any = {
            format: cc.Texture2D.PixelFormat.RGBA8888,
            width: this.width,
            height: this.height,
            images: []
        };

        updateTextureOptions.images[0] = this.dataTexture;
        this.getTexture().update(updateTextureOptions);
    }

    getTexture(): cc.Texture2D {
        if (this.texture == null) {
            this.texture = new cc.Texture2D();
            this.texture.initWithData(null, cc.Texture2D.PixelFormat.RGBA8888, this.width, this.height);
            this.texture.setFilters(cc.Texture2D.Filter.LINEAR, cc.Texture2D.Filter.LINEAR);
            this.texture.setWrapMode(cc.Texture2D.WrapMode.CLAMP_TO_EDGE, cc.Texture2D.WrapMode.CLAMP_TO_EDGE);
        }
        return this.texture;
    }
}
