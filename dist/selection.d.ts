import type { WithFitness } from "./types";
/**
 * This selection method selects the two fittest individuals from the population.
 *
 * Warning: This function expects that the population is already sorted by fitness
 */
declare const fittestSelection: <Entity extends WithFitness>(population: Entity[]) => Promise<[Entity, Entity]>;
/**
 * This selection method selects two individuals at random from the population.
 */
declare const randomSelection: <Entity extends WithFitness>(population: Entity[]) => Promise<[Entity, Entity]>;
/**
 * This selection method selects two individuals from the population using tournament selection.
 *
 * The tournament selection method works by randomly selecting two individuals from the population and comparing their fitness. The individual with the higher fitness is selected as a parent for the next generation.
 *
 * This process is repeated until two parents are selected.
 */
declare const tournamentSelection: <Entity extends WithFitness>(population: Entity[]) => Promise<[Entity, Entity]>;
/**
 * This selection method selects two individuals from the population using linear ranking selection.
 *
 * The linear ranking selection method works by assigning a rank to each individual in the population based on their fitness. The individual with the highest fitness is assigned a rank of 1, the second highest is assigned a rank of 2, and so on. The probability of an individual being selected as a parent for the next generation is proportional to their rank.
 *
 * This process is repeated until two parents are selected.
 */
declare const linearRankingSelection: <Entity extends WithFitness>(population: Entity[]) => Promise<[Entity, Entity]>;
/**
 * This selection method selects two individuals from the population using roulette wheel selection.
 *
 * The roulette wheel selection method works by assigning a probability of selection to each individual in the population based on their fitness. The individual with the highest fitness has the highest probability of being selected as a parent for the next generation.
 *
 * This process is repeated until two parents are selected.
 */
declare const rouletteWheelSelection: <Entity extends WithFitness>(population: Entity[]) => Promise<[Entity, Entity]>;
export { fittestSelection, randomSelection, tournamentSelection, linearRankingSelection, rouletteWheelSelection, };
