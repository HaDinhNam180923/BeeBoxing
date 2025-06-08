import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

const SalesReport = () => {
  const [report, setReport] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_products_sold: 0,
    revenue_by_category: [],
    top_products: [],
    start_date: '',
    end_date: '',
  });
  const [dailyReport, setDailyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const overviewResponse = await axios.get('/api/admin/sales/overview', {
        params: filters,
      });
      setReport(overviewResponse.data.data);

      const dailyResponse = await axios.get('/api/admin/sales/daily', {
        params: filters,
      });
      setDailyReport(dailyResponse.data.data);
    } catch (error) {
      console.error('Error fetching sales report:', error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || 
        'Không thể tải báo cáo doanh số'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const chartData = {
    labels: dailyReport.map(item => item.date),
    datasets: [
      {
        label: 'Doanh thu',
        data: dailyReport.map(item => item.revenue),
        borderColor: '#4bc0c0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Doanh thu theo ngày' },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: 'Doanh thu (VND)' },
      },
      x: { 
        title: { display: true, text: 'Ngày' },
      },
    },
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Báo cáo doanh số</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Từ ngày</label>
          <input
            id="start_date"
            type="date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Đến ngày</label>
          <input
            id="end_date"
            type="date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      {/* Overview */}
      {loading ? (
        <div className="flex justify-center">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-600">Tổng doanh thu</h3>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(report.total_revenue)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-600">Tổng đơn hàng</h3>
              <p className="text-2xl font-bold text-gray-900">{report.total_orders}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-600">Sản phẩm bán ra</h3>
              <p className="text-2xl font-bold text-gray-900">{report.total_products_sold}</p>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          {dailyReport.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h3>
              <div className="h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Revenue by Category */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo danh mục</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.revenue_by_category.length > 0 ? (
                    report.revenue_by_category.map((category) => (
                      <tr key={category.category_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(category.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top sản phẩm bán chạy</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng bán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.top_products.length > 0 ? (
                    report.top_products.map((product) => (
                      <tr key={product.product_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.total_sold}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(product.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;