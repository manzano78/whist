export function stringifyDuplicatedPlayersMessage(duplicatedPlayers: string[]): string {
  const stringifyDuplicatedPlayers  = duplicatedPlayers.reduce((glob, duplicatedPlayer, i) => {
    if (i === 0) {
      return `${glob}${duplicatedPlayer}`;
    }

    if (i === duplicatedPlayers.length - 1) {
      return `${glob} et ${duplicatedPlayer}`;
    }

    return `${glob}, ${duplicatedPlayer}`;
  }, '');

  return `${stringifyDuplicatedPlayers} ${duplicatedPlayers.length === 1 ? 'a été défini(e)' : 'ont été défini(e)s'} plusieurs fois`
}
