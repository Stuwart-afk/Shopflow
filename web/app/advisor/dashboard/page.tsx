'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdvisorDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'service_advisor') {
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
      <nav className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ShopFlow - Service Advisor</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user.name}</span>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-1 rounded hover:bg-red-700">Logout</button>
        </div>
      </nav>
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-4">Advisor Dashboard</h2>
        <p className="text-gray-600">Customer management features coming soon.</p>
      </main>
    </div>
  );
}