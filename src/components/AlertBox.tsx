import { AlertMessageType } from '../types';
import { Alert01Icon, AlertDiamondIcon, CheckmarkCircle01Icon } from 'hugeicons-react';
import Alert from '@material-tailwind/react/components/Alert';
import { colors } from '@material-tailwind/react/types/generic';
import { useEffect, useState } from 'react';

export default function AlertBox({
  items,
  onDismiss,
}: {
  items: AlertMessageType[] | undefined;
  onDismiss: (no: number) => void;
}) {
  const [alerts, setAlerts] = useState<AlertMessageType[]>([]);

  useEffect(() => {
    items && setAlerts(items);
  }, [items]);

  return (
    <>
      {alerts.map((item, i) => (
        <Alert
          key={`alert-${i}`}
          open={item.message !== ''}
          color={({
            'info': 'light-blue',
            'warning': 'orange',
            'error': 'red',
          }[item.type ?? 'info'] as colors)}
          icon={({
            'info': <CheckmarkCircle01Icon />,
            'warning': <Alert01Icon />,
            'error': <AlertDiamondIcon />
          }[item.type ?? 'info'])}
          onClose={() => {
            setAlerts((prev) => {
              prev.splice(i, 1);
              return [...prev];
            });
            onDismiss(i);
          }}
          className="fixed top-0 max-w-[42rem] shadow-[0_2px_5px_5px_rgba(64,64,64,0.3)]"
          animate={{
            mount: { y: 10 + i * 3 },
          }}
        >
          {item.message}
        </Alert>
      ))}
    </>
  );
}