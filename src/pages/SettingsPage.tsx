import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Settings as SettingsIcon, Loader2, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [farmName, setFarmName] = useState(profile?.farm_name || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          farm_name: farmName,
          location: location,
        })
        .eq('id', user.id)

      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Gagal menyimpan perubahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600 mt-1">Kelola profil peternakan Anda</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900">Profil Peternakan</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Peternakan
            </label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Contoh: Berkah Farm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Contoh: Bandung, Jawa Barat"
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
            {saved && (
              <span className="text-green-600 text-sm">Berhasil disimpan!</span>
            )}
          </div>
        </form>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tentang Aplikasi</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Versi:</strong> 1.0.0</p>
          <p><strong>Tech Stack:</strong> React + Vite + Tailwind CSS + Supabase</p>
        </div>
      </div>
    </div>
  )
}
