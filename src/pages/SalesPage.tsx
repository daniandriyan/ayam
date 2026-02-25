import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ShoppingCart, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface Sale {
  id: string
  date: string
  egg_count: number
  price_per_unit: number
  total: number
  customer: string | null
  status: 'pending' | 'completed'
  created_at: string
}

export default function SalesPage() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    egg_count: '',
    price_per_unit: '',
    customer: '',
    status: 'completed' as 'pending' | 'completed',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSales()
    }
  }, [user])

  const fetchSales = async () => {
    try {
      if (!user) return
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      const eggCount = parseInt(formData.egg_count)
      const pricePerUnit = parseFloat(formData.price_per_unit)
      const payload = {
        date: formData.date,
        egg_count: eggCount,
        price_per_unit: pricePerUnit,
        total: eggCount * pricePerUnit,
        customer: formData.customer || null,
        status: formData.status,
      }

      if (editingId) {
        const { error } = await supabase
          .from('sales')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('sales').insert(payload)

        if (error) throw error
      }

      setShowModal(false)
      resetForm()
      fetchSales()
    } catch (error) {
      console.error('Error saving sale:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id)
    setFormData({
      date: sale.date,
      egg_count: sale.egg_count.toString(),
      price_per_unit: sale.price_per_unit.toString(),
      customer: sale.customer || '',
      status: sale.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return

    try {
      const { error } = await supabase.from('sales').delete().eq('id', id)
      if (error) throw error
      fetchSales()
    } catch (error) {
      console.error('Error deleting sale:', error)
      alert('Gagal menghapus data')
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      egg_count: '',
      price_per_unit: '',
      customer: '',
      status: 'completed',
    })
    setEditingId(null)
  }

  const openNewModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
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
          <h1 className="text-2xl font-bold text-gray-900">Penjualan</h1>
          <p className="text-gray-600 mt-1">Catat penjualan telur</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Catat Penjualan</span>
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data penjualan</h3>
          <p className="text-gray-600 mb-4">Mulai catat penjualan telur Anda</p>
          <button
            onClick={openNewModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition"
          >
            Catat Penjualan
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
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Harga/Satuan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(sale.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {sale.customer || 'Umum'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {sale.egg_count} butir
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      Rp {sale.price_per_unit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary-600">
                      Rp {sale.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                        {sale.status === 'completed' ? 'Selesai' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(sale)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
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
              {editingId ? 'Edit Penjualan' : 'Catat Penjualan Telur'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Customer / Pembeli
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Kosongkan untuk penjualan umum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Telur (butir)
                </label>
                <input
                  type="number"
                  value={formData.egg_count}
                  onChange={(e) => setFormData({ ...formData, egg_count: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga per Butir (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Contoh: 2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'completed' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="completed">Selesai</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-primary-600">
                  Rp {(parseInt(formData.egg_count || '0') * parseFloat(formData.price_per_unit || '0')).toLocaleString()}
                </p>
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
