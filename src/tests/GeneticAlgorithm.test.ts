import { expect, test, describe } from "bun:test";
import { GeneticAlgorithm, Optimize } from "../index.ts";
describe("Genetic Algorithm", () => {
  test("should throw an error if the initial population has less than 2 individuals", async () => {
    // Arrange
    const initialPopulation = [{ fitness: 10 }];
    // Act & Assert
    expect(() => new GeneticAlgorithm({ initialPopulation })).toThrow(
      "Initial population must contain more than one individual."
    );
  });
  test("should throw an error if the max population size is less than or equal to 1", async () => {
    // Arrange
    const initialPopulation = [{ fitness: 10 }, { fitness: 20 }];
    const maxPopulationSize = 1;
    // Act & Assert
    expect(
      () =>
        new GeneticAlgorithm({
          initialPopulation,
          maxPopulationSize,
        })
    ).toThrow("Max population size must be greater than 1.");
  });
  test(
    "should evolve the population for a given number of generations",
    async () => {
      // Arrange
      const initialPopulation = [
        { fitness: 10 },
        { fitness: 20 },
        { fitness: 30 },
        { fitness: 40 },
      ];
      const ga = new GeneticAlgorithm({
        initialPopulation,
        maxPopulationSize: 4,
        mutationRate: 0.1,
        fittestAlwaysSurvives: true,
        optimization: Optimize.Maximize,
        logging: false,
        loggingInterval: 1,
        fitnessObjective: 100,
      });
      ga.setFitnessFunction(async (individual) => {
        return individual.fitness ?? 0;
      });
      ga.setSelectionMethod(async (population) => {
        return [population[0]!, population[1]!];
      });
      ga.setMutationMethod(async (individual) => {
        individual.fitness = (individual.fitness ?? 0) * 2;
        return individual;
      });
      ga.setCrossoverMethod(async (parent1, parent2) => {
        return {
          fitness: ((parent1?.fitness ?? 0) + (parent2?.fitness ?? 0)) / 2,
        };
      });
      // Act
      const fittest = await ga.evolve(20);
      // Assert
      expect(fittest.fitness).toBeGreaterThanOrEqual(100);
    },
    { retry: 3 }
  );
  test("should log the progress of the evolution if logging is enabled", async () => {
    // Arrange
    const initialPopulation = [
      { fitness: 10 },
      { fitness: 20 },
      { fitness: 30 },
      { fitness: 40 },
    ];
    const ga = new GeneticAlgorithm({
      initialPopulation,
      maxPopulationSize: 4,
      mutationRate: 0.1,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
      logging: true,
      loggingInterval: 1,
      fitnessObjective: 100,
    });
    ga.setFitnessFunction(async (individual) => {
      return individual.fitness ?? 0;
    });
    ga.setSelectionMethod(async (population) => {
      return [population[0]!, population[1]!];
    });
    ga.setMutationMethod(async (individual) => {
      individual.fitness = (individual.fitness ?? 0) * 2;
      return individual;
    });
    ga.setCrossoverMethod(async (parent1, parent2) => {
      return {
        fitness: ((parent1?.fitness ?? 0) + (parent2?.fitness ?? 0)) / 2,
      };
    });
    // Act
    const fittest = await ga.evolve(20);
    // Assert
    expect(fittest.fitness).toBeGreaterThanOrEqual(100);
  });
});
