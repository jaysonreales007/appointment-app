import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment } from '../../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TimeRange = 'week' | 'month' | 'year' | 'all';
type ChartType = 'status' | 'caseType';

export function AdminReports() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [chartType, setChartType] = useState<ChartType>('status');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/appointments/all', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const getFilteredAppointments = () => {
    const now = new Date();
    const filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      switch (timeRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return aptDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return aptDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return aptDate >= yearAgo;
        default:
          return true;
      }
    });
    return filtered;
  };

  const getStatusStats = () => {
    const filtered = getFilteredAppointments();
    return {
      pending: filtered.filter(apt => apt.status === 'pending').length,
      confirmed: filtered.filter(apt => apt.status === 'confirmed').length,
      completed: filtered.filter(apt => apt.status === 'completed').length,
      cancelled: filtered.filter(apt => apt.status === 'cancelled').length
    };
  };

  const getCaseTypeStats = () => {
    const filtered = getFilteredAppointments();
    const stats: Record<string, number> = {};
    filtered.forEach(apt => {
      stats[apt.caseType] = (stats[apt.caseType] || 0) + 1;
    });
    return stats;
  };

  const statusChartData = {
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: Object.values(getStatusStats()),
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',  // yellow for pending
          'rgba(75, 192, 192, 0.8)',   // green for confirmed
          'rgba(54, 162, 235, 0.8)',   // blue for completed
          'rgba(255, 99, 132, 0.8)',   // red for cancelled
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const caseTypeChartData = {
    labels: Object.keys(getCaseTypeStats()).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
    ),
    datasets: [
      {
        label: 'Number of Cases',
        data: Object.values(getCaseTypeStats()),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Case Type Distribution',
      },
    },
  };

  // Function to format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to generate CSV content
  const generateCSV = () => {
    const filteredData = getFilteredAppointments();
    
    // CSV Headers
    const headers = [
      'Date',
      'Time',
      'Client Name',
      'Client Email',
      'Case Type',
      'Status',
      'Notes'
    ].join(',');

    // CSV Rows
    const rows = filteredData.map(appointment => {
      return [
        formatDate(appointment.date),
        appointment.time,
        `"${appointment.clientName || ''}"`,
        `"${appointment.clientEmail || ''}"`,
        appointment.caseType.replace('_', ' '),
        appointment.status,
        `"${appointment.notes || ''}"`,
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  };

  // Function to download CSV
  const downloadReport = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Get date range for filename
    const today = new Date();
    let dateRange = '';
    
    switch (timeRange) {
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateRange = `${formatDate(weekAgo.toISOString())}_to_${formatDate(today.toISOString())}`;
        break;
      case 'month':
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        dateRange = `${formatDate(monthAgo.toISOString())}_to_${formatDate(today.toISOString())}`;
        break;
      case 'year':
        const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        dateRange = `${formatDate(yearAgo.toISOString())}_to_${formatDate(today.toISOString())}`;
        break;
      default:
        dateRange = 'all_time';
    }

    link.setAttribute('href', url);
    link.setAttribute('download', `appointments_report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  const statusStats = getStatusStats();
  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-law-primary">Reports & Analytics</h2>
          
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-law-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Report
          </button>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-law-primary mb-4">Appointment Status Distribution</h3>
          <div className="aspect-square">
            <Pie data={statusChartData} />
          </div>
        </div>

        {/* Case Type Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-law-primary mb-4">Case Type Distribution</h3>
          <div className="aspect-square">
            <Bar options={barOptions} data={caseTypeChartData} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Total Appointments</h4>
          <p className="text-3xl font-bold text-law-primary mt-2">{filteredAppointments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Completion Rate</h4>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {Math.round((statusStats.completed / filteredAppointments.length) * 100)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Cancellation Rate</h4>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {Math.round((statusStats.cancelled / filteredAppointments.length) * 100)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Pending Rate</h4>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {Math.round((statusStats.pending / filteredAppointments.length) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
} 