import type { WithFitness, geneticAlgorithmOptions, fitnessFunction, selectionMethod, mutationMethod, crossoverMethod } from "./types";
declare class GeneticAlgorithm<Entity extends WithFitness> {
    generation: number;
    population: Entity[];
    private initialPopulation;
    private maxPopulationSize;
    private mutationRate;
    private fittestAlwaysSurvives;
    private logging;
    private loggingInterval;
    private fitnessObjective;
    private yieldEvery;
    private shouldStop;
    private optimization;
    private fitnessFunction?;
    private selectionMethod?;
    private mutationMethod?;
    private crossoverMethod?;
    constructor({ initialPopulation, maxPopulationSize, mutationRate, fittestAlwaysSurvives, optimization, logging, loggingInterval, fitnessObjective, yieldEvery, }: geneticAlgorithmOptions<Entity>);
    setFitnessFunction(fitnessFunction: fitnessFunction<Entity>): GeneticAlgorithm<Entity>;
    setSelectionMethod(selectionMethod: selectionMethod<Entity>): GeneticAlgorithm<Entity>;
    setMutationMethod(mutationMethod: mutationMethod<Entity>): GeneticAlgorithm<Entity>;
    setCrossoverMethod(crossoverMethod: crossoverMethod<Entity>): GeneticAlgorithm<Entity>;
    stop(): void;
    reset(): void;
    private step;
    /**
     * Evolves the population for a given number of generations.
     * @param generations The number of generations to evolve the population.
     * @returns The fittest individual in the final population.
     */
    evolve(generations: number, callback?: (generation: number, population: Entity[], fittest: Entity) => void | Promise<void>): Promise<Entity>;
}
export { GeneticAlgorithm };
