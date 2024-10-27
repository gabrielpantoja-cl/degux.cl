// app/ui/referenciales/table.tsx
import { UpdateReferencial } from '@/app/ui/referenciales/buttons';
import { formatDateToLocal } from '@/lib/utils';
import { fetchFilteredReferenciales } from '@/lib/referenciales';

export default async function ReferencialesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const referenciales = await fetchFilteredReferenciales(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile view starts here */}
          <div className="md:hidden">
            {referenciales?.map((referencial: any) => (
              <div
                key={referencial.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p>{referencial.fojas}</p>
                    <p className="text-sm text-gray-500">{referencial.numero}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {referencial.anio}
                    </p>
                    <p>{referencial.date ? formatDateToLocal(referencial.date) : 'N/A'}</p>                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateReferencial id={referencial.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile view ends here */}
          {/* Desktop view starts here */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Fojas
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Número
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Año
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha de escritura
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {referenciales?.map((referencial: any) => (
                <tr
                  key={referencial.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p>{referencial.fojas}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {referencial.numero}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {referencial.anio}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <p>{referencial.date ? formatDateToLocal(referencial.date) : 'N/A'}</p>                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateReferencial id={referencial.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Desktop view ends here */}
        </div>
      </div>
    </div>
  );
}