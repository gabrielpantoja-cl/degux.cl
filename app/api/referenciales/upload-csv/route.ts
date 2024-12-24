// app/api/referenciales/upload-csv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });

    const createdReferenciales = await prisma.$transaction(
      records.map((record: any) => {
        return prisma.referenciales.create({
          data: {
            lat: parseFloat(record.lat),
            lng: parseFloat(record.lng),
            fojas: record.fojas,
            numero: parseInt(record.numero),
            anio: parseInt(record.anio),
            cbr: record.cbr,
            comprador: record.comprador,
            vendedor: record.vendedor,
            predio: record.predio,
            comuna: record.comuna,
            rol: record.rol,
            fechaescritura: new Date(record.fechaescritura),
            superficie: parseFloat(record.superficie),
            monto: parseFloat(record.monto),
            observaciones: record.observaciones,
            userId: userId
          }
        });
      })
    );

    return NextResponse.json({ success: true, count: createdReferenciales.length });
  } catch (error) {
    console.error('Error al procesar CSV:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo CSV' },
      { status: 500 }
    );
  }
}