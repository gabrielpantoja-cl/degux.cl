// lib/exportToXlsx.ts
import * as XLSX from 'xlsx';
import { referenciales } from '@prisma/client';

export const exportReferencialesToXlsx = (referenciales: referenciales[], headers: { key: keyof referenciales, label: string }[]) => {
  const data = referenciales.map(referencial => {
    const row: { [key: string]: any } = {};
    headers.forEach(({ key, label }) => {
      row[label] = referencial[key];
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Referenciales');

  XLSX.writeFile(workbook, 'referenciales.xlsx');
};