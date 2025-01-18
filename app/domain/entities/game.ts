import type { RoundResult } from '~/domain/entities/round-result';
import type { RoundInfo } from '~/domain/entities/round-info';
import { createNoMoreNextRoundError } from '~/domain/entities/errors/no-more-next-round';
import type { RoundScore } from '~/domain/entities/round-score';
import type { Ranking } from '~/domain/entities/ranking';
import type { RoundDirection } from '~/domain/entities/round-direction';

const MAX_CARDS = 52;
const BASE_WIN_POINTS = 20;
const BASE_LOOSE_POINTS = -20;
const WIN_ITEM_POINTS = 10;
const LOOSE_ITEM_POINTS = 10;

export interface Game {
  id: string;
  creationDate: Date;
  ownerId: number;
  roundResults: RoundResult[];
  playersInOrder: string[];
}

export function isTerminated(game: Game): boolean {
  const { length: totalPassedRounds } = game.roundResults;
  const { totalRounds } = getGameGlobalProperties(game.playersInOrder.length);

  return totalPassedRounds === totalRounds;
}

export function getRanking(game: Game): Ranking {
  const roundScores = getRoundScores(game);

  if (roundScores.length !== 0) {
    return roundScores[roundScores.length - 1].cumulativeRanking;
  }

  return game.playersInOrder.map((player, i) => ({
    player,
    index: 1,
    isExAequoWithPrevious: i !== 0,
    cumulativePoints: 0,
  }));
}

export function getRoundScores(game: Game): RoundScore[] {
  return game.roundResults.reduce((roundScores, roundResult) => {
    const previousRoundScoreResults: RoundScore['results'] = roundScores.length !== 0
      ? roundScores[roundScores.length - 1].results
      : createInitialRoundScoreResults(game.playersInOrder);
    const results = createRoundScoreResults(
      game.playersInOrder,
      roundResult,
      previousRoundScoreResults
    );
    const cumulativeRanking = createRoundCumulativeRanking(results);

    roundScores.push({ cumulativeRanking, results });

    return roundScores;
  }, [] as RoundScore[]);
}

export function getRoundInfoList(game: Game): RoundInfo[] {
  const {
    totalRounds,
    trumpTotalCards,
    noTrumpMaxTotalCards,
    noTrumpTotalRounds,
  } = getGameGlobalProperties(game.playersInOrder.length);

  return Array.from({ length: totalRounds }, (_, i) => getRoundInfo(
    game.playersInOrder,
    totalRounds,
    trumpTotalCards,
    noTrumpMaxTotalCards,
    noTrumpTotalRounds,
    i,
  ));
}

export function getNextRoundInfo(game: Game): RoundInfo {
  const {
    totalRounds,
    trumpTotalCards,
    noTrumpMaxTotalCards,
    noTrumpTotalRounds,
  } = getGameGlobalProperties(game.playersInOrder.length);
  const { length: totalPassedRounds } = game.roundResults;

  return getRoundInfo(
    game.playersInOrder,
    totalRounds,
    trumpTotalCards,
    noTrumpMaxTotalCards,
    noTrumpTotalRounds,
    totalPassedRounds,
  );
}

export function getGameGlobalProperties(totalPlayers: number) {
  const trumpTotalCards = MAX_CARDS % totalPlayers === 0
    ? Math.floor(MAX_CARDS / totalPlayers) - 1
    : Math.floor(MAX_CARDS / totalPlayers);
  const noTrumpMaxTotalCards = MAX_CARDS % totalPlayers === 0 ? trumpTotalCards + 1 : trumpTotalCards;
  const noTrumpTotalRounds: 1 | 2 = ((trumpTotalCards * 2) + 1) % totalPlayers === 1 ? 2 : 1;
  const totalRounds = (trumpTotalCards * 2) + noTrumpTotalRounds;

  return {
    totalRounds,
    trumpTotalCards,
    noTrumpMaxTotalCards,
    noTrumpTotalRounds,
  };
}

function getRoundInfo(
  playersInOrder: string[],
  totalRounds: number,
  trumpTotalCards: number,
  noTrumpMaxTotalCards: number,
  noTrumpTotalRounds: 1 | 2,
  totalPassedRounds: number,
): RoundInfo {
  if (totalRounds === totalPassedRounds) {
    throw createNoMoreNextRoundError();
  }

  let direction: RoundDirection;
  let totalCardsPerPlayer: number;
  const { length: totalPlayers } = playersInOrder;
  const index = totalPassedRounds + 1;
  const nextDealerIndex = totalPassedRounds % totalPlayers;
  const dealer = playersInOrder[nextDealerIndex];
  const playersInRoundOrder = [...playersInOrder.slice(nextDealerIndex + 1), ...playersInOrder.slice(0, nextDealerIndex + 1)];

  if (totalPassedRounds < trumpTotalCards) {
    direction = 'asc';
    totalCardsPerPlayer = totalPassedRounds + 1;
  } else if (totalPassedRounds === trumpTotalCards) {
    direction = noTrumpTotalRounds === 1 ? 'no-trump' : 'no-trump-1';
    totalCardsPerPlayer = noTrumpMaxTotalCards;
  } else if (totalPassedRounds === trumpTotalCards + 1 && noTrumpTotalRounds === 2) {
    direction = 'no-trump-2';
    totalCardsPerPlayer = noTrumpMaxTotalCards;
  } else {
    direction = 'desc';
    totalCardsPerPlayer = totalRounds - totalPassedRounds
  }

  return {
    index,
    dealer,
    direction,
    totalCardsPerPlayer,
    playersInRoundOrder,
  };
}

function createRoundScoreResults(
  playersInOrder: string[],
  roundResult: RoundResult,
  previousRoundScoreResults: RoundScore['results'],
): RoundScore['results'] {
  return playersInOrder.reduce((acc, player) => {
    const previousRoundPlayerScoreResults = previousRoundScoreResults[player];
    const playerRoundResult = roundResult[player];
    const playerRoundPoints = getPlayerRoundPoints(playerRoundResult);
    const isContractRespected = playerRoundPoints > 0;

    acc[player] = {
      points: playerRoundPoints,
      cumulativeWonRounds: isContractRespected
        ? previousRoundPlayerScoreResults.cumulativeWonRounds + 1
        : previousRoundPlayerScoreResults.cumulativeWonRounds,
      cumulativeLostRounds: isContractRespected
        ? previousRoundPlayerScoreResults.cumulativeLostRounds
        : previousRoundPlayerScoreResults.cumulativeLostRounds + 1,
      cumulativeCalls: previousRoundPlayerScoreResults.cumulativeCalls + playerRoundResult.call,
      cumulativeWonCalls: previousRoundPlayerScoreResults.cumulativeWonCalls + playerRoundResult.result,
      cumulativePoints: previousRoundPlayerScoreResults.cumulativePoints + playerRoundPoints,
    };

    return acc;
  }, {} as RoundScore['results']);
}

function getPlayerRoundPoints({ call, result }: RoundResult[string]): number {
  const delta = Math.abs(result - call);

  return delta === 0 ? BASE_WIN_POINTS + (call * WIN_ITEM_POINTS) : BASE_LOOSE_POINTS - ((delta - 1) * LOOSE_ITEM_POINTS);
}

function createInitialRoundScoreResults(playersInOrder: string[]): RoundScore['results'] {
  return playersInOrder.reduce((acc, player) => {
    acc[player] = {
      cumulativePoints: 0,
      cumulativeCalls: 0,
      cumulativeWonCalls: 0,
      cumulativeLostRounds: 0,
      cumulativeWonRounds: 0,
      points: 0,
    };

    return acc;
  }, {} as RoundScore['results']);
}

function createRoundCumulativeRanking(roundScoreResults: RoundScore['results']): RoundScore['cumulativeRanking'] {
  return Object
    .entries(roundScoreResults)
    .sort(([, a], [, b]) => b.cumulativePoints - a.cumulativePoints)
    .reduce((roundCumulativeRanking, [player, { cumulativePoints }]) => {
      if (roundCumulativeRanking.length === 0) {
        roundCumulativeRanking.push({
          player,
          cumulativePoints,
          index: 1,
          isExAequoWithPrevious: false,
        });
      } else {
        const lastRoundCumulativeRanking = roundCumulativeRanking[roundCumulativeRanking.length - 1];

        if (cumulativePoints === lastRoundCumulativeRanking.cumulativePoints) {
          roundCumulativeRanking.push({
            player,
            cumulativePoints,
            isExAequoWithPrevious: true,
            index: lastRoundCumulativeRanking.index,
          });
        } else {
          roundCumulativeRanking.push({
            player,
            cumulativePoints,
            isExAequoWithPrevious: false,
            index: roundCumulativeRanking.length + 1,
          });
        }
      }

      return roundCumulativeRanking;
    }, [] as RoundScore['cumulativeRanking']);
}
