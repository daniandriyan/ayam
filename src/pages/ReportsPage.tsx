import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FileText, TrendingUp, DollarSign, Egg, Download } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function ReportsPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month')
  const [reportData, setReportData] = useState({
    totalEggs: 0,
    totalSales: 0,
    totalFeedCost: 0,
    totalHealthCost: 0,
    profit: 0,
    eggProduction: [] as Array<{ date: string; count: number }>,
    salesByGrade: [] as Array<{ name: string; value: number }>,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchReportData()
    }
  }, [user, period])

  const fetchReportData = async () => {
    try {
      if (!user) return

      const startDate = new Date()
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1)
      } else {
        startDate.setFullYear(0)
      }
      const startDateStr = startDate.toISOString().split('T')[0]

      // Egg production
      const { data: eggData } = await supabase
        .from('egg_production')
        .select('date, count')
        .gte('date', startDateStr)
        .order('date', { ascending: true })

      // Sales
      const { data: salesData } = await supabase
        .from('sales')
        .select('total, egg_count')
        .gte('date', startDateStr)
        .eq('status', 'completed')

      // Feed cost
      const { data: feedData } = await supabase
        .from('feed')
        .select('cost')
        .gte('date', startDateStr)

      // Health cost
      const { data: healthData } = await supabase
        .from('health_records')
        .select('cost')
        .gte('date', startDateStr)

      // Calculate totals
      const totalEggs = eggData?.reduce((sum, e) => sum + e.count, 0) || 0
      const totalSales = salesData?.reduce((sum, s) => sum + s.total, 0) || 0
      const totalFeedCost = feedData?.reduce((sum, f) => sum + f.cost, 0) || 0
      const totalHealthCost = healthData?.reduce((sum, h) => sum + h.cost, 0) || 0
      const profit = totalSales - totalFeedCost - totalHealthCost

      // Group egg production by date
      const productionByDate = eggData?.reduce((acc, item) => {
        const date = item.date.split('T')[0]
        acc[date] = (acc[date] || 0) + item.count
        return acc
      }, {} as Record<string, number>) || {}

      const eggProduction = Object.entries(productionByDate).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        count,
      }))

      // Mock sales by grade (in real app, you'd query this)
      const salesByGrade = [
        { name: 'Grade A', value: Math.round(totalEggs * 0.6) },
        { name: 'Grade B', value: Math.round(totalEggs * 0.3) },
        { name: 'Grade C', value: Math.round(totalEggs * 0.1) },
      ]

      setReportData({
        totalEggs,
        totalSales,
        totalFeedCost,
        totalHealthCost,
        profit,
        eggProduction,
        salesByGrade,
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#22c55e', '#eab308', '#ef4444']

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
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-600 mt-1">Analisis performa peternakan</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition">
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Period Filter */}
      <div className="flex space-x-2">
        <button
          onClick={() => setPeriod('week')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            period === 'week'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          7 Hari
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            period === 'month'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          30 Hari
        </button>
        <button
          onClick={() => setPeriod('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            period === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Semua
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Telur</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {reportData.totalEggs.toLocaleString()}
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Egg className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Penjualan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                Rp {reportData.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Biaya</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                Rp {(reportData.totalFeedCost + reportData.totalHealthCost).toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profit / Loss</p>
              <p className={`text-2xl font-bold mt-1 ${
                reportData.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                Rp {reportData.profit.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              reportData.profit >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Egg Production Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Produksi Telur</h2>
          {reportData.eggProduction.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.eggProduction}>
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
                  <Bar dataKey="count" fill="#f0710b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Belum ada data
            </div>
          )}
        </div>

        {/* Sales Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Grade Telur</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.salesByGrade}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.salesByGrade.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rincian Biaya</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Biaya Pakan</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              Rp {reportData.totalFeedCost.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Biaya Kesehatan</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              Rp {reportData.totalHealthCost.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
