import Button from '@material-tailwind/react/components/Button';
import Card, { CardBody, CardFooter, CardHeader } from '@material-tailwind/react/components/Card';
import Dialog from '@material-tailwind/react/components/Dialog';
import Typography from '@material-tailwind/react/components/Typography';
import { CancelCircleIcon, CheckmarkSquare02Icon, Delete02Icon, FileAddIcon, FilePasteIcon, FolderAddIcon, RemoveSquareIcon } from 'hugeicons-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Table from '../components/Table';
import Checkbox from '@material-tailwind/react/components/Checkbox';
import AlertBox from '../components/AlertBox';
import { AlertMessageType, FileItemType, LoadedFilesType, SheetDataType, SheetListItemType } from '../types';
import Spinner from '@material-tailwind/react/components/Spinner';
import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
import { IconButton } from '@material-tailwind/react';
import { useDropzone } from 'react-dropzone';

const FILE_ACCEPTS = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv';
const FILE_ACCEPTS_ARRARY = FILE_ACCEPTS.split(',');
const SHEET_NAME_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

export default function FileSelectorDlg({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: (sheetList?: SheetDataType[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [alertMessages, setAlertMessages] = useState<AlertMessageType[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [loadedFiles, setLoadedFiles] = useState<LoadedFilesType>({});
  const [sheets, setSheets] = useState<SheetListItemType[]>([]);
  const [selectList, setSelectList] = useState<{ [key: string]: boolean }>({});
  const [workbooks, setWorkbooks] = useState<{ [filename: string]: any }>({});
  const {getRootProps, getInputProps} = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDragEnter: () => setDragging(true),
    onDragLeave: () => setDragging(false),
    onDrop: (files: File[]) => {
      setDragging(false);
      fileProcess(files);
    },
  });

  useEffect(() => {
    const worker = new Worker(`${process.env.PUBLIC_URL}/js/worker.js`);

    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case 'readDone': {
          setLoadedFiles((prev) => {
            const item = prev[data.md5];
            if (item) {
              item.isLoading = false;
              item.sheetCount = data.workbook.SheetNames.length;
            }
            return {...prev};
          });
          setSheets((prev) => {
            const idx = prev.findIndex((item) => item.md5 === data.md5);
            if (idx === -1) {
              prev.push(
                ...data.workbook.SheetNames.map((sheetname: string) => ({
                  filename: data.filename,
                  sheetname,
                  md5: data.md5
                })),
              );
            }
            return [...prev];
          });
          setSelectList((prev) => {
            for (const sheetname of data.workbook.SheetNames) {
              const curKey = `${data.filename}#${data.md5}#${sheetname}`;
              if (!prev[curKey]) {
                prev[curKey] = false;
              }
            }
            return {...prev};
          });
          setWorkbooks((prev) => {
            prev[`${data.filename}#${data.md5}`] = {
              filename: data.filename,
              md5: data.md5,
              sheets: data.workbook.Sheets,
            };
            return {...prev};
          });
          break;
        }
        default:
          break;
      }
    };

    setAlertMessages([]);
    setWorker(worker);

    return () => {
      worker.terminate();
    };
  }, []);

  async function fileProcess(files: FileList | File[]) {
    for (let i = 0, len = files.length; i < len; i++) {
      const file: File = files[i];
      const filename = file.webkitRelativePath || file.name;
      const arrayBuffer = await file.arrayBuffer();
      const text = await file.text();
      const md5 = CryptoJS.MD5(text).toString(CryptoJS.enc.Hex);

      if (!FILE_ACCEPTS_ARRARY.includes(file.type)) {
        continue;
      }
      if (loadedFiles[md5]?.isLoading) {
        setAlertMessages((prev) => [
          ...prev,
          {
            type: 'warning',
            message: `"${filename}"는 같은 파일이 이미 리스트에 존재해서 무시됩니다. (MD5: ${md5})`
          },
        ]);
        continue;
      }

      const loadedFile = {
        isLoading: true,
        filename,
        md5,
        sheetCount: 0,
        modifiedDate: new Date(file.lastModified),
      };

      setLoadedFiles((prev) => ({ ...prev, [md5]: loadedFile }));
      worker?.postMessage({ type: 'file', filename, arrayBuffer, md5 });
    }
  }

  async function selectFile(e: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    await fileProcess(selectedFiles);

    e.target.value = '';
  }

  function selectSheetFromFile(filename: string, isChecked: boolean) {
    setSelectList((prev) => {
      let duplicatedCnt = 0;
      for (const key in prev) {
        const [keyFilename, md5, sheetname] = key.split('#');
        if (!SHEET_NAME_REGEX.test(sheetname)) {
          continue;
        }
        if (keyFilename === filename) {
          if (isChecked) {
            const duplicatedKey = Object.keys(prev)
              .find((key) => prev[key] && key.endsWith(`#${sheetname}`) && !key.includes(`#${md5}#`));
            if (duplicatedKey) {
              duplicatedCnt++;
              continue;
            }
          }
          prev[key] = isChecked;
        }
      }
      if (duplicatedCnt) {
        setAlertMessages((prev) => [
          ...prev,
          {
            type: 'warning',
            message: `"${filename}" 파일에서 중복된 시트가 ${duplicatedCnt}개 있습니다. 중복된 시트는 선택에서 제외됩니다.`,
          },
        ]);
      }
      return {...prev};
    });
  }

  function selectSheet(item: SheetListItemType, isChecked: boolean) {
    if (!SHEET_NAME_REGEX.test(item.sheetname)) {
      return;
    }
    const curKey = `${item.filename}#${item.md5}#${item.sheetname}`;
    const duplicatedKey = Object.keys(selectList)
      .find((key) => key.split('#')[2] === item.sheetname && selectList[key]);
    if (duplicatedKey && duplicatedKey !== curKey) {
      setAlertMessages((prev) => [
        ...prev,
        {
          type: 'warning',
          message: `이미 "${duplicatedKey.split('#')[0]}" 파일에서 중복된 시트가 선택되었습니다.`,
        },
      ]);
      return;
    }
    setSelectList((prev) => {
      prev[curKey] = isChecked;
      return {...prev};
    });
  }

  function clear() {
    setAlertMessages([]);
    setLoadedFiles({});
    setSheets([]);
    setSelectList({});
    setWorkbooks({});
  }

  function remove(md5: string) {
    setLoadedFiles((prev) => {
      if (prev[md5]) {
        delete prev[md5];
      }
      return {...prev};
    });
    setSheets((prev) => {
      for (let i = prev.length; i--;) {
        if (prev[i].md5 === md5) {
          prev.splice(i, 1);
        }
      }
      return [...prev];
    });
    setSelectList((prev) => {
      for (const key in selectList) {
        if (key.indexOf(`#${md5}#`) !== -1) {
          delete selectList[key];
        }
      }
      return {...prev};
    });
    setWorkbooks((prev) => {
      for (const key in prev) {
        if (key.indexOf(`#${md5}#`) !== -1) {
          delete prev[key];
        }
      }
      return {...prev};
    });
  }

  function done() {
    const result: SheetDataType[] = [];
    for (const key in selectList) {
      if (!selectList[key]) continue;
      const [filename, md5, sheetname] = key.split('#');
      const wb = workbooks[`${filename}#${md5}`];
      const sheet = wb.sheets[sheetname];
      result.push({
        filename,
        md5,
        sheetname,
        sheet,
        modifiedDate: loadedFiles[md5].modifiedDate,
      });
    }
    onClose(result);
  }

  return (
    <Dialog
      className="bg-transparent shadow-none"
      dismiss={{ enabled: false }}
      open={isOpen}
      handler={() => onClose()}
    >
      <AlertBox
        items={alertMessages}
        onDismiss={(no) => {
          setAlertMessages((prev) => {
            prev.splice(no, 1);
            return [...prev];
          });
        }}
      />
      <Card {...getRootProps({className: 'mx-auto w-full max-w-[40rem] rounded-md'})}>
        <input {...getInputProps()} />
        <CardHeader
          floated={false}
          shadow={false}
          className="mx-2 mt-0 mb-1 p-1 rounded-none"
        >
          <Typography variant="h6" color="blue-gray" className="mb-2">
            시트 불러오기
          </Typography>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-2">
              <Button
                variant="outlined"
                size="sm"
                className="flex flex-row gap-2 justify-center items-center px-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileAddIcon size="16" />
                <div className="hidden md:flex">파일 선택</div>
                <input
                  multiple
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={FILE_ACCEPTS}
                  onChange={(e) => selectFile(e)}
                />
              </Button>
              <Button
                variant="outlined"
                size="sm"
                className="flex flex-row gap-2 justify-center items-center px-2"
                onClick={() => folderInputRef.current?.click()}
              >
                <FolderAddIcon size="16" />
                <div className="hidden md:flex">폴더 선택</div>
                <input
                  multiple
                  webkitdirectory=""
                  directory=""
                  ref={folderInputRef}
                  type="file"
                  className="hidden"
                  accept={FILE_ACCEPTS}
                  onChange={(e) => selectFile(e)}
                />
              </Button>
            </div>
            <div className="flex flex-row gap-2">
              <Button
                variant="outlined"
                size="sm"
                className="flex flex-row gap-2 justify-center items-center px-2"
                disabled={
                  Object.keys(loadedFiles).length === 0 ||
                  Object.keys(loadedFiles).find((md5) => loadedFiles[md5].isLoading) !== undefined
                }
                onClick={() => {
                  const keys = Object.keys(selectList);
                  if (keys.find((key) => selectList[key])) {
                    setSelectList((prev) => {
                      keys.forEach((key) => { prev[key] = false; });
                      return {...prev};
                    });
                  } else {
                    setSelectList((prev) => {
                      let duplicatedCnt = 0;
                      for (const curKey in prev) {
                        const sheetname = curKey.split('#')[2];
                        if (!SHEET_NAME_REGEX.test(sheetname)){
                          continue;
                        }
                        const duplicatedKey = Object.keys(prev).find((key) => key.split('#')[2] === sheetname && prev[key]);
                        if (duplicatedKey && duplicatedKey !== curKey) {
                          duplicatedCnt++;
                          prev[curKey] = false;
                        } else {
                          prev[curKey] = true;
                        }
                      }
                      if (duplicatedCnt) {
                        setAlertMessages((prev) => [
                          ...prev,
                          {
                            type: 'warning',
                            message: `중복된 시트가 ${duplicatedCnt}개 있습니다. 중복된 시트는 선택에서 제외됩니다.`,
                          },
                        ]);
                      }
                      return {...prev};
                    });
                  }
                }}
              >
                {Object.keys(selectList).find((key) => selectList[key]) ? (
                  <>
                    <RemoveSquareIcon size="16" />
                    <div className="hidden md:flex">전체 해제</div>
                  </>
                ) : (
                  <>
                    <CheckmarkSquare02Icon size="16" />
                    <div className="hidden md:flex">전체 선택</div>
                  </>
                )}
              </Button>
              <Button
                variant="outlined"
                size="sm"
                className="flex flex-row gap-2 justify-center items-center px-2"
                disabled={
                  Object.keys(loadedFiles).length === 0 ||
                  Object.keys(loadedFiles).find((md5) => loadedFiles[md5].isLoading) !== undefined
                }
                onClick={clear}
              >
                <Delete02Icon color="red" size="16" />
                <div className="hidden md:flex">모두 삭제</div>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col p-0">
          <Typography variant="small" className="ml-2 font-bold">
            불러온 파일
            {Object.keys(loadedFiles).length ? ` (${Object.keys(loadedFiles).length})` : ''}
          </Typography>
          <div className="flex flex-col mb-1 h-40 border-b border-gray-300 overflow-y-auto">
            <Table
              items={Object.values(loadedFiles)}
              columns={[
                {
                  key: 'filename',
                  name: `파일 이름${((count) => (
                    count ? ` (불러오는 중: ${count})` : ''
                  ))(Object.keys(loadedFiles).filter((md5) => loadedFiles[md5].isLoading).length)}`,
                  render: (item: FileItemType) => (
                    <div className="flex flex-row items-center">
                      <Checkbox
                        crossOrigin=""
                        className="flex m-0 p-0 items-center"
                        label={item.filename}
                        ripple={false}
                        containerProps={{
                          className: 'p-0 mr-1',
                        }}
                        checked={Object.keys(selectList)
                          .filter((key) => key.startsWith(`${item.filename}#`))
                          .find((key) => selectList[key]) !== undefined}
                        disabled={loadedFiles[item.md5]?.isLoading}
                        onChange={(e) => selectSheetFromFile(item.filename, e.currentTarget?.checked ?? false)}
                      />
                      {!loadedFiles[item.md5]?.isLoading && (
                        <IconButton
                          variant="text"
                          color="red"
                          className="-mx-1 -my-[10px] rounded-full"
                          onClick={() => remove(item.md5)}
                        >
                          <CancelCircleIcon size="16" />
                        </IconButton>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'sheetCount',
                  name: '선택 시트 수',
                  align: 'center',
                  render: (item: FileItemType) => (
                    item.isLoading ? (
                      <Spinner className="mx-auto h-4 w-4" />
                    ) : (
                      <>{Object.keys(selectList)
                        .filter((key) => key.startsWith(`${item.filename}#`) && selectList[key])
                        .length}/{item.sheetCount}</>
                    )
                  ),
                },
                {
                  key: 'modifiedDate',
                  name: '수정일',
                  align: 'center',
                  render: (item: FileItemType) => (
                    <>{item.modifiedDate ? dayjs(item.modifiedDate).format('YYYY-MM-DD HH:mm:ss') : ''}</>
                  ),
                },
              ]}
            />
          </div>
          <Typography variant="small" className="ml-2 font-bold">
            파일에 속한 시트
            {sheets.length ? ` (${sheets.length})` : ''}
          </Typography>
          <div className="flex flex-col h-60 border-b border-gray-300 overflow-y-auto">
            <Table
              items={sheets}
              columns={[
                {
                  key: 'filename',
                  name: '파일 이름',
                },
                {
                  key: 'sheetname',
                  name: '시트 이름',
                  render: (item: SheetListItemType) => (
                    <div className="flex flex-row">
                      <Checkbox
                        crossOrigin=""
                        className="flex m-0 p-0 items-center"
                        label={item.sheetname}
                        ripple={false}
                        containerProps={{
                          className: 'p-0 mr-1',
                        }}
                        disabled={!SHEET_NAME_REGEX.test(item.sheetname)}
                        checked={selectList[`${item.filename}#${item.md5}#${item.sheetname}`]}
                        onChange={(e) => selectSheet(item, e.currentTarget?.checked ?? false)}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </CardBody>
        <CardFooter className="flex items-center justify-end border-t border-blue-gray-50 px-4 py-2">
          <div className="flex gap-2">
            <Button
              variant="text"
              size="sm"
              color="pink"
              className="px-6"
              onClick={() => onClose()}
            >
              취소
            </Button>
            <Button
              variant="gradient"
              size="sm"
              className="px-6"
              disabled={
                Object.keys(loadedFiles).length === 0 ||
                Object.keys(loadedFiles).find((md5) => loadedFiles[md5].isLoading) !== undefined ||
                !Object.keys(selectList).find((key) => selectList[key])
              }
              onClick={done}
            >
              확인
            </Button>
          </div>
        </CardFooter>
        {isDragging && (
          <div
            className="absolute flex flex-col gap-5 justify-center items-center
              w-full h-full rounded-md bg-gray-500/80 z-50 pointer-events-none"
          >
            <FilePasteIcon size="64" color="white" />
            <Typography variant="h5" color="white">
              파일을 이 곳에 끌어다 놓으세요
            </Typography>
          </div>
        )}
      </Card>
    </Dialog>
  );
}
