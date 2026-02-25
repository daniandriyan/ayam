import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Utensils, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface Feed {
  id: string
  date: string
  type: string
  quantity_kg: number
  cost: number
  notes: string | null
  coop_id: string
}

interface Coop {
  id: string
  name: string
}

export default function FeedPage() {
  const { user } = useAuth()
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [coops, setCoops] = useState<Coop[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    coop_id: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    quantity_kg: '',
    cost: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      if (!user) return

      const { data: feedData } = await supabase
        .from('feed')
        .select('*')
        .order('date', { ascending: false })

      const { data: coopData } = await supabase
        .from('coops')
        .select('id, name')

      setFeeds(feedData || [])
      setCoops(coopData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.coop_id) return

    setSubmitting(true)
    try {
      const payload = {
        coop_id: formData.coop_id,
        date: formData.date,
        type: formData.type,
        quantity_kg: parseFloat(formData.quantity_kg),
        cost: parseFloat(formData.cost),
        notes: formData.notes || null,
      }

      if (editingId) {
        const { error } = await supabase
          .from('feed')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('feed').insert(payload)

        if (error) throw error
      }

      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving feed:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (feed: Feed) => {
    setEditingId(feed.id)
    setFormData({
      coop_id: feed.coop_id,
      date: feed.date,
      type: feed.type,
      quantity_kg: feed.quantity_kg.toString(),
      cost: feed.cost.toString(),
      notes: feed.notes || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return

    try {
      const { error } = await supabase.from('feed').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting feed:', error)
      alert('Gagal menghapus data')
    }
  }

  const resetForm = () => {
    setFormData({
      coop_id: coops[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      type: '',
      quantity_kg: '',
      cost: '',
      notes: '',
    })
    setEditingId(null)
  }

  const openNewModal = () => {
    resetForm()
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pakan</h1>
          <p className="text-gray-600 mt-1">Kelola pemberian pakan</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Input Pakan</span>
        </button>
      </div>

      {feeds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data pakan</h3>
          <p className="text-gray-600 mb-4">Mulai input pemberian pakan</p>
          <button
            onClick={openNewModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition"
          >
            Input Pakan
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kandang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jumlah (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Biaya
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feeds.map((feed) => (
                  <tr key={feed.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(feed.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {coops.find(c => c.id === feed.coop_id)?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {feed.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {feed.quantity_kg} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      Rp {feed.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(feed)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(feed.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Pakan' : 'Input Pemberian Pakan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kandang
                </label>
                <select
                  value={formData.coop_id}
                  onChange={(e) => setFormData({ ...formData, coop_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Pilih Kandang</option>
                  {coops.map((coop) => (
                    <option key={coop.id} value={coop.id}>
                      {coop.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Pakan
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: Pakan Layer, Konsentrat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.quantity_kg}
                  onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: 50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biaya Total (Rp)
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: 250000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan - Opsional
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  placeholder="Catatan tambahan..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    editingId ? 'Update' : 'Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
