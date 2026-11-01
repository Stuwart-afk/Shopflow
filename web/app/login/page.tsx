
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { access_token, user } = response.data;

      if (user.role !== 'admin' && user.role !== 'service_advisor') {
        setError(
          'This web dashboard is for Admin and Service Advisor only.'
        );
        return;
      }

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/advisor/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* LEFT PANEL */}
      <aside className="w-full lg:w-[480px] xl:w-[560px] shrink-0 p-8 md:p-12 xl:p-14 bg-slate-900 flex flex-col gap-10 xl:gap-14">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.7171 5.92136C15.5033 6.13945 15.3836 6.43265 15.3836 6.73803C15.3836 7.04341 15.5033 7.33661 15.7171 7.5547L17.5838 9.42136C17.8019 9.63513 18.0951 9.75486 18.4004 9.75486C18.7058 9.75486 18.999 9.63513 19.2171 9.42136L22.8408 5.79886C23.2141 5.4232 23.8476 5.5422 23.9876 6.0532C24.3401 7.33522 24.3202 8.69111 23.9302 9.96222C23.5402 11.2333 22.7962 12.3671 21.7854 13.2308C20.7746 14.0945 19.5386 14.6525 18.2222 14.8394C16.9059 15.0264 15.5634 14.8345 14.3521 14.2864L5.12378 23.5147C4.65965 23.9787 4.03022 24.2393 3.37395 24.2392C2.71768 24.239 2.08834 23.9782 1.62436 23.5141C1.16039 23.05 0.899793 22.4206 0.899902 21.7643C0.900012 21.108 1.16082 20.4787 1.62495 20.0147L10.8533 10.7864C10.3051 9.57503 10.1133 8.23263 10.3002 6.91624C10.4871 5.59985 11.0451 4.36392 11.9088 3.35308C12.7726 2.34224 13.9063 1.59829 15.1774 1.20829C16.4485 0.818295 17.8044 0.798375 19.0864 1.15086C19.5974 1.29086 19.7164 1.9232 19.3419 2.29886L15.7171 5.92136Z" strokeWidth="1.8" strokeLinecap="round" stroke="#245FF2" />
          </svg>
          <span className="text-white text-2xl font-bold font-['Inter'] leading-8">ShopFlow.</span>
        </div>



        {/* Hero Text */}
        <div className="flex flex-col gap-5">
          <h1 className="text-white text-4xl xl:text-5xl font-bold font-['Inter'] leading-tight xl:leading-[1.45]">
            A clearer view of every repair.
          </h1>
          <p className="text-slate-400 text-base font-normal font-['Inter'] leading-6">
            From the first booking to the final handoff. Keep your workshop
            moving with one connected job record.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="w-full p-6 bg-slate-800 rounded-2xl flex flex-col gap-5">

          <div className="flex items-start gap-4">
            <svg width="21" height="23" viewBox="0 0 21 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.10833 0.900391V2.98389M6.10833 2.98389V5.06739M6.10833 2.98389H2.98333C1.83273 2.98389 0.899994 3.91671 0.899994 5.06739V9.23439M6.10833 2.98389H14.4417M14.4417 0.900391V2.98389M14.4417 2.98389V5.06739M14.4417 2.98389H17.5667C18.7173 2.98389 19.65 3.91671 19.65 5.06739V9.23439M0.899994 9.23439H19.65M0.899994 9.23439V19.6519C0.899994 20.8026 1.83273 21.7354 2.98333 21.7354H17.5667C18.7173 21.7354 19.65 20.8026 19.65 19.6519V9.23439M6.10833 13.4014H6.11874M10.275 13.4014H10.2854M14.4417 13.4014H14.4521M6.10833 17.5684H6.11874M10.275 17.5684H10.2854M14.4417 17.5684H14.4521" strokeWidth="1.8" strokeLinecap="round" stroke="#79A3FF" />
            </svg>

            <div className="flex flex-col gap-[5px]">
              <span className="text-white text-base font-bold font-['Inter'] leading-5">
                Schedule with confidence
              </span>
              <span className="text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                Hours, service time and bay capacity.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6662 4.16553H18.7494C19.3018 4.16553 19.8317 4.38504 20.2224 4.77577C20.613 5.16651 20.8325 5.69645 20.8325 6.24903V20.8335C20.8325 21.3861 20.613 21.9161 20.2224 22.3068C19.8317 22.6975 19.3018 22.917 18.7494 22.917H6.25062C5.69814 22.917 5.16829 22.6975 4.77763 22.3068C4.38697 21.9161 4.1675 21.3861 4.1675 20.8335V6.24903C4.1675 5.69645 4.38697 5.16651 4.77763 4.77577C5.16829 4.38504 5.69814 4.16553 6.25062 4.16553H8.33375M16.6662 4.16553V3.12378C16.6662 2.54844 16.1999 2.08203 15.6247 2.08203H9.37531C8.80007 2.08203 8.33375 2.54844 8.33375 3.12378V4.16553M16.6662 4.16553V5.20728C16.6662 5.78262 16.1999 6.24903 15.6247 6.24903H9.37531C8.80007 6.24903 8.33375 5.78262 8.33375 5.20728V4.16553M9.37531 14.583L11.4584 16.6665L15.6247 12.4995" strokeWidth="1.8" strokeLinecap="round" stroke="#79A3FF" />
            </svg>

            <div className="flex flex-col gap-[5px]">
              <span className="text-white text-base font-bold font-['Inter'] leading-5">
                Track every handoff
              </span>
              <span className="text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                Controlled stages. A complete audit trail.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.667 21.875V19.7917C16.667 18.6866 16.228 17.6268 15.4465 16.8454C14.6651 16.064 13.6052 15.625 12.5 15.625H6.2495C5.14435 15.625 4.08445 16.064 3.30299 16.8454C2.52153 17.6268 2.0825 18.6866 2.0825 19.7917V21.875M16.667 3.25826C17.5606 3.4899 18.3519 4.01166 18.9169 4.74166C19.4818 5.47166 19.7883 6.36856 19.7883 7.29159C19.7883 8.21463 19.4818 9.11153 18.9169 9.84153C18.3519 10.5715 17.5606 11.0933 16.667 11.3249M22.9175 21.8749V19.7915C22.9168 18.8683 22.6095 17.9715 22.0439 17.2419C21.4782 16.5122 20.6862 15.9911 19.7923 15.7603M13.5418 7.29167C13.5418 9.59285 11.6761 11.4583 9.37475 11.4583C7.07338 11.4583 5.20775 9.59285 5.20775 7.29167C5.20775 4.99048 7.07338 3.125 9.37475 3.125C11.6761 3.125 13.5418 4.99048 13.5418 7.29167Z" strokeWidth="1.8" strokeLinecap="round" stroke="#79A3FF" />
            </svg>

            <div className="flex flex-col gap-[5px]">
              <span className="text-white text-base font-bold font-['Inter'] leading-5">
                Keep customers informed
              </span>
              <span className="text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                Approvals and updates, without the guesswork.
              </span>
            </div>
          </div>

        </div>

        
      </aside>

      {/* RIGHT PANEL */}
      <main className="flex-1 min-w-0 px-6 py-10 sm:px-10 lg:px-12 xl:px-24 xl:py-20 flex flex-col justify-center gap-7">

        {/* Top Bar */}
        <div className="w-full flex justify-between items-start gap-4">
          <div className="px-2 py-[5px] bg-indigo-50 rounded-full">
            
          </div>
          <a
            href="mailto:support@santosautocare.ph"
            className="text-slate-500 text-xs font-normal font-['Inter'] leading-4 hover:text-blue-600 transition-colors"
          >
            Need help?
          </a>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2.5">
          <h2 className="text-slate-800 text-3xl sm:text-4xl font-bold font-['Inter'] leading-tight">
            Welcome to your workday.
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">

          {/* Email */}
          <div className="flex flex-col gap-[5px]">
            <label
              htmlFor="email"
              className="text-slate-500 text-xs font-bold font-['Inter'] leading-4"
            >
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@role.com"
              required
              className="w-full min-h-11 p-2.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-200 text-slate-800 text-sm font-normal font-['Inter'] leading-5 focus:outline-blue-600 focus:outline-2"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-[5px]">
            <label
              htmlFor="password"
              className="text-slate-500 text-xs font-bold font-['Inter'] leading-4"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full min-h-11 p-2.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-200 text-slate-800 text-sm font-normal font-['Inter'] leading-5 focus:outline-blue-600 focus:outline-2"
            />
          </div>

          {/* Remember Device / Forgot Password */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="size-4 accent-blue-600"
              />
              <span className="text-slate-800 text-xs font-normal font-['Inter'] leading-5">
                Remember this device
              </span>
            </label>

            <button
              type="button"
              onClick={() =>
                setError('Please contact your administrator to reset your password.')
              }
              className="text-blue-600 text-xs font-normal font-['Inter'] leading-4 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 rounded-lg border border-red-100"
            >
              <span className="text-red-600 text-xs font-normal font-['Inter'] leading-5">
                {error}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-11 px-3.5 bg-blue-600 rounded-lg outline outline-1 outline-offset-[-1px] outline-blue-600 flex justify-center items-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-white text-sm font-bold font-['Inter'] leading-5">
              {loading ? 'Signing in...' : 'Sign in securely →'}
            </span>
          </button>
        </form>

        {/* Security Notice */}
        <div className="flex items-center gap-2">
          <div className="size-4 relative shrink-0">
            <div className="w-2.5 h-3.5 left-[2.67px] top-[1.33px] absolute outline outline-2 outline-offset-[-0.90px] outline-slate-500 rounded-sm" />
          </div>
          <span className="text-slate-500 text-xs font-normal font-['Inter'] leading-4">
            Staff-only access · Activity is recorded
          </span>
        </div>

        <div className="w-full h-px bg-slate-200" />

        
      </main>
    </div>
  );
}
