/**
 * Optimization objectives for the genetic algorithm.
 */
enum Optimize {
  /** Minimize the fitness value (lower scores are better; e.g., error rate, cost, distance). */
  Minimize = 0,
  /** Maximize the fitness value (higher scores are better; e.g., accuracy, profit, score). */
  Maximize = 1,
}
/**
 * Represents an individual entity in the population that carries a fitness score.
 * Any custom entity passed to the Genetic Algorithm must implement this type.
 */
type WithFitness = {
  /**
   * The evaluated fitness score of the individual.
   * This property is automatically assigned by the algorithm during the evaluation step.
   */
  fitness?: number;
};
/**
 * Configuration options for initializing a new `GeneticAlgorithm` instance.
 * * @template Entity - The type of individual being evolved. Must extend {@link WithFitness}.
 */
interface geneticAlgorithmOptions<Entity extends WithFitness> {
  /**
   * The starting set of individuals.
   * @remarks Must contain more than one individual to enable selection and crossover operations.
   */
  initialPopulation: Entity[];
  /**
   * The maximum population size allowed at the end of each generation.
   * @defaultValue `20`
   */
  maxPopulationSize?: number;
  /**
   * The probability (from 0.0 to 1.0) that a generated child will undergo mutation.
   * @defaultValue `0.01` (1% chance)
   */
  mutationRate?: number;
  /**
   * If `true`, the fittest individual of the current generation is automatically carried over
   * to the next generation unchanged (elitism).
   * @defaultValue `true`
   */
  fittestAlwaysSurvives?: boolean;
  /**
   * Optional target fitness score. If any individual reaches or surpasses this fitness value
   * (depending on the {@link optimization} direction), the evolution process terminates early.
   */
  fitnessObjective?: number;
  /**
   * Determines whether the algorithm should attempt to maximize or minimize the fitness values.
   * @defaultValue {@link Optimize.Maximize}
   */
  optimization?: Optimize;
  /**
   * Whether to log evolutionary progress metrics to the console during evolution.
   * @defaultValue `false`
   */
  logging?: boolean;
  /**
   * The interval (in generations) at which to output progress metrics if logging is enabled.
   * @defaultValue `1` (logs every generation)
   */
  loggingInterval?: number;
  /**
   * The interval (in generations) at which the algorithm voluntarily yields to the JavaScript
   * event loop. Set to `0` to disable yielding. This helps prevent UI freezing in single-threaded
   * environments (like browsers) during long running tasks.
   * @defaultValue `0`
   */
  yieldEvery?: number;
}
/**
 * Evaluates an individual and returns a promise resolving to its raw, numerical fitness score.
 * * @template Entity - The type of individual being evaluated.
 * @param individual - The individual entity to evaluate.
 * @returns A promise resolving to the calculated numerical fitness value.
 */
type fitnessFunction<Entity> = (individual: Entity) => Promise<number>;
/**
 * Selects two parent individuals from the current population to produce offspring.
 * * @template Entity - The type of individual. Must extend {@link WithFitness}.
 * @param population - The current population pool.
 * @returns A promise resolving to a tuple containing the two selected parent entities.
 */
type selectionMethod<Entity extends WithFitness> = (
  population: Entity[]
) => Promise<[Entity, Entity]>;
/**
 * Performs a genetic mutation on a single individual.
 * * @template Entity - The type of individual being mutated.
 * @param individual - The target individual to mutate.
 * @returns A promise resolving to the mutated individual (either a modified clone or the modified original reference).
 */
type mutationMethod<Entity> = (individual: Entity) => Promise<Entity>;
/**
 * Combines the genetic traits of two parent individuals to produce a single offspring.
 * * @template Entity - The type of individual being crossed.
 * @param parent1 - The first parent entity.
 * @param parent2 - The second parent entity.
 * @returns A promise resolving to the newly created child individual.
 */
type crossoverMethod<Entity> = (
  parent1: Entity,
  parent2: Entity
) => Promise<Entity>;
export { Optimize };
export type {
  WithFitness,
  geneticAlgorithmOptions,
  fitnessFunction,
  selectionMethod,
  mutationMethod,
  crossoverMethod,
};
