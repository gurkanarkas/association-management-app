'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Stats {
  members: number;
  events: number;
  income: number;
  expenses: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ members: 0, events: 0, income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [membersRes, eventsRes, financesRes] = await Promise.all([
          supabase.from('members').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('finances').select('amount, type'),
        ]);

        const income = (financesRes.data || [])
          .filter((f: { type: string; amount: number }) => f.type === 'income')
          .reduce((sum: number, f: { amount: number }) => sum + Number(f.amount), 0);
        const expenses = (financesRes.data || [])
          .filter((f: { type: string; amount: number }) => f.type === 'expense')
          .reduce((sum: number, f: { amount: number }) => sum + Number(f.amount), 0);

        setStats({
          members: membersRes.count || 0,
          events: eventsRes.count || 0,
          income,
          expenses,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Members',
      value: stats.members,
      icon: '👥',
      color: 'bg-blue-500',
      change: 'Active members',
    },
    {
      title: 'Upcoming Events',
      value: stats.events,
      icon: '📅',
      color: 'bg-purple-500',
      change: 'Scheduled events',
    },
    {
      title: 'Total Income',
      value: `$${stats.income.toLocaleString()}`,
      icon: '💰',
      color: 'bg-green-500',
      change: 'Revenue this year',
    },
    {
      title: 'Total Expenses',
      value: `$${stats.expenses.toLocaleString()}`,
      icon: '📊',
      color: 'bg-red-500',
      change: 'Expenses this year',
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.displayName || user?.email}!</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => (
              <div key={card.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} rounded-lg p-3 text-2xl`}>{card.icon}</div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">{card.title}</p>
                <p className="text-xs text-gray-400 mt-1">{card.change}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Member', href: '/members', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { label: 'Create Event', href: '/events', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { label: 'Record Income', href: '/finances', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                { label: 'Record Expense', href: '/finances', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className={`${action.color} rounded-lg p-4 text-sm font-medium transition-colors text-center`}
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Income</span>
                <span className="font-semibold text-green-600">${stats.income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Expenses</span>
                <span className="font-semibold text-red-600">${stats.expenses.toLocaleString()}</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-medium text-gray-900">Net Balance</span>
                <span className={`font-bold text-lg ${stats.income - stats.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(stats.income - stats.expenses).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
