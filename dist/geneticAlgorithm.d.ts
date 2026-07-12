import type { WithFitness, geneticAlgorithmOptions, fitnessFunction, selectionMethod, mutationMethod, crossoverMethod } from "./types.ts";
declare class GeneticAlgorithm<Entity extends WithFitness> {
    generation: number;
    population: Entity[];
    private maxPopulationSize;
    private mutationRate;
    private fittestAlwaysSurvives;
    private logging;
    private loggingInterval;
    private fitnessObjective;
    private optimization;
    private fitnessFunction?;
    private selectionMethod?;
    private mutationMethod?;
    private crossoverMethod?;
    constructor({ initialPopulation, maxPopulationSize, mutationRate, fittestAlwaysSurvives, optimization, logging, loggingInterval, fitnessObjective, }: geneticAlgorithmOptions<Entity>);
    setFitnessFunction(fitnessFunction: fitnessFunction<Entity>): GeneticAlgorithm<Entity>;
    setSelectionMethod(selectionMethod: selectionMethod<Entity>): GeneticAlgorithm<Entity>;
    setMutationMethod(mutationMethod: mutationMethod<Entity>): GeneticAlgorithm<Entity>;
    setCrossoverMethod(crossoverMethod: crossoverMethod<Entity>): GeneticAlgorithm<Entity>;
    private step;
    /**
     * Evolves the population for a given number of generations.
     * @param generations The number of generations to evolve the population.
     * @returns The fittest individual in the final population.
     */
    evolve(generations: number, callback?: (generation: number, population: Entity[], fittest: Entity) => void): Promise<Entity>;
}
export { GeneticAlgorithm };
