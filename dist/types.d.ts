declare enum Optimize {
    Minimize = 0,
    Maximize = 1
}
type WithFitness = {
    fitness?: number;
};
interface geneticAlgorithmOptions<Entity extends WithFitness> {
    initialPopulation: Entity[];
    maxPopulationSize?: number;
    mutationRate?: number;
    fittestAlwaysSurvives?: boolean;
    fitnessObjective?: number;
    optimization?: Optimize;
    logging?: boolean;
    loggingInterval?: number;
    yieldEvery?: number;
}
type fitnessFunction<Entity> = (individual: Entity) => Promise<number>;
type selectionMethod<Entity extends WithFitness> = (population: Entity[]) => Promise<[Entity, Entity]>;
type mutationMethod<Entity> = (individual: Entity) => Promise<Entity>;
type crossoverMethod<Entity> = (parent1: Entity, parent2: Entity) => Promise<Entity>;
export { Optimize };
export type { WithFitness, geneticAlgorithmOptions, fitnessFunction, selectionMethod, mutationMethod, crossoverMethod, };
