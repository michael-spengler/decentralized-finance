import { Observer } from "./observer"

setTimeout(async () => {
    const intervalLengthInSeconds = 5
    await Observer.observe(intervalLengthInSeconds)
})
