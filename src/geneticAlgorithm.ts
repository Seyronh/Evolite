import type {
  WithFitness,
  geneticAlgorithmOptions,
  fitnessFunction,
  selectionMethod,
  mutationMethod,
  crossoverMethod,
} from "./types";
import { Optimize } from "./types";

class GeneticAlgorithm<Entity extends WithFitness> {
  public generation: number = 1;
  public population: Entity[];
  private initialPopulation: Entity[];
  private maxPopulationSize: number;
  private mutationRate: number;
  private fittestAlwaysSurvives: boolean;
  private logging: boolean;
  private loggingInterval: number;
  private fitnessObjective: number | undefined;
  private yieldEvery: number = 0;
  private shouldStop: boolean = false;
  private optimization: Optimize;

  private fitnessFunction?: fitnessFunction<Entity>;
  private selectionMethod?: selectionMethod<Entity>;
  private mutationMethod?: mutationMethod<Entity>;
  private crossoverMethod?: crossoverMethod<Entity>;

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
  setFitnessFunction(
    fitnessFunction: fitnessFunction<Entity>
  ): GeneticAlgorithm<Entity> {
    this.fitnessFunction = fitnessFunction;
    return this;
  }
  setSelectionMethod(
    selectionMethod: selectionMethod<Entity>
  ): GeneticAlgorithm<Entity> {
    this.selectionMethod = selectionMethod;
    return this;
  }
  setMutationMethod(
    mutationMethod: mutationMethod<Entity>
  ): GeneticAlgorithm<Entity> {
    this.mutationMethod = mutationMethod;
    return this;
  }
  setCrossoverMethod(
    crossoverMethod: crossoverMethod<Entity>
  ): GeneticAlgorithm<Entity> {
    this.crossoverMethod = crossoverMethod;
    return this;
  }
  stop() {
    this.shouldStop = true;
  }
  reset() {
    this.stop();
    this.generation = 1;
    this.population = [...this.initialPopulation];
  }
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
   * Evolves the population for a given number of generations.
   * @param generations The number of generations to evolve the population.
   * @returns The fittest individual in the final population.
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
