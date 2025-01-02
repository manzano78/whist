import type { AppUser } from '~/domain/entities/app-user';
import type { RoundInfo } from '~/domain/entities/round-info';
import type { RoundResult } from '~/domain/entities/round-result';
import type { Round } from '~/domain/entities/round';
import type { RoundScore } from '~/domain/entities/round-score';
import { createTerminatedGameError } from '~/domain/entities/errors/terminated-game';
import { createIdReassignError } from '~/domain/entities/errors/id-reassign-error';
import { createMinPlayersError } from '~/domain/entities/errors/min-players-error';
import { createPlayerDuplicatesError } from '~/domain/entities/errors/duplicate-players-error';
import type { Ranking } from '~/domain/entities/ranking';

const MAX_CARDS = 52;
const BASE_WIN_POINTS = 20;
const BASE_LOOSE_POINTS = -20;
const WIN_ITEM_POINTS = 10;
const LOOSE_ITEM_POINTS = 10;

export class Game {
  public readonly totalRounds: number;
  public readonly roundInfos: RoundInfo[];

  constructor(
    private id: string | null,
    public readonly owner: Readonly<AppUser>,
    public readonly creationDate: Date,
    public readonly playersInOrder: string[],
    public readonly roundResults: RoundResult[],
  ) {
    const { length: totalPlayers } = playersInOrder;

    if (totalPlayers === 0) {
      throw createMinPlayersError();
    }

    ensureNoGamePlayerDuplicates(playersInOrder);

    const trumpTotalCards = MAX_CARDS % totalPlayers === 0
      ? Math.floor(MAX_CARDS / totalPlayers) - 1
      : Math.floor(MAX_CARDS / totalPlayers);
    const noTrumpMaxTotalCards = MAX_CARDS % totalPlayers === 0 ? trumpTotalCards + 1 : trumpTotalCards;
    const noTrumpTotalRounds: 1 | 2 = ((trumpTotalCards * 2) + 1) % totalPlayers === 1 ? 2 : 1;
    this.totalRounds = (trumpTotalCards * 2) + noTrumpTotalRounds;
    this.roundInfos = [];
    this.fillRoundInfos(trumpTotalCards, noTrumpMaxTotalCards, noTrumpTotalRounds);
  }

  static createNew(owner: AppUser, playersInOrder: string[]): Game {
    return new Game(
      null,
      owner,
      new Date(),
      playersInOrder,
      []
    );
  }

  getId(): string | null {
    return this.id;
  }

  setId(id: string) {
    if (this.id !== null) {
      throw createIdReassignError();
    }

    this.id = id;
  }

  getRanking(): Ranking {
    const roundScores = this.getRoundScores();

    if (roundScores.length !== 0) {
      return roundScores[roundScores.length - 1].cumulativeRanking;
    }

    return this.playersInOrder.map((player, i) => ({
      player,
      index: 1,
      isExAequoWithPrevious: i !== 0,
      cumulativePoints: 0,
    }));
  }

  getRoundScores(): RoundScore[] {
    return this.roundResults.reduce((roundScores, roundResult) => {
      const previousRoundScoreResults: RoundScore['results'] = roundScores.length !== 0
        ? roundScores[roundScores.length - 1].results
        : this.createInitialRoundScoreResults();
      const results = this.createRoundScoreResults(
        roundResult,
        previousRoundScoreResults
      );
      const cumulativeRanking = Game.createRoundCumulativeRanking(results);

      roundScores.push({ cumulativeRanking, results });

      return roundScores;
    }, [] as RoundScore[]);
  }

  isTerminated(): boolean {
    return this.roundResults.length === this.totalRounds;
  }

  getNextRoundInfo(): RoundInfo | null {
    return this.isTerminated() ? null : this.roundInfos[this.roundResults.length];
  }

  pushRoundResult(roundResult: RoundResult): void {
    if (this.isTerminated()) {
      throw createTerminatedGameError();
    }

    this.roundResults.push(roundResult);
  }

  private createInitialRoundScoreResults(): RoundScore['results'] {
    return this.playersInOrder.reduce((acc, player) => {
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

  private createRoundScoreResults(
    roundResult: RoundResult,
    previousRoundScoreResults: RoundScore['results'],
  ): RoundScore['results'] {
    return this.playersInOrder.reduce((acc, player) => {
      const previousRoundPlayerScoreResults = previousRoundScoreResults[player];
      const playerRoundResult = roundResult[player];
      const playerRoundPoints = Game.getPlayerRoundPoints(playerRoundResult);
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

  private static getPlayerRoundPoints({ call, result }: RoundResult[string]): number {
    const delta = Math.abs(result - call);

    return delta === 0 ? BASE_WIN_POINTS + (call * WIN_ITEM_POINTS) : BASE_LOOSE_POINTS - ((delta - 1) * LOOSE_ITEM_POINTS);
  }

  private static createRoundCumulativeRanking(roundScoreResults: RoundScore['results']): RoundScore['cumulativeRanking'] {
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

  private fillRoundInfos(
    trumpTotalCards: number,
    noTrumpMaxTotalCards: number,
    noTrumpTotalRounds: 1 | 2,
  ): void {
    const nextRoundInfo = this.computeNextRoundInfo(trumpTotalCards, noTrumpMaxTotalCards, noTrumpTotalRounds);

    if (nextRoundInfo) {
      this.roundInfos.push(nextRoundInfo);
      this.fillRoundInfos(trumpTotalCards, noTrumpMaxTotalCards, noTrumpTotalRounds);
    }
  }

  private computeNextRoundInfo(
    trumpTotalCards: number,
    noTrumpMaxTotalCards: number,
    noTrumpTotalRounds: 1 | 2,
  ): RoundInfo | null{
    const { length: totalPassedRounds} = this.roundInfos;
    const { totalRounds, playersInOrder } = this;

    if (totalRounds === totalPassedRounds) {
      return null;
    }

    let direction: Round['direction'];
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
}

function getGamePlayerDuplicates(gamePlayers: string[]): string[] {
  const definedPlayers = new Set<string>();
  const duplicates: string[] = [];

  for (const player of gamePlayers) {
    if (definedPlayers.has(player)) {
      duplicates.push(player);
    } else {
      definedPlayers.add(player);
    }
  }

  return duplicates;
}

export function ensureNoGamePlayerDuplicates(gamePlayers: string[]): void {
  const gamePlayerDuplicates = getGamePlayerDuplicates(gamePlayers);

  if (gamePlayerDuplicates.length !== 0) {
    throw createPlayerDuplicatesError(gamePlayerDuplicates);
  }
}
