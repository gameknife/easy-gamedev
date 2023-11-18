// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonUtil {
    static waitSelf(self: cc.Component, second: number) {
        return new Promise(resolve => self.scheduleOnce(resolve, second));
    }

    static waitSelfLimit(self: cc.Component, ms: number) {
        if( !self['ls'] ) self['ls'] = 0;
        const time = cc.director.getTotalTime();
        if(time - self['ls'] > 50)
        {
            self['ls'] = time;
            return new Promise(resolve => self.scheduleOnce(resolve, 0));
        }
    }
}
