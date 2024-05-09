import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { HotTable } from '@handsontable/react';
import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import Spinner from '@material-tailwind/react/components/Spinner';

registerAllModules();

export default function Sheet({
  sheetData,
}: {
  sheetData?: XLSX.Sheet;
}) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<[][]>([]);

  useEffect(() => {
    const worker = new Worker(`${process.env.PUBLIC_URL}/js/worker.js`);

    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case 'parseDone': {
          setData(data.sheetArr);
          setLoading(false);
          break;
        }
        default:
          break;
      }
    };

    setWorker(worker);

    return () => {
      worker.terminate();
    };
  }, []);
  
  useEffect(() => {
    if (sheetData && sheetData['!ref']) {
      setLoading(true);
      worker?.postMessage({ type: 'sheet', sheet: sheetData });
    } else {
      setData([]);
      setLoading(false);
    }
  }, [worker, sheetData]);

  return (
    <>
      <HotTable
        rowHeaders={true}
        colHeaders={true}
        width="1000%"
        height="100%"
        data={data}
        autoWrapRow={true}
        autoWrapCol={true}
        readOnly={true}
        licenseKey="non-commercial-and-evaluation"
      />
      <div
        className={clsx('absolute flex justify-center items-center w-full h-full transition-all duration-0 pointer-events-none z-[9999]', {
          'bg-white/50': isLoading,
        })}
      >
        {isLoading ? (
          <Spinner className="h-32 w-32" />
        ) : null}
      </div>
    </>
  );
}