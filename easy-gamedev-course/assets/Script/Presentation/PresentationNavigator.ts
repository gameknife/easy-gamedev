// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PresentationNavigator extends cc.Component {

    @property(cc.Button)
    back: cc.Button = null;

    @property(cc.Button)
    next: cc.Button = null;

    @property(cc.Label)
    indicator: cc.Label = null;

    @property()
    autoLevel: number = 0;

    @property([cc.String])
    levels: string[] = [];

    currLevel: number = 0;



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        cc.game.addPersistRootNode(this.node);
        this.back.node.on('click', this.onBack, this);
        this.next.node.on('click', this.onNext, this);

        // if(this.autoLevel > 0)
        // {
        //     this.levels = [];
        //     for( let i = 0; i < this.autoLevel; i++)
        //     {
        //         this.levels.push(`s${i}`);
        //     }
        // }
        // this.loadLevel();

        // get all scene in build settings
        let scenes = cc.game["_sceneInfos"];
        let sceneNames = [];
        for (let i = 0; i < scenes.length; ++i) {
            let url = scenes[i].url as string;
            if(url.indexOf('Slide/') != -1)
            {
                // get the pure file name of url
                let index = url.lastIndexOf('/');
                url = url.substr(index + 1);
                index = url.lastIndexOf('.');
                url = url.substr(0, index);

                const progress = parseFloat(url.substr(1));
                sceneNames.push({progress, url});
            }
        }

        sceneNames.sort((a, b) => a.progress - b.progress);

        this.levels = sceneNames.map( scene => scene.url);
        this.loadLevel();
    }

    onBack() {
        this.currLevel = cc.misc.clampf( this.currLevel - 1, 0, this.levels.length - 1);
        this.loadLevel();
    }

    onNext() {
        this.currLevel = cc.misc.clampf( this.currLevel + 1, 0, this.levels.length - 1);
        this.loadLevel();
    }

    async loadLevel() {
        // transition
        cc.director.loadScene("transition", () => {
            // load
            cc.director.loadScene( this.levels[this.currLevel] );
        });
    }

    update (dt) {
        // convert to time digits with zero padding
        let time = cc.director.getTotalTime() / 1000;
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        let timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.indicator.string = `${timeString} - ${this.currLevel + 1} / ${this.levels.length}`;
    }
}
