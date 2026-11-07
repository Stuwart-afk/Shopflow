'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

const navItems = ['Overview', 'Appointments', 'Customers', 'Vehicles', 'Job board', 'Assignments', 'Reports', 'Settings'];

const appointments = [
  ['09:00', 'Maria Santos · NCD 4821', 'Brake inspection', 'Confirmed'],
  ['10:00', 'Carlo Dela Cruz · NFP 7312', 'Oil change', 'Confirmed'],
  ['11:00', 'Liza Garcia · ABL 2198', 'AC diagnosis', 'Requested'],
  ['13:00', 'Paolo Mendoza · NHT 6084', 'Periodic maintenance', 'Confirmed'],
];

const activeJobs = [
  ['SF-2026-0001 / NCD 4821', 'Maria Santos', 'Front brakes', 'Rafael Cruz', 'Awaiting Approval', 'Review estimate →'],
  ['SF-2026-0002 / NFP 7312', 'Carlo Dela Cruz', 'Oil & filter', 'Ben Torres', 'In Progress', 'View job →'],
  ['SF-2026-0003 / ABL 2198', 'Liza Garcia', 'AC diagnosis', 'Joey Lim', 'On Hold · parts', 'Review hold →'],
];

function formatCebuTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date).reduce<Record<string, string>>((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});

  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year} · ${parts.hour}:${parts.minute} ${parts.dayPeriod} · Asia/Cebu`;
}

export default function AdvisorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeNav, setActiveNav] = useState('Overview');
  const [cebuTime, setCebuTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'service_advisor') {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    } catch {
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const updateClock = () => setCebuTime(formatCebuTime());
    updateClock();
    const interval = window.setInterval(updateClock, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleAction = (label: string) => {
    window.alert(`${label} is ready to be connected to a route.`);
  };

  if (!user) return <div className="min-h-screen bg-slate-100 p-8 text-sm text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-52 shrink-0 flex-col bg-slate-900 px-4 py-7 text-white lg:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-600">
              <div className="h-3 w-3 rounded-full bg-blue-600" />
            </div>
            <div className="text-xl font-bold tracking-tight">ShopFlow.</div>
          </div>

          <div className="mt-7 text-xs leading-5">
            <div className="font-bold">Stuwart Auto Care</div>
            <div className="text-slate-400">Cebu City, Philippines</div>
          </div>

          <nav className="mt-7 flex flex-col gap-1.5">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`h-11 rounded-lg px-4 text-left text-xs transition ${activeNav === item ? 'bg-blue-600 font-bold text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-auto text-xs leading-5">
            <div className="text-slate-400">● Live workshop · Cebu time</div>
            <div className="mt-4 font-bold">{user.name || 'Ana Reyes'}</div>
            <button onClick={handleLogout} className="text-left text-slate-400 hover:text-white">Service advisor · Sign out</button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 lg:px-7">
            <button onClick={() => handleAction('Search')} className="text-left text-xs text-slate-500">
              Search jobs, customers or plates <span className="ml-5 rounded border border-slate-200 px-1.5 py-0.5">⌘ K</span>
            </button>
            <div className="text-xs text-slate-500">{cebuTime || 'Loading time...'} <span className="mx-4">/</span> AR</div>
          </header>

          <div className="space-y-5 p-5 lg:p-7">
            <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="font-mono text-xs text-blue-600">W02 / WORKSHOP OPERATIONS</div>
                <h1 className="mt-1 text-3xl font-bold leading-10">Good morning, {user.name || 'Ana'}.</h1>
                <p className="text-xs leading-5 text-slate-500">Your workshop at a glance · {cebuTime || 'Loading time...'} · Live workspace</p>
              </div>
              <button onClick={() => handleAction('New appointment')} className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700">＋ New appointment</button>
            </section>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Stat icon="◷" value="08" label="Appointments today" />
              <Stat icon="⌁" value="08" label="Vehicles in service" />
              <Stat icon="◇" value="01" label="Awaiting approval" />
              <Stat icon="◉" value="02" label="In progress" />
              <Stat icon="△" value="01" label="On hold" />
              <Stat icon="✓" value="01" label="Ready for pickup" />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <Panel title="Today's appointments">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">8 bookings · 3 bays</span>
                  <button onClick={() => handleAction('View calendar')} className="text-xs text-blue-600">View calendar →</button>
                </div>
                <TableHeader columns={['TIME', 'CUSTOMER / VEHICLE', 'SERVICE', 'STATE']} />
                {appointments.map(([time, customer, service, state], index) => (
                  <div key={time} className={`grid grid-cols-4 gap-2 border-b border-slate-200 p-3 text-xs ${index === 0 ? 'bg-indigo-50' : 'bg-white'}`}>
                    <div className="font-bold text-blue-600">{time}</div><div>{customer}</div><div>{service}</div><div>{state}</div>
                  </div>
                ))}
              </Panel>

              <div className="space-y-4">
                <Panel title="Mechanic workload">
                  <div className="space-y-2 text-xs leading-5">
                    <Workload name="Rafael Cruz" detail="2 jobs · 1 pending approval" />
                    <Workload name="Ben Torres" detail="2 jobs · Available at 11:00" />
                    <Workload name="Joey Lim" detail="1 job · On hold" />
                    <ActionButton label="Manage assignments" onClick={handleAction} />
                  </div>
                </Panel>
                <div className="rounded-lg bg-orange-100 p-3 text-xs leading-4 text-yellow-700">Approval needed: E-0001 v1 / ₱2,300 sent to Maria Santos at 10:05 AM. Work is blocked until approved.</div>
              </div>
            </section>

            <Panel title="Active jobs">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">8 open records · showing the next 3 actions</span>
                <ActionButton label="＋ New job" onClick={handleAction} />
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[850px]">
                  <TableHeader columns={['JOB / PLATE', 'CUSTOMER', 'SERVICE', 'MECHANIC', 'STATUS', 'NEXT ACTION']} />
                  {activeJobs.map((job, index) => (
                    <div key={job[0]} className={`grid grid-cols-6 gap-3 border-b border-slate-200 p-3 text-xs ${index === 0 ? 'bg-indigo-50' : 'bg-white'}`}>
                      {job.map((value, valueIndex) => valueIndex === 0 ? <div key={value} className="font-bold text-blue-600">{value}</div> : <div key={value}>{value}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <p className="text-[10px] text-slate-500">Illustrative operational data · Status updates and approvals remain attached to each job record.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-3.5"><h2 className="mb-3 text-base font-bold leading-5">{title}</h2>{children}</section>;
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-2 text-xl text-blue-600">{icon}</div><div className="text-3xl font-bold leading-10">{value}</div><div className="text-[10px] text-slate-500">{label}</div></div>;
}

function TableHeader({ columns }: { columns: string[] }) {
  return <div className="grid gap-2 bg-slate-100 p-3 text-[10px] font-bold text-slate-500" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>{columns.map((column) => <div key={column}>{column}</div>)}</div>;
}

function Workload({ name, detail }: { name: string; detail: string }) {
  return <div><span className="text-slate-500">{name} / </span><span className="font-semibold text-slate-800">{detail}</span></div>;
}

function ActionButton({ label, onClick }: { label: string; onClick: (label: string) => void }) {
  return <button onClick={() => onClick(label)} className="min-h-9 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-blue-600 hover:text-blue-600">{label}</button>;
}
