import Typography from '@material-tailwind/react/components/Typography';
import clsx from 'clsx';
import { ArrowDown02Icon, ArrowUp02Icon, ArrowUpDownIcon } from 'hugeicons-react';
import { useState } from 'react';

export default function Table({
  items,
  columns,
}: {
  items: any[];
  columns: {
    key: string;
    name: string;
    align?: 'left' | 'center' | 'right';
    isOrderDisabled?: boolean;
    render?: (item: any, idx: number, items: any[]) => JSX.Element;
    orderBy?: (leftItem: any, rightItem: any, isAsc: boolean) => number;
  }[];
}) {
  const [orderBy, setOrderBy] = useState('');
  const [isAsc, setAsc] = useState(false);

  return (
    <table className="table-auto w-full min-w-max table-auto border-separate border-spacing-0 text-left">
      <thead className="sticky top-0 z-10">
        <tr>
          {columns.map((col, i) => (
            <th
              key={col.key}
              className="cursor-pointer py-1 border-y border-blue-gray-100 bg-blue-gray-50
                transition-colors hover:bg-blue-gray-100"
              onClick={() => {
                if (orderBy !== col.key) {
                  setOrderBy(col.key);
                  setAsc(true);
                } else {
                  setAsc(!isAsc);
                }
              }}
            >
              <Typography
                variant="small"
                color="blue-gray"
                className={clsx(
                  'flex items-center justify-between gap-2 px-2 py-1 ' +
                  'font-normal leading-none opacity-70', {
                    'border-r border-blue-gray-100': i !== columns.length - 1,
                  },
                )}
              >
                {col.name} {!col.isOrderDisabled ? (orderBy === col.key ? (
                  isAsc ? (
                    <ArrowDown02Icon strokeWidth={2} className="h-4 w-4" />
                  ) : (
                    <ArrowUp02Icon strokeWidth={2} className="h-4 w-4" />
                  )
                ) : !orderBy ? (
                  <ArrowUpDownIcon strokeWidth={2} className="h-4 w-4" />
                ) : null) : null}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.sort((a: any, b: any) => {
          const column = columns.find((item) => item.key === orderBy);
          if (column?.orderBy) return column.orderBy(a, b, isAsc);
          if (!orderBy) return 0;
          let order = 0;
          if (a[orderBy] > b[orderBy]) order = isAsc ? 1 : -1;
          if (a[orderBy] < b[orderBy]) order = isAsc ? -1 : 1;
          return order;
        }).map((item: any, i) => (
          <tr key={`table-row-${i}`}>
            {columns.map((col, j) => (
              <td key={`table-row-${i}-${j}`} className="p-0.5 text-sm border-b border-blue-gray-50">
                <div className={clsx('px-1', {
                  '-mr-[1px] border-r border-blue-gray-50': j !== columns.length - 1,
                  'text-left': col.align === 'left',
                  'text-center': col.align === 'center',
                  'text-right': col.align === 'right',
                })}>
                  {col.render ? col.render(item, i, items) : item[col.key]}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
