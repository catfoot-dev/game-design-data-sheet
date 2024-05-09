import Dialog from '@material-tailwind/react/components/Dialog';

import { SheetDataType } from '../types';
import React from 'react';
import Card, { CardBody, CardFooter, CardHeader } from '@material-tailwind/react/components/Card';
import Typography from '@material-tailwind/react/components/Typography';
import Button from '@material-tailwind/react/components/Button';

export default function SettingDlg({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: (sheetList?: SheetDataType[]) => void;
}) {
  return (
    <Dialog
      className="bg-transparent shadow-none"
      dismiss={{ enabled: false }}
      open={isOpen}
      handler={() => onClose()}
    >
      <Card className="mx-auto w-full max-w-[40rem] rounded-md">
        <CardHeader
          floated={false}
          shadow={false}
          className="mx-2 mt-0 mb-1 p-1 rounded-none"
        >
          <Typography variant="h6" color="blue-gray" className="mb-2">
            설정
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col p-5 w-full text-center">
          {'작업 중'}
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
              onClick={() => onClose()}
            >
              확인
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Dialog>
  );
}
