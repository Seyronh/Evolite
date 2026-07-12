import type { WithFitness } from "./types.ts";

/**
 * This selection method selects the two fittest individuals from the population.
 *
 * Warning: This function expects that the population is already sorted by fitness
 */
const fittestSelection = async <Entity extends WithFitness>(
  population: Entity[]
): Promise<[Entity, Entity]> => {
  if (population.length < 2) {
    throw new Error(
      "Population must have at least 2 individuals for fittest selection."
    );
  }
  return [population[0]!, population[1]!];
};
/**
 * This selection method selects two individuals at random from the population.
 */
const randomSelection = async <Entity extends WithFitness>(
  population: Entity[]
): Promise<[Entity, Entity]> => {
  if (population.length < 2) {
    throw new Error(
      "Population must have at least 2 individuals for random selection."
    );
  }
  const randomIndex1 = Math.floor(Math.random() * population.length);
  const randomIndex2 = Math.floor(Math.random() * population.length);
  return [population[randomIndex1]!, population[randomIndex2]!];
};
/**
 * This selection method selects two individuals from the population using tournament selection.
 *
 * The tournament selection method works by randomly selecting two individuals from the population and comparing their fitness. The individual with the higher fitness is selected as a parent for the next generation.
 *
 * This process is repeated until two parents are selected.
 */
const tournamentSelection = async <Entity extends WithFitness>(
  population: Entity[]
): Promise<[Entity, Entity]> => {
  if (population.length < 2) {
    throw new Error(
      "Population must have at least 2 individuals for tournament selection."
    );
  }
  const winners: Entity[] = [];
  for (let i = 0; i < 2; i++) {
    const randomIndex1 = Math.floor(Math.random() * population.length);
    const randomIndex2 = Math.floor(Math.random() * population.length);
    const individual1 = population[randomIndex1]!;
    const individual2 = population[randomIndex2]!;
    const individual1Fitness = individual1.fitness ?? 0;
    const individual2Fitness = individual2.fitness ?? 0;
    const winner =
      individual1Fitness > individual2Fitness ? individual1 : individual2;
    winners.push(winner);
  }

  return [winners[0]!, winners[1]!];
};

/**
 * This selection method selects two individuals from the population using linear ranking selection.
 *
 * The linear ranking selection method works by assigning a rank to each individual in the population based on their fitness. The individual with the highest fitness is assigned a rank of 1, the second highest is assigned a rank of 2, and so on. The probability of an individual being selected as a parent for the next generation is proportional to their rank.
 *
 * This process is repeated until two parents are selected.
 */
const linearRankingSelection = async <Entity extends WithFitness>(
  population: Entity[]
): Promise<[Entity, Entity]> => {
  if (population.length < 2) {
    throw new Error(
      "Population must have at least 2 individuals for linear ranking selection."
    );
  }

  // Sort the population based on fitness in descending order
  const sortedPopulation = [...population].sort((a, b) => {
    const fitnessA = a.fitness ?? 0;
    const fitnessB = b.fitness ?? 0;
    return fitnessB - fitnessA; // Sort in descending order
  });

  // Assign ranks to individuals based on their position in the sorted population
  const ranks = sortedPopulation.map((_, index) => index + 1);

  // Calculate the total rank sum
  const totalRankSum = ranks.reduce((sum, rank) => sum + rank, 0);

  // Select two individuals based on their ranks
  const selectedIndividuals: Entity[] = [];
  for (let i = 0; i < 2; i++) {
    const randomValue = Math.random() * totalRankSum;
    let cumulativeRankSum = 0;

    for (let j = 0; j < sortedPopulation.length; j++) {
      cumulativeRankSum += ranks[j]!;
      if (cumulativeRankSum >= randomValue) {
        selectedIndividuals.push(sortedPopulation[j]!);
        break;
      }
    }
  }

  return [selectedIndividuals[0]!, selectedIndividuals[1]!];
};
/**
 * This selection method selects two individuals from the population using roulette wheel selection.
 *
 * The roulette wheel selection method works by assigning a probability of selection to each individual in the population based on their fitness. The individual with the highest fitness has the highest probability of being selected as a parent for the next generation.
 *
 * This process is repeated until two parents are selected.
 */
const rouletteWheelSelection = async <Entity extends WithFitness>(
  population: Entity[]
): Promise<[Entity, Entity]> => {
  if (population.length < 2) {
    throw new Error(
      "Population must have at least 2 individuals for roulette wheel selection."
    );
  }

  // Calculate the total fitness of the population
  const totalFitness = population.reduce((sum, individual) => {
    const fitness = individual.fitness ?? 0;
    return sum + fitness;
  }, 0);

  // Select two individuals based on their fitness proportion
  const selectedIndividuals: Entity[] = [];
  for (let i = 0; i < 2; i++) {
    const randomValue = Math.random() * totalFitness;
    let cumulativeFitnessSum = 0;

    for (const individual of population) {
      const fitness = individual.fitness ?? 0;
      cumulativeFitnessSum += fitness;
      if (cumulativeFitnessSum >= randomValue) {
        selectedIndividuals.push(individual);
        break;
      }
    }
  }

  return [selectedIndividuals[0]!, selectedIndividuals[1]!];
};

export {
  fittestSelection,
  randomSelection,
  tournamentSelection,
  linearRankingSelection,
  rouletteWheelSelection,
};
