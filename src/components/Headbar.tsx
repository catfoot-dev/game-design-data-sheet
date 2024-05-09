import clsx from 'clsx';
import { SheetDataType } from '../types';
import { ArrowRight03Icon, CheckListIcon, Folder02Icon, GitCompareIcon, GridTableIcon, Notification01Icon, Search02Icon, Settings05Icon } from 'hugeicons-react';
import Button from '@material-tailwind/react/components/Button';
import Typography from '@material-tailwind/react/components/Typography';
import Badge from '@material-tailwind/react/components/Badge';
import IconButton from '@material-tailwind/react/components/IconButton';
import TextInput from './TextInput';
import { ChangeEvent, useState } from 'react';

export default function Headbar({
  isFold,
  sheetList,
  seledtedSheet,
  onGotoHome,
  onChangeFold,
  onLogbarToggle,
  onOpenFileSelector,
  onOpenSheetDiffer,
  onOpenSheetVerifier,
  onOpenSetting,
}: {
  isFold: boolean;
  sheetList: SheetDataType[];
  seledtedSheet: string;
  onGotoHome: () => void;
  onChangeFold: (isFold: boolean) => void;
  onLogbarToggle: () => void;
  onOpenFileSelector: () => void;
  onOpenSheetDiffer: () => void;
  onOpenSheetVerifier: () => void;
  onOpenSetting: () => void;
}) {
  const [query, setQuery] = useState('');
  const currentSheet = sheetList.find((item) => item.sheetname === seledtedSheet);

  function onQueryChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.currentTarget.value);
  }

  return (
    <div className={clsx('fixed flex justify-between gap-1 p-2 h-12 w-full border-b-[1px] ' +
      'border-gray-300 bg-gray-100 text-gray-800 z-50 transition-all duration-150 ease-out', {
        'lg:w-[calc(100%-13rem)]': !isFold,
      },
    )}>
      <div className="flex gap-2">
        <div
          className={clsx('flex mr-1 lg:mr-0 p-1 pr-0 cursor-pointer', {
            'lg:hidden': !isFold,
          })}
          onClick={onGotoHome}
        >
          <GridTableIcon
            className="p-[3px] rounded-2xl border-[1px] border-gray-400 bg-white text-gray-600 drop-shadow-md"
            size="24"
          />
        </div>
        {isFold ? (
          <IconButton
            variant="text"
            className={clsx('hidden rounded-full', {
              'lg:flex': isFold,
            })}
            color="gray"
            size="sm"
            onClick={() => onChangeFold(false)}
          >
            <ArrowRight03Icon size="16" />
          </IconButton>
        ) : null}
        <Button
          variant="outlined"
          className="flex flex-row gap-2 justify-center items-center px-2 rounded-md"
          color="gray"
          size="sm"
          onClick={() => onOpenFileSelector()}
        >
          <Folder02Icon size="16" />
          <div className="hidden text-nowrap lg:flex">시트 불러오기</div>
        </Button>
        <Button
          variant="outlined"
          className="flex flex-row gap-2 justify-center items-center px-2 rounded-md"
          color="gray"
          size="sm"
          disabled={sheetList.length === 0}
          onClick={() => onOpenSheetDiffer()}
        >
          <GitCompareIcon size="16" />
          <div className="hidden text-nowrap lg:flex">비교하기</div>
        </Button>
        <Button
          variant="outlined"
          className="flex flex-row gap-2 justify-center items-center px-2 rounded-md"
          color="gray"
          size="sm"
          disabled={sheetList.length === 0}
          onClick={() => onOpenSheetVerifier()}
        >
          <CheckListIcon size="16" />
          <div className="hidden text-nowrap lg:flex">검증하기</div>
        </Button>
        {currentSheet ? (
          <div className="flex flex-row items-center gap-1 mx-1">
            <Typography variant="h6" className="text-sm">
              {currentSheet.sheetname}
            </Typography>
          </div>
        ) : null}
      </div>
      <div className="flex" />
      <div className="flex flex-row gap-1 items-center">
        <div className="hidden md:flex mr-1">
          <TextInput
            size="md"
            icon={<Search02Icon />}
            placeholder="Find"
            value={query}
            onChange={onQueryChange}
            className="bg-white"
          />
        </div>
        <div className="flex md:hidden">
          <IconButton
            variant="text"
            color="gray"
            size="sm"
            className="rounded-full"
            onClick={onLogbarToggle}
          >
            <Search02Icon size="24" />
          </IconButton>
        </div>
        <div className="flex">
          <IconButton
            variant="text"
            color="gray"
            size="sm"
            className="rounded-full"
            onClick={onLogbarToggle}
          >
            <Badge
              overlap="square"
              placement="top-end"
              className="top-[20%] right-[20%] min-w-[5px] min-h-[5px]"
            >
              <Notification01Icon size="24" />
            </Badge>
          </IconButton>
        </div>
        <div className="flex">
          <IconButton
            variant="text"
            color="gray"
            size="sm"
            className="rounded-full"
            onClick={onOpenSetting}
          >
            <Settings05Icon size="24" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
