'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ShopFlow - Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user.name}</span>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-1 rounded hover:bg-red-700">Logout</button>
        </div>
      </nav>
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow"><h3 className="text-gray-500">Appointments</h3><p className="text-3xl font-bold">0</p></div>
          <div className="bg-white p-6 rounded shadow"><h3 className="text-gray-500">Active Jobs</h3><p className="text-3xl font-bold">0</p></div>
          <div className="bg-white p-6 rounded shadow"><h3 className="text-gray-500">Vehicles Ready</h3><p className="text-3xl font-bold">0</p></div>
        </div>
      </main>
    </div>
  );
}