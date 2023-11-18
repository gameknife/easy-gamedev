// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import CommonUtil from "../Util/CommonUtil";
import NoiseGenerator from "../Util/NoiseGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NoiseMap {

    texture: cc.Texture2D = null;
    textureNormal: cc.Texture2D = null;
    data: Float32Array = null;
    dataTexture: Uint8Array = null;
    dataTextureNormal: Uint8Array = null;
    foliagePos: cc.Vec3[] = [];
    foliageScale: number[] = [];

    width: number = 0;
    height: number = 0;
    bleedEdge: number = 50;

    constructor(width: number, height: number) {
        this.data = new Float32Array((width + this.bleedEdge * 2) * (height + this.bleedEdge * 2));
        this.dataTexture = new Uint8Array(width * height * 4);
        this.dataTextureNormal = new Uint8Array(width * height * 4);
        this.width = width;
        this.height = height;
    }

    sineInOut(k) { return 0.5 * (1 - Math.cos(Math.PI * k)); }

    setDataByRealAddress(x: number, y: number, value: number) {
        this.data[(y + this.bleedEdge) * (this.width + this.bleedEdge * 2) + x + this.bleedEdge] = value;
    }

    getDataByRealAddress(x: number, y: number) {
        return this.data[(y + this.bleedEdge) * (this.width + this.bleedEdge * 2) + x + this.bleedEdge];
    }

    setU8DataByRealAddress(x: number, y: number, channel: number, value: number) {
        if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1) return;
        this.dataTexture[(y * this.width + x) * 4 + channel] = value;
    }

    getU8DataByRealAddress(x: number, y: number, channel: number) {
        if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1) return 0;
        return this.dataTexture[(y * this.width + x) * 4 + channel];
    }

    setNormalByRealAddress(x: number, y: number, normal: cc.Vec3) {
        this.dataTextureNormal[(y * this.width + x) * 4 + 0] = (normal.x * 0.5 + 0.5) * 255;
        this.dataTextureNormal[(y * this.width + x) * 4 + 1] = (normal.y * 0.5 + 0.5) * 255;
        this.dataTextureNormal[(y * this.width + x) * 4 + 2] = (normal.z * 0.5 + 0.5) * 255;
    }

    mapRange01(value: number, a: number, b: number): number {
        return cc.misc.clamp01((value - a) / (b - a));
    }

    async generateDataOctave(holder: cc.Component, maxAltitude: number, offsetX: number, offsetY: number, scale: number, heightAspect: number, octaves: number, lacunarity: number, persistence: number) {
        // gen raw data
        for (let y = -this.bleedEdge; y < this.height + this.bleedEdge; ++y) {
            for (let x = -this.bleedEdge; x < this.width + this.bleedEdge; ++x) {

                let amplitude = 1;
                let freq = 1;
                let sum = 0.5;

                for (let o = 0; o < octaves; ++o) {
                    let modX = (x + offsetX) / scale * freq;
                    let modY = (y + offsetY) / scale * freq;

                    const pValue = NoiseGenerator.getNoise2D(modX, modY) * 0.5;
                    sum += pValue * amplitude;

                    amplitude *= persistence;
                    freq *= lacunarity;
                }

                let heightIn01 = cc.misc.clamp01(sum);

                if (heightIn01 > 0.4) {
                    heightIn01 = (heightIn01 - 0.4) / 0.6;
                    heightIn01 = this.sineInOut(heightIn01);
                    heightIn01 = heightIn01 * 0.6 + 0.4;
                }

                this.setDataByRealAddress(x, y, heightIn01);
            }
            if(holder) await CommonUtil.waitSelfLimit(holder, 16);
        }

        // 生成normal
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const normal = cc.v3(0, -1, 0);

                const origin = cc.v3(x, this.getDataByRealAddress(x, y) * maxAltitude, y);
                const u = cc.v3(x, this.getDataByRealAddress(x, y + 1) * maxAltitude, y + 1).sub(origin);
                const d = cc.v3(x, this.getDataByRealAddress(x, y - 1) * maxAltitude, y - 1).sub(origin);
                const r = cc.v3(x + 1, this.getDataByRealAddress(x + 1, y) * maxAltitude, y).sub(origin);
                const l = cc.v3(x - 1, this.getDataByRealAddress(x - 1, y) * maxAltitude, y).sub(origin);

                const n1 = cc.v3(0, 1, 0);
                cc.Vec3.cross(n1, l, u);
                const n2 = cc.v3(0, 1, 0);
                cc.Vec3.cross(n2, u, r);
                const n3 = cc.v3(0, 1, 0);
                cc.Vec3.cross(n3, r, d);
                const n4 = cc.v3(0, 1, 0);
                cc.Vec3.cross(n4, d, l);

                this.setNormalByRealAddress(x, y, n1.add(n2).add(n3).add(n4).normalize());
            }
            if(holder) await CommonUtil.waitSelfLimit(holder, 16);
        }

        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                this.setU8DataByRealAddress(x, y, 0, 0);
            }
        }
        if(holder) await CommonUtil.waitSelfLimit(holder, 16);

        // 散布植被
        this.foliagePos = [];
        this.foliageScale = [];
        const halfWidth = this.width * 0.5;
        const halfHeight = this.height * 0.5;
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                const heightIn01 = this.getDataByRealAddress(x, y);
                const rand = Math.random();
                if (heightIn01 < 0.5) {
                    const step1 = this.mapRange01(heightIn01, 0.4, 0.5);
                    if (rand < step1 * 0.4) {
                        this.foliagePos.push(cc.v3(x - halfWidth, heightIn01 * maxAltitude, y - halfHeight));
                        this.foliageScale.push(step1 + (rand - 0.5) * 0.1);
                        this.setU8DataByRealAddress(x, y, 0, 255);
                        this.setU8DataByRealAddress(x, y + 1, 0, 255);
                        this.setU8DataByRealAddress(x + 1, y, 0, 255);
                        this.setU8DataByRealAddress(x + 1, y + 1, 0, 255);
                    }
                }
                else {
                    const step1 = 1.0 - this.mapRange01(heightIn01, 0.5, 0.7);

                    if (rand < step1 * 0.4) {
                        this.foliagePos.push(cc.v3(x - halfWidth, heightIn01 * maxAltitude, y - halfHeight));
                        this.foliageScale.push(step1 + (rand - 0.5) * 0.1);
                        this.setU8DataByRealAddress(x, y, 0, 255);
                        this.setU8DataByRealAddress(x, y + 1, 0, 255);
                        this.setU8DataByRealAddress(x + 1, y, 0, 255);
                        this.setU8DataByRealAddress(x + 1, y + 1, 0, 255);
                    }
                }
            }
            if(holder) await CommonUtil.waitSelfLimit(holder, 16);
        }


        // 天光遮蔽
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const dist = 1;
                const currAmp = this.getDataByRealAddress(x, y);
                let occusion = 0;
                for (let dx = -3; dx <= 3; ++dx) {
                    for (let dy = -3; dy <= 3; ++dy) {
                        const factorx = Math.abs(dx);
                        const factory = Math.abs(dy);
                        const ax = x + dx * dist * factorx * factorx;
                        const ay = y + dy * dist * factory * factory;
                        const amp = this.getDataByRealAddress(ax, ay) - 0.01;
                        if (currAmp >= amp) {
                            if (factorx <= 1 && factory <= 1) {
                                const foliageCover = this.getU8DataByRealAddress(ax, ay, 0);
                                if (foliageCover == 0) {
                                    occusion++;
                                }
                            }
                            else {
                                occusion++;
                            }
                        }
                    }
                }
                occusion = occusion / 49;
                this.setU8DataByRealAddress(x, y, 3, occusion * 255);
            }
            if(holder) await CommonUtil.waitSelfLimit(holder, 16);
        }
        // 模糊
        this.blurData(3, 1);

        // 阴影
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const currAmp = this.getDataByRealAddress(x, y);
                let inShadow = false;
                for (let dx = 1; dx < this.bleedEdge; ++dx) {
                    const amp = this.getDataByRealAddress(x - dx, y);
                    if (amp > dx * heightAspect * 0.25 + currAmp) {
                        inShadow = true;
                        break;
                    }
                }
                this.setU8DataByRealAddress(x, y, 3, inShadow ? 0 : 255);
            }
            if(holder) await CommonUtil.waitSelfLimit(holder, 16);
        }

        // 模糊
        this.blurData(3, 2);

        // 植被阴影
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                let inShadow = false;
                for (let dx = 0; dx < 2; ++dx) {
                    const foliageCover = this.getU8DataByRealAddress(x - dx, y, 0);
                    if (foliageCover > 0) {
                        inShadow = true;
                        break;
                    }
                }
                this.setU8DataByRealAddress(x, y, 3, inShadow ? 0 : 255);
            }
        }

        this.blurData(3, 0);
        if(holder) await CommonUtil.waitSelfLimit(holder, 16);
        this.copyData(0, 3);
        if(holder) await CommonUtil.waitSelfLimit(holder, 16);

        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                this.setU8DataByRealAddress(x, y, 0, this.getDataByRealAddress(x, y) * 255);
            }
        }
        if(holder) await CommonUtil.waitSelfLimit(holder, 16);
        // update
        this.updateTexture();
    }

    private blurData(srcChannel: number, dstChannel: number) {
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                let shadowbase = 0;
                for (let dx = -1; dx <= 1; ++dx) {
                    for (let dy = -1; dy <= 1; ++dy) {
                        const ax = cc.misc.clampf(x + dx, 0, this.width - 1);
                        const ay = cc.misc.clampf(y + dy, 0, this.height - 1);
                        shadowbase += this.dataTexture[(ay * this.width + ax) * 4 + srcChannel];
                    }
                }
                this.dataTexture[(y * this.width + x) * 4 + dstChannel] = shadowbase / 9;
            }
        }
    }

    private copyData(srcChannel: number, dstChannel: number) {
        for (let i = 0; i < this.dataTexture.length / 4; ++i) {
            this.dataTexture[i * 4 + dstChannel] = this.dataTexture[i * 4 + srcChannel];
        }
    }

    updateTexture() {
        if (this.texture == null) {
            this.texture = new cc.Texture2D();
            this.textureNormal = new cc.Texture2D();
            this.texture.initWithData(null, cc.Texture2D.PixelFormat.RGBA8888, this.width, this.height);
            this.textureNormal.initWithData(null, cc.Texture2D.PixelFormat.RGBA8888, this.width, this.height);
            this.texture.setFilters(cc.Texture2D.Filter.LINEAR, cc.Texture2D.Filter.LINEAR);
            this.textureNormal.setFilters(cc.Texture2D.Filter.LINEAR, cc.Texture2D.Filter.LINEAR);
            this.texture.setWrapMode(cc.Texture2D.WrapMode.CLAMP_TO_EDGE, cc.Texture2D.WrapMode.CLAMP_TO_EDGE);
            this.textureNormal.setWrapMode(cc.Texture2D.WrapMode.CLAMP_TO_EDGE, cc.Texture2D.WrapMode.CLAMP_TO_EDGE);
        }

        let updateTextureOptions: any = {
            format: cc.Texture2D.PixelFormat.RGBA8888,
            width: this.width,
            height: this.height,
            images: []
        };

        updateTextureOptions.images[0] = this.dataTexture;
        this.texture.update(updateTextureOptions);
        
        updateTextureOptions.images[0] = this.dataTextureNormal;
        this.textureNormal.update(updateTextureOptions);
    }

    getTexture(): cc.Texture2D {
        return this.texture;
    }

    getTextureNormal(): cc.Texture2D {
        return this.textureNormal;
    }
}
