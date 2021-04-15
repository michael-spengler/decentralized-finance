var player = require('play-sound')((opts: any) => { })


export class Player {


    public static async playMP3(path: string) {

        console.log(path)

        player.play(path, function (err: any) {
            if (err) {
                console.log(err)
            }
        })
    }
}

