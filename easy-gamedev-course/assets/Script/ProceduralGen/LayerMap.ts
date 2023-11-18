// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class LayerMap {

    texture: cc.Texture2D = null;

    constructor(pixels: number, colors: cc.Color[], heights: number[]) {
        this.texture = new cc.Texture2D();
        this.texture.initWithData(null, cc.Texture2D.PixelFormat.RGBA8888, pixels, 1);
        this.texture.setFilters(cc.Texture2D.Filter.LINEAR, cc.Texture2D.Filter.LINEAR);

        let data = new Uint8Array(pixels * 4);

        for (let i = 0; i < pixels; ++i) {
            const height = i / (pixels - 1);
            const color = this.getColorByDisplayValue(height, colors, heights);
            data[i * 4 + 0] = color.r;
            data[i * 4 + 1] = color.g;
            data[i * 4 + 2] = color.b;
            data[i * 4 + 3] = 255;
        }

        let updateTextureOptions: any = {
            format: cc.Texture2D.PixelFormat.RGBA8888,
            width: pixels,
            height: 1,
            images: []
        };

        updateTextureOptions.images[0] = data;
        this.texture.update(updateTextureOptions);
    }

    getColorByDisplayValue(value: number, layerColor: cc.Color[], layerHeights: number[]): cc.Color {
        for (let i = 0; i < layerColor.length; ++i) {
            if (value < layerHeights[i]) {
                return layerColor[i];
            }
        }
        return layerColor[layerColor.length - 1];
    }

    getTexture(): cc.Texture2D {
        return this.texture;
    }
    
}
