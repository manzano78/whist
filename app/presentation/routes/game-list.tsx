import type { Info, Route } from './+types/game-list';
import { getApp } from '~/presentation/infrastructure/app';
import { Form, Link, redirect, useNavigation, useSearchParams, useSubmit } from 'react-router';
import { DataGrid, type GridColDef, type GridPaginationModel, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Box, FormControl, FormControlLabel, FormLabel, Paper, Radio, RadioGroup } from '@mui/material';
import { type ChangeEventHandler, Suspense, use, useRef, useState } from 'react';
import type { GameListItem } from '~/domain/entities/game-list-item';
import { getGameGlobalProperties } from '~/domain/entities/game';
import { LoadingButton } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import LaunchIcon from '@mui/icons-material/Launch';

const DEFAULT_PAGE = 1;
const SIZE_OPTIONS = [10, 20, 30] as const;
const DEFAULT_SIZE: typeof SIZE_OPTIONS[number] = 20;
const DEFAULT_STATUS = 'all';

export const handle: RouteHandle = {
  navigationConfig: {
    title: 'Mes parties',
    hasNewGameLink: true,
  },
};

export async function loader({ request, context }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const { gameRepository, getCurrentAppUser } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);

  const page = Number(searchParams.get('page') ?? DEFAULT_PAGE);
  const size = Number(searchParams.get('size') ?? DEFAULT_SIZE);
  const status = searchParams.get('status') as 'terminated' | 'not-terminated' | 'all' | null ?? DEFAULT_STATUS;

  let isTerminated: boolean | undefined;

  switch (status) {
    case 'terminated':
      isTerminated = true;
      break;
    case 'not-terminated':
      isTerminated = false;
      break;
    default:
      break;
  }

  return {
    pagedList: gameRepository.getGames(currentAppUser.id, page, size, isTerminated),
    status,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { gameRepository, getCurrentAppUser } = getApp(context);
  const currentAppUser = await getCurrentAppUser(request);
  const formData = await request.formData();
  const ids = formData.getAll('id') as string[];

  await gameRepository.deleteGames(currentAppUser.id, ids);

  return redirect('/games');
}

export default function GameListRoute({ loaderData}: Route.ComponentProps) {
  const { status, pagedList } = loaderData;
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  let optimisticStatus: typeof status | undefined;

  if (navigation.state === 'loading' && navigation.location.pathname === '/games' && navigation.formData?.has('status')) {
    optimisticStatus = navigation.formData.get('status') as typeof status;
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchParams((currentSearchParams) => {
      currentSearchParams.set('status', e.currentTarget.value);

      return currentSearchParams;
    }, {
      replace: true,
    });
  };

  return (
    <Box padding={2} height="100%" display="flex" flexDirection="column">
      <Box>
        <FormControl>
          <FormLabel >Statut des parties :</FormLabel>
          <RadioGroup
            row
            name="status"
            value={optimisticStatus ?? status}
            onChange={handleChange}
          >
            <FormControlLabel value="not-terminated" control={<Radio />} label="En cours" />
            <FormControlLabel value="terminated" control={<Radio />} label="Terminé" />
            <FormControlLabel value="all" control={<Radio />} label="Toutes" />
          </RadioGroup>
        </FormControl>
      </Box>
      <Suspense>
        <Test pagedList={pagedList} />
      </Suspense>
    </Box>
  );
}

const columns: GridColDef<GameListItem>[] = [
  {
    field: 'creationDate',
    headerName: 'Date',
    width: 160,
    valueGetter: (_, { creationDate }) => Intl.DateTimeFormat('fr', { dateStyle: 'medium', timeStyle: 'short'}).format(creationDate)
  },
  {
    field: 'status',
    headerName: 'Statut',
    width: 160,
    valueGetter: (_, { isTerminated, totalPassedRounds, playersInOrder }) => {
      if (isTerminated) {
        return 'Terminé'
      }

      const { totalRounds } = getGameGlobalProperties(playersInOrder.length);
      const currentRoundIndex = totalPassedRounds + 1;

      return `En cours (${currentRoundIndex} / ${totalRounds})`
    }
  },
  {
    field: 'playersInOrder',
    headerName: 'Joueurs',
    width: 400,
    valueGetter: (_, { playersInOrder }) => playersInOrder.join(', ')
  },
  {
    field: 'isTerminated',
    headerName: 'Actions',
    width: 160,
    align: 'center',
    renderCell: ({ id, value: isTerminated  }) => {
      const navigation = useNavigation();
      const pathname = `/games/${id}/${isTerminated ? 'scores' : 'play'}`;
      const isNavigating = navigation.state === 'loading' && navigation.location.pathname === pathname;

      return (
        <LoadingButton
          component={Link}
          color={isTerminated ? 'info' : 'success'}
          to={pathname}
          loading={isNavigating}
          loadingPosition="start"
          startIcon={isTerminated ? <SportsScoreIcon /> : <LaunchIcon />}
          variant="contained"
        >
          {isTerminated ? 'Résultats' : 'Reprendre'}
        </LoadingButton>
      )
    }
  }
];

function Test({ pagedList }: { pagedList: Info['loaderData']['pagedList']}) {
  const {
    list,
    page,
    size,
    totalElements,
  } = use(pagedList);
  const [, setSearchParams] = useSearchParams();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const navigation = useNavigation();
  const handlePaginationChange = ({ page, pageSize }: GridPaginationModel) => {
    setSearchParams((currentSearchParams) => {
      currentSearchParams.set('page', String(page + 1));
      currentSearchParams.set('size', String(pageSize));

      return currentSearchParams;
    }, {
      replace: true,
    });
  };
  const isLoadingList = navigation.state === 'loading' && navigation.location.pathname === '/games';
  const isDeleting = navigation.state === 'submitting' && navigation.location.pathname === '/games';

  const handleSelectionChange = (gridRowSelectionModel: GridRowSelectionModel) => {
    setSelectedItems(gridRowSelectionModel as string[]);
  };

  return (
    <>
      <Box marginTop={2} marginBottom={1}>
        <Form method="post" action="/games">
          {selectedItems.map((id) => (
            <input
              key={id}
              type="hidden"
              name="id"
              value={id}
            />
          ))}
          <LoadingButton
            variant="contained"
            disabled={selectedItems.length === 0 || isLoadingList}
            type="submit"
            color="error"
            startIcon={<DeleteIcon/>}
            loadingPosition="start"
            loading={isDeleting}
          >
            Supprimer{selectedItems.length !== 0 && ` (${selectedItems.length})`}
          </LoadingButton>
        </Form>
      </Box>
      <Paper sx={{ flex: 1 }}>
        <DataGrid
          rows={list}
          columns={columns}
          rowCount={totalElements}
          loading={isLoadingList}
          initialState={{ pagination: { paginationModel: { page: page - 1, pageSize: size } }}}
          pageSizeOptions={SIZE_OPTIONS}
          onPaginationModelChange={handlePaginationChange}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnSorting
          disableColumnSelector
          disableDensitySelector
          disableColumnMenu
          onRowSelectionModelChange={handleSelectionChange}
          checkboxSelection
          paginationMode="server"
          localeText={{
            noRowsLabel: 'Aucune partie trouvée',
            // footerTotalRows: 'hey',
            footerRowSelected: (count) => `${count} élément${count > 1 ? 's' : ''} séléctionné${count > 1 ? 's' : ''}`
          }}
          sx={{ border: 0 }}
        />
      </Paper>
    </>
  )
}