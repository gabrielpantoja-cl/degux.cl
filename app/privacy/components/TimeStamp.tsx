/* app/terms/components/TimeStamp.tsx */
'use client'

const TimeStamp = ({ date }: { date: string }) => (
  <p className="timestampComment text-sm mb-4">
    Última actualización: {date}
  </p>
);

export default TimeStamp;