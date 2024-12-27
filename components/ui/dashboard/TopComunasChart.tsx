// components/ui/dashboard/TopComunasChart.tsx
'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchTopComunas } from '@/lib/referenciales';

type CommuneData = {
  comuna: string;
  count: number;
};

export default async function TopComunasChart() {
  const data = await fetchTopComunas();

  return (
    <div className="flex w-full flex-col md:col-span-4 lg:col-span-4">
      <h2 className="mb-4 text-xl md:text-2xl">Top 4 Comunas con más Referenciales</h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="comuna" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}