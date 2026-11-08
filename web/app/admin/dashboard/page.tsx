'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';


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
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});

  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year} · ${parts.hour}:${parts.minute} ${parts.dayPeriod} · Asia/Cebu`;
}



const navItems = [
  'Overview',
  'Appointments',
  'Repair jobs',
  'Mechanics',
  'Reports',
  'Users & roles',
  'Operating hours',
  'Service catalog',
  'Audit log',
  'Settings',
];

const stats = [
  ['08', 'Appointments today', '7 live · 1 cancelled'],
  ['08', 'Open repair jobs', 'Across all shop stages'],
  ['01', 'Awaiting approval', 'Customer action required'],
  ['02', 'In progress', '2 mechanics working'],
  ['01', 'On hold', 'Awaiting parts'],
  ['01', 'Ready for pickup', 'Release check complete'],
];

const attentionJobs = [
  ['SF-2026-0001', 'Maria Santos · NCD 4821', 'Awaiting Approval', 'Review E-0001 v1 →', 'approval'],
  ['SF-2026-0003', 'Liza Garcia · ABL 2198', 'On Hold · parts', 'Follow up supplier →', 'approval'],
  ['SF-2026-0007', 'Ella Tan · NBR 7042', 'Quality Check', 'Review inspection →', 'quality'],
];

const appointments = [
  ['09:00', 'Maria Santos · Toyota Vios 2021 / NCD 4821', 'Brake inspection', 'Checked-in', 'success'],
  ['10:00', 'Carlo Dela Cruz · NFP 7312', 'Oil & filter service', 'Checked-in', 'success'],
  ['11:00', 'Liza Garcia · ABL 2198', 'AC diagnosis · follow-up', 'Requested', 'warning'],
  ['13:00', 'Paolo Mendoza · NHT 6084', 'Periodic maintenance · review', 'Confirmed', 'quality'],
];

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeNav, setActiveNav] = useState('Overview');
  const router = useRouter();
  const [cebuTime, setCebuTime] = useState('');
  useEffect(() => {
  const storedUser = localStorage.getItem('user');

  if (!storedUser) {
    router.push('/login');
    return;
  }

  try {
    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== 'admin') {
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
  const updateClock = () => {
    setCebuTime(formatCebuTime());
  };

  updateClock();

  const interval = window.setInterval(updateClock, 60_000);

  return () => {
    window.clearInterval(interval);
  };
}, []);


  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleAction = (label: string) => {
    window.alert(`${label} is ready to be connected to a route.`);
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-100 p-8 text-sm text-slate-500">Loading...</div>;
  }

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
            {navItems.map((item) => {
              const active = item === activeNav;
              return (
                <button
                  key={item}
                  onClick={() => setActiveNav(item)}
                  className={`h-11 rounded-lg px-4 text-left text-xs transition ${active
                    ? 'bg-blue-600 font-bold text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  {item}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto text-xs leading-5">
            <div className="text-slate-400">● Live workshop · Manila time</div>
            <div className="mt-4 font-bold">{user.name || 'Luis Santos'}</div>
            <button onClick={handleLogout} className="text-left text-slate-400 hover:text-white">
              Owner / admin · Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 lg:px-7">
            <button className="text-left text-xs text-slate-500" onClick={() => handleAction('Search')}>
              Search jobs, customers or plates <span className="ml-5 rounded border border-slate-200 px-1.5 py-0.5">⌘ K</span>
            </button>
            <div className="text-xs text-slate-500">
              {cebuTime || 'Loading time...'}
              <span className="mx-4">/</span>
              LS
            </div>

          </header>

          <div className="space-y-5 p-5 lg:p-7">
            <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="font-mono text-xs text-blue-600">A01 / OWNER OPERATIONS</div>
                <h1 className="mt-1 text-3xl font-bold leading-10 text-slate-800">Good morning, {user.name || 'Luis'}.</h1>
                <p className="text-xs leading-5 text-slate-500">Your shop at a glance · Wednesday, 28 October 2026 · Last updated 10:15 AM</p>
              </div>
              <button onClick={() => handleAction('Create repair job')} className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700">
                ＋ Create repair job
              </button>
            </section>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {stats.map(([value, label, detail]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-3xl font-bold leading-10">{value}</div>
                  <div className="mt-1 text-xs font-bold">{label}</div>
                  <div className="mt-1 text-xs leading-4 text-slate-500">{detail}</div>
                </div>
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <Panel title="Jobs needing attention" subtitle="3 priority records from 8 open jobs">
                <div className="hidden grid-cols-3 gap-3 bg-slate-100 p-3 text-[10px] font-bold text-slate-500 sm:grid">
                  <div>JOB / CUSTOMER</div><div>CURRENT STATE</div><div>NEXT ACTION</div>
                </div>
                {attentionJobs.map(([job, customer, state, action, tone]) => (
                  <div key={job} className="grid gap-2 border-b border-slate-200 p-3 sm:grid-cols-3 sm:items-center sm:gap-3">
                    <div className="text-xs font-semibold text-blue-600">{job}<br />{customer}</div>
                    <div><StatusPill label={state} tone={tone} /></div>
                    <button onClick={() => handleAction(action)} className="text-left text-xs text-slate-800 hover:text-blue-600">{action}</button>
                  </div>
                ))}
                <div className="mt-3 rounded-lg bg-orange-100 p-3 text-xs leading-4 text-yellow-700">
                  SF-2026-0001 · E-0001 v1 / ₱2,300 sent to Maria at 10:05 AM. Labor ₱800 + brake pads ₱1,500. Repair remains blocked until customer approval.
                </div>
              </Panel>

              <Panel title="Mechanic workload" subtitle="5 assigned jobs · 3 mechanics on shift">
                <div className="space-y-2 text-xs leading-5">
                  <Workload name="Rafael Cruz" detail="2 jobs · Busy until 10:30" />
                  <Workload name="Ben Torres" detail="2 jobs · Next free at 13:00" />
                  <Workload name="Joey Lim" detail="1 job · On hold, parts" />
                  <p className="pt-2 text-slate-500">Other open jobs: 1 Received, 1 Quality Check and 1 Ready for Pickup. No active mechanic allocation.</p>
                  <ActionButton label="Manage assignments →" onClick={handleAction} />
                </div>
              </Panel>
            </section>

            <Panel title="Today's appointments" subtitle="8 records today · Showing the next 4 operational records">
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[64px_2fr_1fr_160px] gap-3 bg-slate-100 p-3 text-[10px] font-bold text-slate-500">
                    <div>TIME</div><div>CUSTOMER / VEHICLE</div><div>SERVICE</div><div>STATE</div>
                  </div>
                  {appointments.map(([time, customer, service, state, tone]) => (
                    <div key={time} className="grid min-h-14 grid-cols-[64px_2fr_1fr_160px] items-center gap-3 border-b border-slate-200 p-3 text-xs">
                      <div className="font-semibold text-blue-600">{time}</div><div>{customer}</div><div>{service}</div><div><StatusPill label={state} tone={tone} /></div>
                    </div>
                  ))}
                  <div className="pt-3 text-xs text-slate-500">2 checked-in · 3 confirmed · 2 requested · 1 cancelled. <button onClick={() => handleAction('Appointments')} className="hover:text-blue-600">View all appointments →</button></div>
                </div>
              </div>
            </Panel>

            <section className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
              <UtilityCard title="Users & roles" detail="6 staff · 5 active, 1 deactivated" action="Manage access →" onClick={handleAction} />
              <UtilityCard title="Operating hours" detail="Mon–Sat · 08:00–17:00" action="Edit calendar →" onClick={handleAction} />
              <UtilityCard title="Service catalog" detail="5 services · 4 bookable" action="Manage services →" onClick={handleAction} />
              <UtilityCard title="Audit log" detail="Owner-only · Retained history" action="Review records →" onClick={handleAction} />
            </section>

            <p className="text-[10px] text-slate-500">Santos Auto Care · Owner workspace · Illustrative operational data · Asia/Manila (UTC+08:00)</p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3.5">
        <h2 className="text-base font-bold leading-5">{title}</h2>
        <p className="mt-1 text-xs leading-4 text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  const styles: Record<string, string> = {
    approval: 'bg-orange-100 text-yellow-700',
    warning: 'bg-orange-100 text-yellow-700',
    quality: 'bg-indigo-50 text-blue-600',
    success: 'bg-emerald-50 text-emerald-700',
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${styles[tone] || styles.quality}`}>{label}</span>;
}

function Workload({ name, detail }: { name: string; detail: string }) {
  return <div><span className="text-slate-500">{name} / </span><span className="font-semibold text-slate-800">{detail}</span></div>;
}

function ActionButton({ label, onClick }: { label: string; onClick: (label: string) => void }) {
  return <button onClick={() => onClick(label)} className="mt-1 min-h-9 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-blue-600 hover:text-blue-600">{label}</button>;
}

function UtilityCard({ title, detail, action, onClick }: { title: string; detail: string; action: string; onClick: (label: string) => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-base font-bold leading-5">{title}</h2>
      <p className="mt-3.5 text-xs leading-4 text-slate-500">{detail}</p>
      <ActionButton label={action} onClick={onClick} />
    </div>
  );
}
