/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
importScripts('xlsx.full.min.js');

addEventListener('message', async (ev) => {
  switch (ev.data.type) {
    case 'file': {
      const wb = XLSX.read(ev.data.arrayBuffer);
      postMessage({
        type: 'readDone',
        filename: ev.data.filename,
        workbook: wb,
        md5: ev.data.md5,
      });
      break;
    }
    case 'sheet': {
      const sheet = ev.data.sheet;
      const range = XLSX.utils.decode_range(sheet['!ref']);
      
      const rowLen = range.e.r + 1;
      const colLen = range.e.c + 1;

      const sheetData = [];
      let maxCol = 0;
      let maxRow = 0;
      for (let row = 0; row < rowLen; row++) {
        const rowData = [];
        for (let col = 0; col < colLen; col++) {
          const column = XLSX.utils.encode_col(col);
          const cell = column + XLSX.utils.encode_row(row);
          const value = sheet[cell] ? sheet[cell].v : '';
          const type = sheet[cell] ? sheet[cell].t : '';
          
          if (type === 'd') {
            value.setHours(value.getHours() + 9);
            rowData[col] = `${value.getFullYear()}-${(value.getMonth() + 1).toDigits(2)}-${value.getDate().toDigits(2)}`;
          } else {
            rowData[col] = value;
          }
          if (value && col > maxCol) {
            maxCol = col;
          }
        }
        if (rowData.findIndex((item) => item) !== -1) {
          maxRow = row;
        }
        sheetData.push(rowData);
      }

      if (rowLen > maxRow) {
        sheetData.splice(maxRow + 1);
      }

      if (colLen > maxCol) {
        for (const row of sheetData) {
          row.splice(maxCol + 1);
        }
      }

      postMessage({
        type: 'parseDone',
        sheetArr: sheetData,
      });
      break;
    }
    default:
      break;
  }
});
