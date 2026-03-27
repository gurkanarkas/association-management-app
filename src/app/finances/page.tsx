'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Finance {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at?: string;
}

const emptyFinance: Omit<Finance, 'id' | 'created_at'> = {
  description: '',
  amount: 0,
  type: 'income',
  category: '',
  date: new Date().toISOString().split('T')[0],
};

export default function FinancesPage() {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);
  const [form, setForm] = useState(emptyFinance);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    fetchFinances();
  }, []);

  async function fetchFinances() {
    setLoading(true);
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) setFinances(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingFinance) {
      const { error } = await supabase
        .from('finances')
        .update(form)
        .eq('id', editingFinance.id);
      if (!error) {
        setFinances(finances.map((f) => (f.id === editingFinance.id ? { ...f, ...form } : f)));
      }
    } else {
      const { data, error } = await supabase.from('finances').insert([form]).select().single();
      if (!error && data) setFinances([data, ...finances]);
    }
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    const { error } = await supabase.from('finances').delete().eq('id', id);
    if (!error) setFinances(finances.filter((f) => f.id !== id));
  }

  function handleEdit(finance: Finance) {
    setEditingFinance(finance);
    setForm({
      description: finance.description,
      amount: finance.amount,
      type: finance.type,
      category: finance.category,
      date: finance.date,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyFinance);
    setEditingFinance(null);
    setShowForm(false);
  }

  const filtered = finances.filter((f) => filter === 'all' || f.type === filter);
  const totalIncome = finances.filter((f) => f.type === 'income').reduce((sum, f) => sum + Number(f.amount), 0);
  const totalExpenses = finances.filter((f) => f.type === 'expense').reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finances</h1>
            <p className="text-gray-500 mt-1">Manage your association finances</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Record
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600 mt-1">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 mt-1">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Net Balance</p>
            <p className={`text-2xl font-bold mt-1 ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalIncome - totalExpenses).toLocaleString()}
            </p>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingFinance ? 'Edit Record' : 'Add Financial Record'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Membership fees, Rent, Equipment"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    {editingFinance ? 'Update' : 'Add Record'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex gap-2">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No records found</p>
              <p className="text-sm mt-1">Add your first financial record to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{record.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                        record.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.type === 'income' ? '+' : '-'}${Number(record.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <PencilIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
