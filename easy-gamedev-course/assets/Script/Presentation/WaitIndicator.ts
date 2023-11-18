// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.Sprite])
    dots: cc.Sprite[] = [];

    @property(cc.Node)
    batch: cc.Node = null;

    lightIdx: number = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.schedule(this.updateIndicator, 0.2);
        this.scheduleOnce(this.showIndicator, 0.5);
    }

    showIndicator()
    {
        this.batch.opacity = 100;
    }

    updateIndicator()
    {
        // update the indicator
        for(let i = 0; i < this.dots.length; i++)
        {
            this.dots[i].node.active = (i == this.lightIdx);
        }
        this.lightIdx = (this.lightIdx + 1) % this.dots.length;
    }
    // update (dt) {}
}
