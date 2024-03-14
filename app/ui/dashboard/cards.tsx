import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data';

const iconMap = {
  collected: BanknotesIcon,
  colaboradores: UserGroupIcon,
  pending: ClockIcon,
  referenciales: InboxIcon,
};

export default async function CardWrapper() {
  const {
    totalPaidReferenciales,
    totalPendingReferenciales,
    numberOfReferenciales,
    numberOfColaboradores
  } = await fetchCardData();
  return (
    <>
      {/* NOTE: comment in this code when you get to this point in the course */}

      <Card title="Collected" value={totalPaidReferenciales} type="collected" />
      <Card title="Pending" value={totalPendingReferenciales} type="pending" />
      <Card title="Total Referenciales" value={numberOfReferenciales} type="referenciales" />
      <Card
        title="Total Customers"
        value={numberOfColaboradores}
        type="colaboradores"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'referenciales' | 'colaboradores' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
