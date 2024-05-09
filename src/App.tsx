import { useState } from 'react';

import Headbar from './components/Headbar';
import Sidebar from './components/Sidebar';
import clsx from 'clsx';
import Logbar from './components/Logbar';
import Sheet from './pages/Sheet';
import { SheetDataType } from './types';
import FileSelectorDlg from './dialogs/FileSelector';
import SheetDifferDlg from './dialogs/SheetDiffer';
import SheetVerifierDlg from './dialogs/SheetVerifier';
import SettingDlg from './dialogs/Setting';
import Doc from './pages/Doc';

function App() {
  const [page, setPage] = useState('home');
  const [seledtedSheet, setSelectedSheet] = useState('');
  const [sheetList, setSheetList] = useState<SheetDataType[]>([]);
  const [sheetDiffList, setSheetDiffList] = useState<SheetDataType[]>([]);
  const [isSidebarFold, setSidebarFold] = useState(false);
  const [isLogbarFold, setLogbarFold] = useState(false);
  const [isFileSelectorOpen, setFileSelectorOpen] = useState(false);
  const [isSheetDifferOpen, setSheetDifferOpen] = useState(false);
  const [isSheetVerifierOpen, setSheetVerifierOpen] = useState(false);
  const [isSettingOpen, setSettingOpen] = useState(false);

  // useEffect(() => {
  //   setFileSelectorOpen(true);
  // }, []);

  function gotoHome() {
    setPage('home');
    setSelectedSheet('');
  }

  function changeSheet(sheet: string) {
    setPage('sheet');
    setSelectedSheet(sheet);
  }

  function selectedSheetList(sheetList?: SheetDataType[]) {
    setFileSelectorOpen(false);
    if (sheetList?.length) {
      setSheetList(sheetList);
    }
  }

  function selectedDiffSheetList(sheetList?: SheetDataType[]) {
    setSheetDifferOpen(false);
    if (sheetList?.length) {
      setSheetDiffList(sheetList);
    }
  }
  
  return (
    <div className="flex flex-row w-full min-h-full max-h-full">
      <Sidebar
        isFold={isSidebarFold}
        sheetList={sheetList}
        seledtedSheet={seledtedSheet}
        onGotoHome={gotoHome}
        onChangeFold={(isFold) => setSidebarFold(isFold)}
        onChangeSheet={changeSheet}
      />
      <div className={clsx('flex flex-col ml-0 w-full h-screen overflow-hidden transition-all duration-150 ease-out', {
        'lg:ml-52': !isSidebarFold
      })}>
        <Headbar
          isFold={isSidebarFold}
          sheetList={sheetList}
          seledtedSheet={seledtedSheet}
          onGotoHome={gotoHome}
          onChangeFold={(isFold) => setSidebarFold(isFold)}
          onLogbarToggle={() => setLogbarFold(!isLogbarFold)}
          onOpenFileSelector={() => setFileSelectorOpen(true)}
          onOpenSheetDiffer={() => setSheetDifferOpen(true)}
          onOpenSheetVerifier={() => setSheetVerifierOpen(true)}
          onOpenSetting={() => setSettingOpen(true)}
        />
        <div className={clsx('relative flex mt-12 w-full h-[calc(100%-3rem)] transition-all duration-150 ease-out', {
          'lg:w-[calc(100vw-13rem)]': !isSidebarFold,
        })}>
          {page === 'home' ? (
            <Doc />
          ) : (
            <Sheet sheetData={sheetList.find((item) => item.sheetname === seledtedSheet)?.sheet}/>
          )}
        </div>
        <Logbar isFold={isLogbarFold} />
      </div>
      <FileSelectorDlg
        isOpen={isFileSelectorOpen}
        onClose={selectedSheetList}
      />
      <SheetDifferDlg
        isOpen={isSheetDifferOpen}
        sheetList={sheetList}
        onClose={selectedDiffSheetList}
      />
      <SheetVerifierDlg
        isOpen={isSheetVerifierOpen}
        onClose={() => setSheetVerifierOpen(false)}
      />

      <SettingDlg
        isOpen={isSettingOpen}
        onClose={() => setSettingOpen(false)}
      />
    </div>
  );
}

export default App;
