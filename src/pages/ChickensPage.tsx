import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Egg as EggIcon, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface Chicken {
  id: string
  batch_number: string
  breed: string
  initial_count: number
  current_count: number
  birth_date: string
  status: 'active' | 'sold' | 'dead'
  created_at: string
}

export default function ChickensPage() {
  const { user } = useAuth()
  const [chickens, setChickens] = useState<Chicken[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingChicken, setEditingChicken] = useState<Chicken | null>(null)
  const [formData, setFormData] = useState({
    batch_number: '',
    breed: '',
    initial_count: '',
    current_count: '',
    birth_date: '',
    status: 'active' as 'active' | 'sold' | 'dead',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchChickens()
    }
  }, [user])

  const fetchChickens = async () => {
    try {
      if (!user) return
      const { data, error } = await supabase
        .from('chickens')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setChickens(data || [])
    } catch (error) {
      console.error('Error fetching chickens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      const payload = {
        batch_number: formData.batch_number,
        breed: formData.breed,
        initial_count: parseInt(formData.initial_count),
        current_count: parseInt(formData.current_count || formData.initial_count),
        birth_date: formData.birth_date,
        status: formData.status,
      }

      if (editingChicken) {
        const { error } = await supabase
          .from('chickens')
          .update(payload)
          .eq('id', editingChicken.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('chickens').insert(payload)

        if (error) throw error
      }

      setShowModal(false)
      resetForm()
      fetchChickens()
    } catch (error) {
      console.error('Error saving chicken:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (chicken: Chicken) => {
    setEditingChicken(chicken)
    setFormData({
      batch_number: chicken.batch_number,
      breed: chicken.breed,
      initial_count: chicken.initial_count.toString(),
      current_count: chicken.current_count.toString(),
      birth_date: chicken.birth_date,
      status: chicken.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data ayam ini?')) return

    try {
      const { error } = await supabase.from('chickens').delete().eq('id', id)
      if (error) throw error
      fetchChickens()
    } catch (error) {
      console.error('Error deleting chicken:', error)
      alert('Gagal menghapus data')
    }
  }

  const resetForm = () => {
    setFormData({
      batch_number: '',
      breed: '',
      initial_count: '',
      current_count: '',
      birth_date: '',
      status: 'active',
    })
    setEditingChicken(null)
  }

  const openNewModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'sold':
        return 'bg-blue-100 text-blue-700'
      case 'dead':
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
          <h1 className="text-2xl font-bold text-gray-900">Data Ayam</h1>
          <p className="text-gray-600 mt-1">Kelola batch ayam petelur</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Ayam</span>
        </button>
      </div>

      {/* Chickens Table */}
      {chickens.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <EggIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data ayam</h3>
          <p className="text-gray-600 mb-4">Mulai dengan menambahkan batch ayam pertama</p>
          <button
            onClick={openNewModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition"
          >
            Tambah Ayam
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Lahir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {chickens.map((chicken) => (
                  <tr key={chicken.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {chicken.batch_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {chicken.breed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {chicken.current_count} / {chicken.initial_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(chicken.birth_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chicken.status)}`}>
                        {chicken.status === 'active' ? 'Aktif' : chicken.status === 'sold' ? 'Terjual' : 'Mati'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(chicken)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(chicken.id)}
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingChicken ? 'Edit Data Ayam' : 'Tambah Ayam Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Batch
                </label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: BATCH-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Ayam
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: Isa Brown, Lohmann"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Awal (ekor)
                </label>
                <input
                  type="number"
                  value={formData.initial_count}
                  onChange={(e) => setFormData({ ...formData, initial_count: e.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Sekarang (ekor)
                </label>
                <input
                  type="number"
                  value={formData.current_count}
                  onChange={(e) => setFormData({ ...formData, current_count: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Kosongkan jika sama dengan awal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'sold' | 'dead' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="active">Aktif</option>
                  <option value="sold">Terjual</option>
                  <option value="dead">Mati</option>
                </select>
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
                    editingChicken ? 'Update' : 'Simpan'
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
