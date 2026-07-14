import { expect, test, describe, beforeEach, afterEach, spyOn } from "bun:test";
import type { Mock } from "bun:test";
import { GeneticAlgorithm, Optimize } from "../src/index";
type individual = { cost: number; fitness?: number };
let population: Array<individual> = [];
let logSpy: Mock<() => void>;
beforeEach(() => {
  population = [
    { cost: 10, fitness: 10 },
    { cost: 20, fitness: 20 },
    { cost: 30, fitness: 30 },
    { cost: 40, fitness: 40 },
  ];
  logSpy = spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  population = [];
  logSpy.mockRestore();
});

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
    const maxPopulationSize = 1;
    // Act & Assert
    expect(
      () =>
        new GeneticAlgorithm({
          initialPopulation: population,
          maxPopulationSize,
        })
    ).toThrow("Max population size must be greater than 1.");
  });
  test(
    "should evolve the population for a given number of generations",
    async () => {
      // Arrange
      const ga = new GeneticAlgorithm({
        initialPopulation: population,
        maxPopulationSize: 4,
        mutationRate: 0.1,
        fittestAlwaysSurvives: true,
        optimization: Optimize.Maximize,
        logging: false,
        loggingInterval: 1,
        fitnessObjective: 100,
      });
      ga.setFitnessFunction(async (individual) => {
        return individual.cost ?? 0;
      });
      ga.setSelectionMethod(async (population) => {
        return [population[0]!, population[1]!];
      });
      ga.setMutationMethod(async (individual) => {
        individual.cost = (individual.cost ?? 0) * 2;
        return individual;
      });
      ga.setCrossoverMethod(async (parent1, parent2) => {
        return {
          cost: ((parent1?.cost ?? 0) + (parent2?.cost ?? 0)) / 2,
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

    const ga = new GeneticAlgorithm({
      initialPopulation: population,
      maxPopulationSize: 4,
      mutationRate: 1,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
      logging: true,
      loggingInterval: 1,
      fitnessObjective: 100,
    });
    ga.setFitnessFunction(async (individual) => {
      return individual.cost ?? 0;
    });
    ga.setSelectionMethod(async (population) => {
      return [population[0]!, population[1]!];
    });
    ga.setMutationMethod(async (individual) => {
      individual.cost = (individual.cost ?? 0) * 2;
      return individual;
    });
    ga.setCrossoverMethod(async (parent1, parent2) => {
      return {
        cost: ((parent1?.cost ?? 0) + (parent2?.cost ?? 0)) / 2,
      };
    });
    // Act
    const fittest = await ga.evolve(3);
    // Assert
    expect(fittest.fitness).toBe(140);
    expect(logSpy).toHaveBeenCalledTimes(4);
    expect(logSpy).toHaveBeenCalledWith(
      "Generation 1 best fitness: 40 average fitness: 10"
    );
    expect(logSpy).toHaveBeenCalledWith(
      "Generation 2 best fitness: 70 average fitness: 17.5"
    );
    expect(logSpy).toHaveBeenCalledWith(
      "Generation 3 best fitness: 140 average fitness: 122.5"
    );
    expect(logSpy).toHaveBeenCalledWith(
      "Fitness objective reached in generation 3"
    );
  });
  test("should keep the lowest-cost individual as the fittest one when optimizing for Minimize", async () => {
    // Arrange
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
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
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
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
    let callbackCount = 0;
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
      maxPopulationSize: 4,
      mutationRate: 0.1,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
      logging: false,
    });
    ga.setFitnessFunction(async (individual) => individual.cost ?? 0);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => ({
      cost: (individual.cost ?? 0) + 1,
    }));
    ga.setCrossoverMethod(async (parent1, parent2) => ({
      cost: ((parent1?.cost ?? 0) + (parent2?.cost ?? 0)) / 2,
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
    const generationNumbers: number[] = [];
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
      maxPopulationSize: 4,
      mutationRate: 0,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
      logging: false,
    });
    ga.setFitnessFunction(async (individual) => individual.cost ?? 0);
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
    const fittestValues: number[] = [];
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
      maxPopulationSize: 4,
      mutationRate: 0,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
      logging: false,
    });
    ga.setFitnessFunction(async (individual) => individual.cost ?? 0);
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
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
      maxPopulationSize: 4,
      mutationRate: 0.1,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
      logging: false,
    });
    ga.setFitnessFunction(async (individual) => individual.cost ?? 0);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => ({
      cost: (individual.cost ?? 0) + 1,
    }));
    ga.setCrossoverMethod(async (parent1, parent2) => ({
      cost: ((parent1?.cost ?? 0) + (parent2?.cost ?? 0)) / 2,
    }));
    // Act & Assert (should not throw error)
    const fittest = await ga.evolve(3);
    expect(fittest.fitness).toBeGreaterThan(0);
  });
  test("should not stop early in Minimize mode when current cost is higher than a positive fitnessObjective", async () => {
    // Arrange
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
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
  test("should default yieldEvery to 0 and execute normally", async () => {
    // Arrange
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
      maxPopulationSize: 4,
      mutationRate: 0,
      fittestAlwaysSurvives: true,
      optimization: Optimize.Maximize,
    });

    ga.setFitnessFunction(async (individual) => individual.cost ?? 0);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => individual);
    ga.setCrossoverMethod(async (parent1) => ({ cost: parent1.cost }));

    // Act
    const fittest = await ga.evolve(5);

    // Assert
    expect(fittest.fitness).toBe(40);
    expect(ga.generation).toBe(6);
  });

  test("should block macrotasks when yieldEvery is 0", async () => {
    // Arrange
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
      maxPopulationSize: 4,
      yieldEvery: 0,
    });

    ga.setFitnessFunction(async (individual) => individual.cost ?? 0);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => individual);
    ga.setCrossoverMethod(async (parent1) => ({ cost: parent1.cost }));

    let macroTaskExecuted = false;
    setTimeout(() => {
      macroTaskExecuted = true;
    }, 0);

    // Act
    await ga.evolve(10);

    // Assert
    expect(macroTaskExecuted).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(macroTaskExecuted).toBe(true);
  });

  test("should yield control to macrotasks during evolution when yieldEvery is >= 1", async () => {
    // Arrange
    const ga = new GeneticAlgorithm({
      initialPopulation: population,
      maxPopulationSize: 4,
      yieldEvery: 1,
    });

    ga.setFitnessFunction(async (individual) => individual.cost ?? 0);
    ga.setSelectionMethod(async (population) => [
      population[0]!,
      population[1]!,
    ]);
    ga.setMutationMethod(async (individual) => individual);
    ga.setCrossoverMethod(async (parent1) => ({ cost: parent1.cost }));

    let macroTaskExecuted = false;
    setTimeout(() => {
      macroTaskExecuted = true;
    }, 0);

    // Act
    await ga.evolve(5);

    // Assert
    expect(macroTaskExecuted).toBe(true);
  });
});
