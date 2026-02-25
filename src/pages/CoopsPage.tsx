import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Home, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface Coop {
  id: string
  name: string
  capacity: number
  created_at: string
}

export default function CoopsPage() {
  const { user } = useAuth()
  const [coops, setCoops] = useState<Coop[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoop, setEditingCoop] = useState<Coop | null>(null)
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCoops()
    }
  }, [user])

  const fetchCoops = async () => {
    try {
      if (!user) return
      const { data, error } = await supabase
        .from('coops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCoops(data || [])
    } catch (error) {
      console.error('Error fetching coops:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      if (editingCoop) {
        const { error } = await supabase
          .from('coops')
          .update({ name, capacity: parseInt(capacity) })
          .eq('id', editingCoop.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('coops').insert({
          user_id: user.id,
          name,
          capacity: parseInt(capacity),
        })

        if (error) throw error
      }

      setShowModal(false)
      resetForm()
      fetchCoops()
    } catch (error) {
      console.error('Error saving coop:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (coop: Coop) => {
    setEditingCoop(coop)
    setName(coop.name)
    setCapacity(coop.capacity.toString())
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kandang ini?')) return

    try {
      const { error } = await supabase.from('coops').delete().eq('id', id)
      if (error) throw error
      fetchCoops()
    } catch (error) {
      console.error('Error deleting coop:', error)
      alert('Gagal menghapus kandang')
    }
  }

  const resetForm = () => {
    setName('')
    setCapacity('')
    setEditingCoop(null)
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
          <h1 className="text-2xl font-bold text-gray-900">Kandang</h1>
          <p className="text-gray-600 mt-1">Kelola kandang ayam Anda</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Kandang</span>
        </button>
      </div>

      {/* Coops Grid */}
      {coops.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada kandang</h3>
          <p className="text-gray-600 mb-4">Mulai dengan menambahkan kandang pertama Anda</p>
          <button
            onClick={openNewModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition"
          >
            Tambah Kandang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coops.map((coop) => (
            <div
              key={coop.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{coop.name}</h3>
                    <p className="text-sm text-gray-500">
                      Dibuat {new Date(coop.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(coop)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(coop.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Kapasitas</p>
                <p className="text-xl font-bold text-gray-900">{coop.capacity.toLocaleString()} ekor</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCoop ? 'Edit Kandang' : 'Tambah Kandang Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kandang
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: Kandang A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasitas (ekor)
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: 1000"
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
                    editingCoop ? 'Update' : 'Simpan'
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
