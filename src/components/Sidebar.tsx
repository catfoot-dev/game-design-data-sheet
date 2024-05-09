import clsx from 'clsx';
import { SheetDataType } from '../types';
import { ArrowLeft03Icon, GridTableIcon, SearchList01Icon } from 'hugeicons-react';
import Button from '@material-tailwind/react/components/Button';
import { useState } from 'react';
import IconButton from '@material-tailwind/react/components/IconButton';
import Tooltip from '@material-tailwind/react/components/Tooltip';
import Typography from '@material-tailwind/react/components/Typography';
import dayjs from 'dayjs';
import TextInput from './TextInput';

export default function Sidebar({
  isFold,
  sheetList,
  seledtedSheet,
  onGotoHome,
  onChangeFold,
  onChangeSheet,
}: {
  isFold: boolean;
  sheetList: SheetDataType[];
  seledtedSheet: string;
  onGotoHome: () => void;
  onChangeFold: (isFold: boolean) => void;
  onChangeSheet: (sheet: string) => void;
}) {
  const [filter, setFilter] = useState('');
  
  return (
    <div className={clsx(
      'fixed flex h-full overflow-hidden border-gray-300 w-0 border-0 bg-gray-100 text-gray-800 z-50 transition-all duration-150 ease-out', {
        'lg:w-52 lg:border-r-[1px]': !isFold,
      })}
    >
      <div className="flex flex-col w-52">
        <div className="flex flex-row gap-2 items-center mt-1 p-3 pr-1 w-full h-10">
          <div
            className="flex w-full gap-2 text-nowrap cursor-pointer"
            onClick={onGotoHome}
          >
            <GridTableIcon
              className="p-[3px] rounded-2xl border-[1px] border-gray-400 bg-white text-gray-600 drop-shadow-md"
              size="24"
            />
            GaDeDaSh
          </div>
          <div className="flex">
            <IconButton
              variant="text"
              className="rounded-full"
              color="gray"
              size="sm"
              onClick={() => onChangeFold(true)}
            >
              <ArrowLeft03Icon size="16" />
            </IconButton>
          </div>
        </div>

        <div className="flex flex-col mt-2 px-1 w-full">
          <TextInput
            size="sm"
            icon={<SearchList01Icon size="20" />}
            placeholder="Filter"
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
            className="bg-white"
          />
        </div>

        <div className="flex flex-col justify-between w-full h-full overflow-y-hidden overflow-y-scroll">
          <div className="flex flex-col p-1 w-full">
            {sheetList.filter((item) => (
              filter ? item.sheetname.toLowerCase().includes(filter.toLowerCase()) : true
            )).sort((a, b) => {
              if (a.filename > b.filename) return 1;
              if (a.filename < b.filename) return -1;
              if (a.sheetname > b.sheetname) return 1;
              if (a.sheetname < b.sheetname) return -1;
              return 0;
            }).map((item, i) => (
              <Button
                fullWidth
                key={`navitem-${i}`}
                variant="text"
                size="sm"
                color="gray"
                className={clsx('flex justify-start items-center gap-1 px-1 py-0.5 border-[1px] rounded-sm', {
                  'border-gray-300 bg-blue-gray-200 hover:bg-gray-300': item.sheetname === seledtedSheet,
                  'border-transparent bg-inherit': item.sheetname !== seledtedSheet,
                })}
                onClick={() => onChangeSheet(item.sheetname)}
              >
                <Tooltip
                  placement="right"
                  className="z-[99999]"
                  content={
                    <div className="flex flex-col">
                      <div className="flex flex-row gap-1">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-bold"
                        >
                          Sheet:
                        </Typography>
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal opacity-80"
                        >
                          {item.sheetname}
                        </Typography>
                      </div>
                      <div className="flex flex-row gap-1">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-bold"
                        >
                          File:
                        </Typography>
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal opacity-80"
                        >
                          {item.filename}
                        </Typography>
                      </div>
                      <div className="flex flex-row gap-1">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-bold"
                        >
                          MD5:
                        </Typography>
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal opacity-80"
                        >
                          {item.md5}
                        </Typography>
                      </div>
                      <div className="flex flex-row gap-1">
                        <Typography
                          variant="small"
                          color="white"
                          className="font-bold"
                        >
                          Modified:
                        </Typography>
                        <Typography
                          variant="small"
                          color="white"
                          className="font-normal opacity-80"
                        >
                          {dayjs(item.modifiedDate).format('YYYY-MM-DD HH:mm:ss')}
                        </Typography>
                      </div>
                    </div>
                  }
                >
                  <span className="flex mt-0.5 w-full normal-case">{item.sheetname}</span>
                </Tooltip>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
