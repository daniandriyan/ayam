import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Egg, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface EggProduction {
  id: string
  date: string
  count: number
  weight: number | null
  quality: 'A' | 'B' | 'C'
  notes: string | null
  chicken_id: string
}

interface Chicken {
  id: string
  batch_number: string
}

export default function ProductionPage() {
  const { user } = useAuth()
  const [productions, setProductions] = useState<EggProduction[]>([])
  const [chickens, setChickens] = useState<Chicken[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    chicken_id: '',
    date: new Date().toISOString().split('T')[0],
    count: '',
    weight: '',
    quality: 'A' as 'A' | 'B' | 'C',
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

      const { data: prodData } = await supabase
        .from('egg_production')
        .select('*')
        .order('date', { ascending: false })

      const { data: chickenData } = await supabase
        .from('chickens')
        .select('id, batch_number')
        .eq('status', 'active')

      setProductions(prodData || [])
      setChickens(chickenData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.chicken_id) return

    setSubmitting(true)
    try {
      const payload = {
        chicken_id: formData.chicken_id,
        date: formData.date,
        count: parseInt(formData.count),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        quality: formData.quality,
        notes: formData.notes || null,
      }

      if (editingId) {
        const { error } = await supabase
          .from('egg_production')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('egg_production').insert(payload)

        if (error) throw error
      }

      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving production:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (prod: EggProduction) => {
    setEditingId(prod.id)
    setFormData({
      chicken_id: prod.chicken_id,
      date: prod.date,
      count: prod.count.toString(),
      weight: prod.weight?.toString() || '',
      quality: prod.quality,
      notes: prod.notes || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return

    try {
      const { error } = await supabase.from('egg_production').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting production:', error)
      alert('Gagal menghapus data')
    }
  }

  const resetForm = () => {
    setFormData({
      chicken_id: chickens[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      count: '',
      weight: '',
      quality: 'A',
      notes: '',
    })
    setEditingId(null)
  }

  const openNewModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A':
        return 'bg-green-100 text-green-700'
      case 'B':
        return 'bg-yellow-100 text-yellow-700'
      case 'C':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Produksi Telur</h1>
          <p className="text-gray-600 mt-1">Catat produksi telur harian</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Input Produksi</span>
        </button>
      </div>

      {productions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Egg className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data produksi</h3>
          <p className="text-gray-600 mb-4">Mulai input produksi telur harian Anda</p>
          <button
            onClick={openNewModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition"
          >
            Input Produksi
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
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Berat (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productions.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(prod.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {chickens.find(c => c.id === prod.chicken_id)?.batch_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {prod.count} butir
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {prod.weight?.toFixed(2) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(prod.quality)}`}>
                        Grade {prod.quality}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(prod)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
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
              {editingId ? 'Edit Produksi' : 'Input Produksi Telur'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Ayam
                </label>
                <select
                  value={formData.chicken_id}
                  onChange={(e) => setFormData({ ...formData, chicken_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Pilih Batch</option>
                  {chickens.map((chicken) => (
                    <option key={chicken.id} value={chicken.id}>
                      {chicken.batch_number}
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
                  Jumlah Telur (butir)
                </label>
                <input
                  type="number"
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: 850"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Berat Total (kg) - Opsional
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: 45.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Kualitas
                </label>
                <select
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value as 'A' | 'B' | 'C' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="A">Grade A (Bagus)</option>
                  <option value="B">Grade B (Sedang)</option>
                  <option value="C">Grade C (Kecil/Retak)</option>
                </select>
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
