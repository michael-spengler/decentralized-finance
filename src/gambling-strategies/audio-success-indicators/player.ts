
var os = require('os')
var player = require('play-sound')((opts: any) => { })

export class Player {

    public static async playMP3(path: string) {
        if (Player.shallIPlaySounds()) {
            console.log(path)

            player.play(path, function (err: any) {
                if (err) {
                    console.log(err)
                }
            })
        } else {
            console.log(`I won't play sounds as I'm running on ${os.platform()} on a ${os.arch()} architecture.`)
        }
    }

    private static shallIPlaySounds(): boolean {
        return (os.platform() === 'darwin' && os.arch() === 'x64') ? true : false
    }
}
