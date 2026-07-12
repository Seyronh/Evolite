import type {
  WithFitness,
  geneticAlgorithmOptions,
  fitnessFunction,
  selectionMethod,
  mutationMethod,
  crossoverMethod,
} from "./types.ts";
import { Optimize } from "./types.ts";

class GeneticAlgorithm<Entity extends WithFitness> {
  public generation: number = 1;
  public population: Entity[];
  private maxPopulationSize: number;
  private mutationRate: number;
  private fittestAlwaysSurvives: boolean;
  private logging: boolean;
  private loggingInterval: number;
  private fitnessObjective: number;
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
    fitnessObjective = 0,
  }: geneticAlgorithmOptions<Entity>) {
    if (initialPopulation.length <= 1) {
      throw new Error(
        "Initial population must contain more than one individual."
      );
    }
    if (maxPopulationSize <= 1) {
      throw new Error("Max population size must be greater than 1.");
    }
    this.population = initialPopulation;
    this.maxPopulationSize = maxPopulationSize;
    this.mutationRate = mutationRate;
    this.fittestAlwaysSurvives = fittestAlwaysSurvives;
    this.optimization = optimization;
    this.logging = logging;
    this.loggingInterval = loggingInterval;
    this.fitnessObjective = fitnessObjective;
  }
  setFitnessFunction(fitnessFunction: fitnessFunction<Entity>): void {
    this.fitnessFunction = fitnessFunction;
  }
  setSelectionMethod(selectionMethod: selectionMethod<Entity>): void {
    this.selectionMethod = selectionMethod;
  }
  setMutationMethod(mutationMethod: mutationMethod<Entity>): void {
    this.mutationMethod = mutationMethod;
  }
  setCrossoverMethod(crossoverMethod: crossoverMethod<Entity>): void {
    this.crossoverMethod = crossoverMethod;
  }
  private async step(): Promise<boolean> {
    if (!this.fitnessFunction) {
      throw new Error("Fitness function has not been set.");
    }
    if (!this.crossoverMethod) {
      throw new Error("Crossover method has not been set.");
    }
    if (!this.selectionMethod) {
      throw new Error("Selection method has not been set.");
    }
    if (!this.mutationMethod) {
      throw new Error("Mutation method has not been set.");
    }
    /*
    1. Evaluate fitness of the population
    */
    const fitnessPromises = this.population.map((individual) =>
      this.fitnessFunction!(individual)
    );
    const fitnessValues = await Promise.all(fitnessPromises);
    this.population.forEach((individual, index) => {
      individual.fitness =
        this.optimization === Optimize.Maximize
          ? fitnessValues[index]!
          : -fitnessValues[index]!;
    });
    /*
    2. Sort the population based on fitness
    */
    this.population.sort((a, b) => b.fitness! - a.fitness!);
    /*
    3. Check if the fitness objective has been reached
    */
    if (
      this.fitnessObjective &&
      ((this.optimization === Optimize.Maximize &&
        this.population[0]!.fitness! >= this.fitnessObjective) ||
        (this.optimization === Optimize.Minimize &&
          this.population[0]!.fitness! <= this.fitnessObjective))
    )
      return true;
    const newPopulation: Entity[] = [];
    if (this.fittestAlwaysSurvives) {
      newPopulation.push(this.population[0]!);
    }
    while (newPopulation.length < this.maxPopulationSize) {
      const parents = await this.selectionMethod(this.population);
      if (parents.length < 2) {
        throw new Error("Selection method must return at least two parents.");
      }
      const [parent1, parent2] = parents;
      let offspring: Entity = await this.crossoverMethod(parent1!, parent2!);
      if (Math.random() < this.mutationRate) {
        offspring = await this.mutationMethod(offspring);
      }
      newPopulation.push(offspring);
    }
    this.population = newPopulation;
    return false;
  }
  /**
   * Evolves the population for a given number of generations.
   * @param generations The number of generations to evolve the population.
   * @returns The fittest individual in the final population.
   */
  async evolve(generations: number): Promise<Entity> {
    for (let i = 0; i < generations; i++) {
      const fitnessObjectiveReached = await this.step();
      if (fitnessObjectiveReached) {
        if (this.logging) {
          console.log(
            `Fitness objective reached in generation ${this.generation}`
          );
          console.log(
            `Generation ${this.generation} best fitness: ${this.population[0]!.fitness} average fitness: ${this.population.reduce((acc, individual) => acc + (individual.fitness ?? 0), 0) / this.population.length}`
          );
        }
        break;
      }
      if (this.logging && i % this.loggingInterval === 0) {
        console.log(
          `Generation ${this.generation} best fitness: ${this.population[0]!.fitness} average fitness: ${this.population.reduce((acc, individual) => acc + (individual.fitness ?? 0), 0) / this.population.length}`
        );
      }
      this.generation++;
    }
    return this.population[0]!;
  }
}
export { GeneticAlgorithm };
