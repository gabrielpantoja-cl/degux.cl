// lib/exportToXlsx.ts
import ExcelJS from 'exceljs';
import { referenciales } from '@prisma/client';

export const exportReferencialesToXlsx = async (referenciales: referenciales[], headers: { key: keyof referenciales, label: string }[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Referenciales');

  // Agregar encabezados
  worksheet.columns = headers.map(header => ({
    header: header.label,
    key: header.key as string,
    width: 20,
  }));

  // Agregar filas
  referenciales.forEach(referencial => {
    const row: { [key: string]: any } = {};
    headers.forEach(({ key }) => {
      row[key as string] = referencial[key];
    });
    worksheet.addRow(row);
  });

  // Guardar el archivo
  await workbook.xlsx.writeFile('referenciales.xlsx');
};