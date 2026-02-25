import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import {
  Egg,
  Home,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DashboardStats {
  totalChickens: number
  todayEggs: number
  totalCoops: number
  totalSales: number
  weekProduction: Array<{ date: string; count: number }>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      if (!user) return

      // Get total chickens
      const { data: chickens } = await supabase
        .from('chickens')
        .select('current_count')
        .eq('status', 'active')

      // Get total coops
      const { count: coopsCount } = await supabase
        .from('coops')
        .select('*', { count: 'exact', head: true })

      // Get today's egg production
      const today = new Date().toISOString().split('T')[0]
      const { data: todayEggs } = await supabase
        .from('egg_production')
        .select('count')
        .gte('date', today)

      // Get total sales
      const { data: sales } = await supabase
        .from('sales')
        .select('total')
        .eq('status', 'completed')

      // Get week production data
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data: weekData } = await supabase
        .from('egg_production')
        .select('date, count')
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      const totalChickens = chickens?.reduce((sum, c) => sum + c.current_count, 0) || 0
      const todayEggsCount = todayEggs?.reduce((sum, e) => sum + e.count, 0) || 0
      const totalSalesAmount = sales?.reduce((sum, s) => sum + s.total, 0) || 0

      // Group by date for chart
      const productionByDate = weekData?.reduce((acc, item) => {
        const date = item.date.split('T')[0]
        acc[date] = (acc[date] || 0) + item.count
        return acc
      }, {} as Record<string, number>) || {}

      const weekProduction = Object.entries(productionByDate).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        count,
      }))

      setStats({
        totalChickens,
        todayEggs: todayEggsCount,
        totalCoops: coopsCount || 0,
        totalSales: totalSalesAmount,
        weekProduction,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Ayam',
      value: stats?.totalChickens.toLocaleString() || '0',
      icon: Egg,
      color: 'bg-primary-500',
      textColor: 'text-primary-600',
    },
    {
      title: 'Telur Hari Ini',
      value: stats?.todayEggs.toLocaleString() || '0',
      icon: Egg,
      color: 'bg-secondary-500',
      textColor: 'text-secondary-600',
    },
    {
      title: 'Total Kandang',
      value: stats?.totalCoops.toLocaleString() || '0',
      icon: Home,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Penjualan',
      value: `Rp ${stats?.totalSales.toLocaleString()}` || 'Rp 0',
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Ringkasan peternakan Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Production Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Grafik Produksi Telur</h2>
          <TrendingUp className="w-5 h-5 text-primary-500" />
        </div>
        {stats?.weekProduction && stats.weekProduction.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weekProduction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f0710b"
                  strokeWidth={2}
                  dot={{ fill: '#f0710b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <AlertCircle className="w-12 h-12 mb-2" />
            <p>Belum ada data produksi</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href="/production"
            className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
          >
            <Egg className="w-6 h-6 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-primary-700">Input Telur</span>
          </a>
          <a
            href="/feed"
            className="flex flex-col items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition"
          >
            <Utensils className="w-6 h-6 text-secondary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-700">Input Pakan</span>
          </a>
          <a
            href="/health"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <HeartPulse className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-700">Kesehatan</span>
          </a>
          <a
            href="/sales"
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <DollarSign className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-700">Penjualan</span>
          </a>
        </div>
      </div>
    </div>
  )
}
