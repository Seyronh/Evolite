import type {
  WithFitness,
  geneticAlgorithmOptions,
  fitnessFunction,
  selectionMethod,
  mutationMethod,
  crossoverMethod,
} from "./types";
import { Optimize } from "./types";
/**
 * Main class for running an asynchronous Genetic Algorithm.
 * Allows optimizing (maximizing or minimizing) a population of entities based on
 * custom fitness, selection, crossover, and mutation functions.
 * * @template Entity - The type of object representing an individual. Must extend {@link WithFitness}.
 */
class GeneticAlgorithm<Entity extends WithFitness> {
  /**
   * The current generation number in the evolutionary process.
   * Starts at 1 and increments with each successful evolution step.
   */
  public generation: number = 1;
  /**
   * The current population of individuals in their current evolutionary state.
   */
  public population: Entity[];
  /** @internal Original backup population used for performing resets. */
  private initialPopulation: Entity[];
  /** @internal Maximum limit of individuals allowed per generation. */
  private maxPopulationSize: number;

  /** @internal Probability (from 0 to 1) of a child undergoing mutation. */
  private mutationRate: number;

  /** @internal Indicates whether the best individual of the current generation passes untouched to the next. */
  private fittestAlwaysSurvives: boolean;

  /** @internal Enables or disables console log output during evolution. */
  private logging: boolean;

  /** @internal Frequency (in generations) with which logs are printed. */
  private loggingInterval: number;

  /** @internal Target fitness value which, when reached, immediately stops the evolution. */
  private fitnessObjective: number | undefined;

  /** @internal Yielding frequency (voluntary asynchronous pause) to avoid blocking the event loop. */
  private yieldEvery: number = 0;

  /** @internal Control flag to safely abort asynchronous execution. */
  private shouldStop: boolean = false;

  /** @internal Determines whether we aim to maximize or minimize the fitness. */
  private optimization: Optimize;

  /** @internal Fitness evaluation function. */
  private fitnessFunction?: fitnessFunction<Entity>;

  /** @internal Strategy for selecting parents for the next generation. */
  private selectionMethod?: selectionMethod<Entity>;

  /** @internal Operator to genetically alter a child individual. */
  private mutationMethod?: mutationMethod<Entity>;

  /** @internal Operator to combine two parents and create a child. */
  private crossoverMethod?: crossoverMethod<Entity>;

  /**
   * Initializes a new instance of the Genetic Algorithm.
   * * @param options - Initial configuration object implementing {@link geneticAlgorithmOptions}.
   * @throws {Error} If the initial population contains 1 or fewer individuals.
   * @throws {Error} If the maximum population size (`maxPopulationSize`) is less than or equal to 1.
   */
  constructor({
    initialPopulation,
    maxPopulationSize = 20,
    mutationRate = 0.01,
    fittestAlwaysSurvives = true,
    optimization = Optimize.Maximize,
    logging = false,
    loggingInterval = 1,
    fitnessObjective,
    yieldEvery = 0,
  }: geneticAlgorithmOptions<Entity>) {
    if (initialPopulation.length <= 1) {
      throw new Error(
        "Initial population must contain more than one individual."
      );
    }
    if (maxPopulationSize <= 1) {
      throw new Error("Max population size must be greater than 1.");
    }
    this.initialPopulation = initialPopulation;
    this.population = [...initialPopulation];
    this.maxPopulationSize = maxPopulationSize;
    this.mutationRate = mutationRate;
    this.fittestAlwaysSurvives = fittestAlwaysSurvives;
    this.optimization = optimization;
    this.logging = logging;
    this.loggingInterval = loggingInterval;
    this.fitnessObjective = fitnessObjective;
    this.yieldEvery = yieldEvery;
  }

  /**
   * Sets the fitness function to evaluate each individual in the population.
   * * @param fitnessFunction - Asynchronous function that calculates and returns the numerical fitness value.
   * @returns The `GeneticAlgorithm` instance to enable method chaining (fluent API).
   */
  setFitnessFunction(
    fitnessFunction: fitnessFunction<Entity>
  ): GeneticAlgorithm<Entity> {
    this.fitnessFunction = fitnessFunction;
    return this;
  }
  /**
   * Sets the parent selection method.
   * * @param selectionMethod - Function responsible for choosing two parents from the current population.
   * @returns The `GeneticAlgorithm` instance to enable method chaining (fluent API).
   */
  setSelectionMethod(
    selectionMethod: selectionMethod<Entity>
  ): GeneticAlgorithm<Entity> {
    this.selectionMethod = selectionMethod;
    return this;
  }
  /**
   * Sets the mutation method for the created children.
   * * @param mutationMethod - Function that randomly alters features of a child individual.
   * @returns The `GeneticAlgorithm` instance to enable method chaining (fluent API).
   */
  setMutationMethod(
    mutationMethod: mutationMethod<Entity>
  ): GeneticAlgorithm<Entity> {
    this.mutationMethod = mutationMethod;
    return this;
  }
  /**
   * Sets the crossover method to mix the genetic code of the parents.
   * * @param crossoverMethod - Function that takes two parents and returns a new child combining their properties.
   * @returns The `GeneticAlgorithm` instance to enable method chaining (fluent API).
   */
  setCrossoverMethod(
    crossoverMethod: crossoverMethod<Entity>
  ): GeneticAlgorithm<Entity> {
    this.crossoverMethod = crossoverMethod;
    return this;
  }
  /**
   * Immediately stops the ongoing asynchronous evolution process (`evolve`) upon completing the current step.
   */
  stop() {
    this.shouldStop = true;
  }
  /**
   * Stops any active execution and fully resets the state of the algorithm
   * (generation back to 1 and population reset to the original initial population).
   */
  reset() {
    this.stop();
    this.generation = 1;
    this.population = [...this.initialPopulation];
  }
  /**
   * Executes a single step (generation) of the genetic algorithm lifecycle internally.
   * * The lifecycle consists of:
   * 1. Evaluating the fitness of the entire population concurrently.
   * 2. Sorting individuals based on the optimization criteria.
   * 3. Checking if the fittest individual has met the target fitness objective.
   * 4. Generating offspring through selection, crossover, and mutation processes.
   * * @returns A boolean indicating whether the target fitness objective (`fitnessObjective`) has been successfully met.
   * @throws {Error} If any of the required methods (fitness, crossover, selection, mutation) have not been set.
   * @throws {Error} If the population becomes empty during the process.
   * @internal
   */
  private async step(): Promise<boolean> {
    if (!this.fitnessFunction || this.fitnessFunction === undefined)
      throw new Error("Fitness function has not been set.");

    if (!this.crossoverMethod || this.crossoverMethod === undefined)
      throw new Error("Crossover method has not been set.");

    if (!this.selectionMethod || this.selectionMethod === undefined)
      throw new Error("Selection method has not been set.");

    if (!this.mutationMethod || this.mutationMethod === undefined)
      throw new Error("Mutation method has not been set.");

    /*
    1. Evaluate fitness of the population
    */
    const fitnessPromises = this.population.map((individual) =>
      this.fitnessFunction!(individual)
    );
    const fitnessValues = await Promise.all(fitnessPromises);
    this.population.forEach((individual, index) => {
      const value = fitnessValues.at(index)!;
      individual.fitness =
        this.optimization === Optimize.Maximize ? value : -value;
    });
    /*
    2. Sort the population based on fitness
    */
    this.population.sort((a, b) => b.fitness! - a.fitness!);
    /*
    3. Check if the fitness objective has been reached
    */
    if (!this.population[0] || this.population[0].fitness === undefined)
      throw new Error("Population is empty. Evolution cannot continue.");
    if (
      this.fitnessObjective !== undefined &&
      ((this.optimization === Optimize.Maximize &&
        this.population[0].fitness >= this.fitnessObjective) ||
        (this.optimization === Optimize.Minimize &&
          -this.population[0].fitness <= this.fitnessObjective))
    )
      return true;
    const newPopulation: Entity[] = [];
    if (this.fittestAlwaysSurvives) {
      newPopulation.push(this.population[0]);
    }
    const offSpringPromises: Promise<Entity>[] = [];
    const slotsToFill = this.maxPopulationSize - newPopulation.length;
    for (let i = 0; i < slotsToFill; i++) {
      offSpringPromises.push(
        (async () => {
          const [parent1, parent2] = await this.selectionMethod!(
            this.population
          );
          let child = await this.crossoverMethod!(parent1, parent2);
          if (Math.random() < this.mutationRate) {
            child = await this.mutationMethod!(child);
          }
          return child;
        })()
      );
    }
    newPopulation.push(...(await Promise.all(offSpringPromises)));
    this.population = newPopulation;
    return false;
  }
  /**
   * Starts or continues the evolution process for a given number of generations.
   * The process will stop early if the `fitnessObjective` is met or if `stop()` is manually invoked.
   * * @param generations - The maximum number of generations/cycles to run.
   * @param callback - Optional lifecycle callback triggered after each generation completes.
   * @returns A promise that resolves with the fittest individual found in the final population.
   * @throws {Error} If the population becomes empty or corrupted at any point during evolution.
   */
  async evolve(
    generations: number,
    callback?: (
      generation: number,
      population: Entity[],
      fittest: Entity
    ) => void | Promise<void>
  ): Promise<Entity> {
    for (let i = 0; i < generations; i++) {
      if (this.shouldStop) {
        if (this.logging) console.log("Evolution stopped manually.");
        break;
      }
      const fitnessObjectiveReached = await this.step();
      if (this.shouldStop) {
        if (this.logging) console.log("Evolution stopped manually.");
        break;
      }
      if (!this.population[0])
        throw new Error("Population is empty. Evolution cannot continue.");
      if (callback) {
        await callback(this.generation, this.population, this.population[0]);
      }
      if (this.yieldEvery > 0 && i % this.yieldEvery === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (fitnessObjectiveReached) {
        if (this.logging) {
          console.log(
            `Fitness objective reached in generation ${this.generation}`
          );
          console.log(
            `Generation ${this.generation} best fitness: ${this.population[0].fitness} average fitness: ${this.population.reduce((acc, individual) => acc + (individual.fitness ?? 0), 0) / this.population.length}`
          );
        }
        break;
      }
      if (this.logging && i % this.loggingInterval === 0) {
        console.log(
          `Generation ${this.generation} best fitness: ${this.population[0].fitness} average fitness: ${this.population.reduce((acc, individual) => acc + (individual.fitness ?? 0), 0) / this.population.length}`
        );
      }
      this.generation++;
    }
    return this.population[0]!;
  }
}
export { GeneticAlgorithm };
