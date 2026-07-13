import { expect, test, describe } from "bun:test";
import { GeneticAlgorithm, Optimize } from "../src/index";
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
      const fittest = await ga.evolve(100);
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
  test("should keep the lowest-cost individual as the fittest one when optimizing for Minimize", async () => {
    // Arrange
    type Candidate = { cost: number; fitness?: number };
    const initialPopulation: Candidate[] = [
      { cost: 10 },
      { cost: 20 },
      { cost: 30 },
      { cost: 40 },
    ];
    const ga = new GeneticAlgorithm({
      initialPopulation,
      maxPopulationSize: 4,
      mutationRate: 0,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Minimize,
      logging: false,
      loggingInterval: 1,
      fitnessObjective: -1000,
    });
    ga.setFitnessFunction(async (individual) => {
      return individual.cost;
    });
    ga.setSelectionMethod(async (population) => {
      return [population[0]!, population[1]!];
    });
    ga.setMutationMethod(async (individual) => {
      individual.cost += 1;
      return individual;
    });
    ga.setCrossoverMethod(async (parent1) => {
      return {
        cost: parent1.cost,
      };
    });
    // Act
    const fittest = await ga.evolve(1);
    // Assert
    expect(fittest.cost).toBe(10);
    expect(fittest.fitness).toBe(-10);
  });
  test("should not stop early when the minimize objective has not been reached", async () => {
    // Arrange
    type Candidate = { cost: number; fitness?: number };
    const initialPopulation: Candidate[] = [
      { cost: 10 },
      { cost: 20 },
      { cost: 30 },
      { cost: 40 },
    ];
    const ga = new GeneticAlgorithm({
      initialPopulation,
      maxPopulationSize: 4,
      mutationRate: 0,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Minimize,
      logging: false,
      loggingInterval: 1,
      fitnessObjective: -100,
    })
      .setFitnessFunction(async (individual) => {
        return individual.cost;
      })
      .setSelectionMethod(async (population) => {
        return [population[0]!, population[1]!];
      })
      .setMutationMethod(async (individual) => {
        individual.cost += 1;
        return individual;
      })
      .setCrossoverMethod(async (parent1) => {
        return {
          cost: parent1.cost,
        };
      });
    // Act
    const fittest = await ga.evolve(2);
    // Assert
    expect(fittest.cost).toBe(10);
    expect(ga.generation).toBe(3);
  });
  test("should call the callback function after each generation", async () => {
    // Arrange
    const initialPopulation = [
      { fitness: 10 },
      { fitness: 20 },
      { fitness: 30 },
      { fitness: 40 },
    ];
    let callbackCount = 0;
    const ga = new GeneticAlgorithm({
      initialPopulation,
      maxPopulationSize: 4,
      mutationRate: 0.1,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
      logging: false,
    });
    ga.setFitnessFunction(async (individual) => individual.fitness ?? 0);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => ({
      fitness: (individual.fitness ?? 0) + 1,
    }));
    ga.setCrossoverMethod(async (parent1, parent2) => ({
      fitness: ((parent1?.fitness ?? 0) + (parent2?.fitness ?? 0)) / 2,
    }));
    // Act
    await ga.evolve(5, (generation, population, fittest) => {
      callbackCount++;
      expect(generation).toBeGreaterThan(0);
      expect(population.length).toBeGreaterThan(0);
      expect(fittest).toBeDefined();
      expect(fittest.fitness).toBeDefined();
    });
    // Assert
    expect(callbackCount).toBe(5);
  });
  test("should pass the correct generation number to the callback", async () => {
    // Arrange
    const initialPopulation = [
      { fitness: 10 },
      { fitness: 20 },
      { fitness: 30 },
      { fitness: 40 },
    ];
    const generationNumbers: number[] = [];
    const ga = new GeneticAlgorithm({
      initialPopulation,
      maxPopulationSize: 4,
      mutationRate: 0,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
      logging: false,
    });
    ga.setFitnessFunction(async (individual) => individual.fitness ?? 0);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => individual);
    ga.setCrossoverMethod(async (parent1) => parent1);
    // Act
    await ga.evolve(3, (generation) => {
      generationNumbers.push(generation);
    });
    // Assert
    expect(generationNumbers).toEqual([1, 2, 3]);
  });
  test("should pass the fittest individual to the callback", async () => {
    // Arrange
    const initialPopulation = [
      { fitness: 10 },
      { fitness: 20 },
      { fitness: 30 },
      { fitness: 40 },
    ];
    const fittestValues: number[] = [];
    const ga = new GeneticAlgorithm({
      initialPopulation,
      maxPopulationSize: 4,
      mutationRate: 0,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
      logging: false,
    });
    ga.setFitnessFunction(async (individual) => individual.fitness ?? 0);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => individual);
    ga.setCrossoverMethod(async (parent1) => parent1);
    // Act
    await ga.evolve(2, (_generation, _population, fittest) => {
      fittestValues.push(fittest.fitness ?? 0);
    });
    // Assert
    expect(fittestValues[0]).toBe(40);
    expect(fittestValues[1]).toBe(40);
  });
  test("should not call the callback if none is provided", async () => {
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
    });
    ga.setFitnessFunction(async (individual) => individual.fitness ?? 0);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => ({
      fitness: (individual.fitness ?? 0) + 1,
    }));
    ga.setCrossoverMethod(async (parent1, parent2) => ({
      fitness: ((parent1?.fitness ?? 0) + (parent2?.fitness ?? 0)) / 2,
    }));
    // Act & Assert (should not throw error)
    const fittest = await ga.evolve(3);
    expect(fittest.fitness).toBeGreaterThan(0);
  });
  test("should not stop early in Minimize mode when current cost is higher than a positive fitnessObjective", async () => {
    // Arrange
    type Candidate = { cost: number; fitness?: number };
    const initialPopulation: Candidate[] = [{ cost: 10 }, { cost: 20 }];

    const ga = new GeneticAlgorithm({
      initialPopulation,
      maxPopulationSize: 2,
      mutationRate: 0,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Minimize,
      fitnessObjective: 5,
      logging: false,
    });

    ga.setFitnessFunction(async (individual) => individual.cost);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => individual);
    ga.setCrossoverMethod(async (parent1) => ({ cost: parent1.cost }));

    // Act
    await ga.evolve(3);

    // Assert
    expect(ga.generation).toBe(4);
  });
});
