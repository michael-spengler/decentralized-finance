export declare class Trader {
    private brain;
    private earningWindowInMinutes;
    private relativePathToTrainingData;
    constructor(earningWindowInMinutes: number, binaryThresh: number, hiddenLayers: any[], activation: string, leakyReluAlpha: number);
    trainModel(trainingData?: any[]): Promise<void>;
    giveMeYourGuess(): Promise<void>;
    observe(): void;
}
