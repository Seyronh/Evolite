import { expect, test, describe } from "bun:test";
import {
  fittestSelection,
  randomSelection,
  tournamentSelection,
  linearRankingSelection,
  rouletteWheelSelection,
} from "../src/index.ts";

describe("Selection Methods", () => {
  describe("Fittest Selection", () => {
    test("should select the two first individuals from the population", async () => {
      // Arrange
      const population: Array<{ fitness?: number }> = [
        { fitness: 10 },
        { fitness: 20 },
        { fitness: 30 },
        { fitness: 40 },
      ];
      // Act
      const [selected1, selected2] = await fittestSelection(population);
      // Assert
      expect(selected1.fitness).toBe(10);
      expect(selected2.fitness).toBe(20);
    });
    test("should throw an error if the population has less than 2 individuals", async () => {
      // Arrange
      const population: Array<{ fitness?: number }> = [{ fitness: 10 }];
      // Act & Assert
      expect(async () => await fittestSelection(population)).toThrow(
        "Population must have at least 2 individuals for fittest selection."
      );
    });
  });
  describe("Random Selection", () => {
    test("should select two random individuals from the population", async () => {
      // Arrange
      const population: Array<{ fitness?: number }> = [
        { fitness: 10 },
        { fitness: 20 },
        { fitness: 30 },
        { fitness: 40 },
      ];
      // Act
      const [selected1, selected2] = await randomSelection(population);
      // Assert
      expect(population).toContain(selected1);
      expect(population).toContain(selected2);
    });
    test("should throw an error if the population has less than 2 individuals", async () => {
      // Arrange
      const population: Array<{ fitness?: number }> = [{ fitness: 10 }];
      // Act & Assert
      expect(async () => await randomSelection(population)).toThrow(
        "Population must have at least 2 individuals for random selection."
      );
    });
  });
  describe("Tournament Selection", () => {
    test(
      "should select the fittest individual from a random tournament",

      async () => {
        // Arrange
        const population: Array<{ fitness?: number }> = [
          { fitness: 10 },
          { fitness: 20 },
          { fitness: 30 },
          { fitness: 40 },
        ];
        // Act
        const [selected1, selected2] = await tournamentSelection(population);
        // Assert
        expect(population).toContain(selected1);
        expect(population).toContain(selected2);
        expect(selected1.fitness).toBeGreaterThanOrEqual(20);
        expect(selected2.fitness).toBeGreaterThanOrEqual(20);
      },
      { retry: 3 }
    );
    test("should throw an error if the population has less than 2 individuals", async () => {
      // Arrange
      const population: Array<{ fitness?: number }> = [{ fitness: 10 }];
      // Act & Assert
      expect(async () => await tournamentSelection(population)).toThrow(
        "Population must have at least 2 individuals for tournament selection."
      );
    });
  });
  describe("Linear Ranking Selection", () => {
    test("should select two individuals based on linear ranking", async () => {
      // Arrange
      const population: Array<{ fitness?: number }> = [
        { fitness: 10 },
        { fitness: 20 },
        { fitness: 30 },
        { fitness: 40 },
      ];
      // Act
      const [selected1, selected2] = await linearRankingSelection(population);
      // Assert
      expect(population).toContain(selected1);
      expect(population).toContain(selected2);
    });
    test("should throw an error if the population has less than 2 individuals", async () => {
      // Arrange
      const population: Array<{ fitness?: number }> = [{ fitness: 10 }];
      // Act & Assert
      expect(async () => await linearRankingSelection(population)).toThrow(
        "Population must have at least 2 individuals for linear ranking selection."
      );
    });
  });
  describe("Roulette Wheel Selection", () => {
    test("should select two individuals based on roulette wheel selection", async () => {
      // Arrange
      const population: Array<{ fitness?: number }> = [
        { fitness: 10 },
        { fitness: 20 },
        { fitness: 30 },
        { fitness: 40 },
      ];
      // Act
      const [selected1, selected2] = await rouletteWheelSelection(population);
      // Assert
      expect(population).toContain(selected1);
      expect(population).toContain(selected2);
    });
    test("should throw an error if the population has less than 2 individuals", async () => {
      // Arrange
      const population: Array<{ fitness?: number }> = [{ fitness: 10 }];
      // Act & Assert
      expect(async () => await rouletteWheelSelection(population)).toThrow(
        "Population must have at least 2 individuals for roulette wheel selection."
      );
    });
  });
});
