
// inspired by https://www.etherchain.org/tools/unitConverter

export class EthereumUnitsConverter {

    public static convertEtherToFinney(amountOfEther: number): number {
        return amountOfEther * Math.pow(10, 3)
    }

    public static convertEtherToSzabo(amountOfEther: number): number {
        return amountOfEther * Math.pow(10, 6)
    }

    public static convertEtherToGWEIShannon(amountOfEther: number): number {
        return amountOfEther * Math.pow(10, 9)
    }

    public static convertEtherToMWEI(amountOfEther: number): number {
        return amountOfEther * Math.pow(10, 12)
    }

    public static convertEtherToKWEI(amountOfEther: number): number {
        return amountOfEther * Math.pow(10, 15)
    }

    public static convertEtherToWEI(amountOfEther: number): number {
        return amountOfEther * Math.pow(10, 18)
    }

}