'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  join_date: string;
  created_at?: string;
}

const emptyMember: Omit<Member, 'id' | 'created_at'> = {
  name: '',
  email: '',
  phone: '',
  status: 'active',
  join_date: new Date().toISOString().split('T')[0],
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyMember);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setMembers(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingMember) {
      const { error } = await supabase
        .from('members')
        .update(form)
        .eq('id', editingMember.id);
      if (!error) {
        setMembers(members.map((m) => (m.id === editingMember.id ? { ...m, ...form } : m)));
      }
    } else {
      const { data, error } = await supabase.from('members').insert([form]).select().single();
      if (!error && data) setMembers([data, ...members]);
    }
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) setMembers(members.filter((m) => m.id !== id));
  }

  function handleEdit(member: Member) {
    setEditingMember(member);
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      status: member.status,
      join_date: member.join_date,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyMember);
    setEditingMember(null);
    setShowForm(false);
  }

  const filtered = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-500 mt-1">Manage your association members</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Member
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <input
                    type="date"
                    required
                    value={form.join_date}
                    onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    {editingMember ? 'Update' : 'Add Member'}
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
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No members found</p>
              <p className="text-sm mt-1">Add your first member to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{member.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{member.join_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <PencilIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
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
