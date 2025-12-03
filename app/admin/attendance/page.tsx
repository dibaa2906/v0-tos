"use client"
import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/auth-guard';

function AttendanceTable() {
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/attendance').then(r => r.json()).then(d => setRecords(d.attendance || []));
  }, []);

  useEffect(() => {
    setFiltered(search ? records.filter(r =>
      r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.username?.toLowerCase().includes(search.toLowerCase()) ||
      r.date?.includes(search)) : records)
  }, [search, records]);

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Attendance Records</h2>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search intern/date..." className="border p-2 rounded ml-auto w-64" />
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Intern</th><th className="p-2">Date</th><th className="p-2">Clock-In</th><th className="p-2">Clock-Out</th><th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="p-2">{row.fullName}</td>
                <td className="p-2">{row.date}</td>
                <td className="p-2">{row.clockInTime}</td>
                <td className="p-2">{row.clockOutTime}</td>
                <td className="p-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-muted-foreground text-center">No attendance records found.</div>}
      </div>
    </div>
  );
}

export default function Page() {
  return <AdminGuard><AttendanceTable /></AdminGuard>;
}




