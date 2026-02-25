import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { HeartPulse, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface HealthRecord {
  id: string
  date: string
  type: 'vaccination' | 'treatment' | 'checkup'
  description: string
  cost: number
  vet_name: string | null
  chicken_id: string
}

interface Chicken {
  id: string
  batch_number: string
}

export default function HealthPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [chickens, setChickens] = useState<Chicken[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    chicken_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'vaccination' as 'vaccination' | 'treatment' | 'checkup',
    description: '',
    cost: '',
    vet_name: '',
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

      const { data: recordsData } = await supabase
        .from('health_records')
        .select('*')
        .order('date', { ascending: false })

      const { data: chickensData } = await supabase
        .from('chickens')
        .select('id, batch_number')

      setRecords(recordsData || [])
      setChickens(chickensData || [])
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
        type: formData.type,
        description: formData.description,
        cost: parseFloat(formData.cost),
        vet_name: formData.vet_name || null,
      }

      if (editingId) {
        const { error } = await supabase
          .from('health_records')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('health_records').insert(payload)

        if (error) throw error
      }

      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving health record:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (record: HealthRecord) => {
    setEditingId(record.id)
    setFormData({
      chicken_id: record.chicken_id,
      date: record.date,
      type: record.type,
      description: record.description,
      cost: record.cost.toString(),
      vet_name: record.vet_name || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return

    try {
      const { error } = await supabase.from('health_records').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting health record:', error)
      alert('Gagal menghapus data')
    }
  }

  const resetForm = () => {
    setFormData({
      chicken_id: chickens[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      type: 'vaccination',
      description: '',
      cost: '',
      vet_name: '',
    })
    setEditingId(null)
  }

  const openNewModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'Vaksinasi'
      case 'treatment':
        return 'Pengobatan'
      case 'checkup':
        return 'Pemeriksaan'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'bg-blue-100 text-blue-700'
      case 'treatment':
        return 'bg-red-100 text-red-700'
      case 'checkup':
        return 'bg-green-100 text-green-700'
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
          <h1 className="text-2xl font-bold text-gray-900">Kesehatan</h1>
          <p className="text-gray-600 mt-1">Catat vaksinasi, pengobatan, dan pemeriksaan</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Catatan</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <HeartPulse className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data kesehatan</h3>
          <p className="text-gray-600 mb-4">Mulai catat riwayat kesehatan ayam</p>
          <button
            onClick={openNewModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition"
          >
            Tambah Catatan
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
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deskripsi
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
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(record.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {chickens.find(c => c.id === record.chicken_id)?.batch_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                        {getTypeLabel(record.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      Rp {record.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
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
              {editingId ? 'Edit Catatan' : 'Tambah Catatan Kesehatan'}
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
                  Tipe
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'vaccination' | 'treatment' | 'checkup' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="vaccination">Vaksinasi</option>
                  <option value="treatment">Pengobatan</option>
                  <option value="checkup">Pemeriksaan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  placeholder="Jenis vaksin, obat, atau hasil pemeriksaan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biaya (Rp)
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: 50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Dokter Hewan - Opsional
                </label>
                <input
                  type="text"
                  value={formData.vet_name}
                  onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: Dr. Hewan Andi"
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
