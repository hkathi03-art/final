import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import Layout from '../components/Layout'
import { DEMO_STUDENTS, HOUSINGS, MENTORS } from '../lib/data'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!loading && (!user || !user.email.endsWith('@bowiestate.edu'))) {
      // In a real app, we'd check for an 'admin' role. 
      // For this demo, we'll allow any BSU email or just show a message.
    }
    
    // Mocking some admin data
    setStats({
      totalStudents: DEMO_STUDENTS.length + 142,
      activeMentors: MENTORS.length,
      housingInquiries: 84,
      visaAlerts: 12,
      topCountries: [
        { name: 'Nigeria', count: 42 },
        { name: 'India', count: 38 },
        { name: 'Ghana', count: 25 },
        { name: 'China', count: 18 },
        { name: 'Mexico', count: 12 }
      ],
      popularResources: [
        { name: 'F-1 Visa Guide', views: 1240 },
        { name: 'CPT Workshop', views: 890 },
        { name: 'Housing Search', views: 750 },
        { name: 'Scholarship List', views: 620 }
      ],
      recentActivity: [
        { id: 1, user: 'Amina Yusuf', action: 'Requested Mentorship', time: '2 mins ago' },
        { id: 2, user: 'Carlos Mendoza', action: 'Viewed Housing', time: '15 mins ago' },
        { id: 3, user: 'Priya Nair', action: 'Updated I-20', time: '1 hour ago' },
        { id: 4, user: 'Kofi Mensah', action: 'Signed Lease', time: '3 hours ago' }
      ]
    })
  }, [user, loading])

  if (loading) return <Layout><div>Loading...</div></Layout>
  if (!user) return <Layout><div className="admin-error">Please sign in to access the Admin Dashboard.</div></Layout>
  if (!user.isAdmin) return <Layout><div className="admin-error">Access Denied. Only staff and faculty can view the Admin Dashboard.</div></Layout>

  return (
    <Layout>
      <div className="admin-container">
        <header className="admin-header">
          <h1>Staff & Faculty Oversight</h1>
          <p>Welcome back, {user.name}. Here is the current status of the International Student Portal.</p>
        </header>

        <div className="admin-grid">
          {/* Quick Stats */}
          <div className="admin-card stat-card">
            <div className="stat-icon blue"><i className="fas fa-users"></i></div>
            <div className="stat-info">
              <h3>{stats?.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="admin-card stat-card">
            <div className="stat-icon green"><i className="fas fa-user-tie"></i></div>
            <div className="stat-info">
              <h3>{stats?.activeMentors}</h3>
              <p>Active Mentors</p>
            </div>
          </div>
          <div className="admin-card stat-card">
            <div className="stat-icon orange"><i className="fas fa-home"></i></div>
            <div className="stat-info">
              <h3>{stats?.housingInquiries}</h3>
              <p>Housing Inquiries</p>
            </div>
          </div>
          <div className="admin-card stat-card">
            <div className="stat-icon red"><i className="fas fa-exclamation-triangle"></i></div>
            <div className="stat-info">
              <h3>{stats?.visaAlerts}</h3>
              <p>Visa Alerts</p>
            </div>
          </div>

          {/* Charts/Lists Section */}
          <div className="admin-card wide">
            <h3>Student Demographics (Top Countries)</h3>
            <div className="demo-list">
              {stats?.topCountries.map(c => (
                <div key={c.name} className="demo-item">
                  <span className="demo-name">{c.name}</span>
                  <div className="demo-bar-wrap">
                    <div className="demo-bar" style={{ width: `${(c.count / 50) * 100}%` }}></div>
                  </div>
                  <span className="demo-count">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <h3>Popular Resources</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {stats?.popularResources.map(r => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td>{r.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {stats?.recentActivity.map(a => (
                <div key={a.id} className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <strong>{a.user}</strong> {a.action}
                    <span>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
        .admin-header { margin-bottom: 2rem; }
        .admin-header h1 { font-size: 2rem; color: #1a1a1a; margin-bottom: 0.5rem; }
        .admin-header p { color: #666; }
        
        .admin-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .admin-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #eee; }
        .admin-card.wide { grid-column: span 2; }
        .admin-card h3 { margin-bottom: 1.2rem; font-size: 1.1rem; color: #333; }

        .stat-card { display: flex; align-items: center; gap: 1rem; }
        .stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .stat-icon.blue { background: #e3f2fd; color: #1976d2; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.orange { background: #fff3e0; color: #ef6c00; }
        .stat-icon.red { background: #ffebee; color: #c62828; }
        .stat-info h3 { margin: 0; font-size: 1.5rem; }
        .stat-info p { margin: 0; color: #666; font-size: 0.85rem; }

        .demo-list { display: flex; flex-direction: column; gap: 1rem; }
        .demo-item { display: flex; align-items: center; gap: 1rem; }
        .demo-name { width: 80px; font-size: 0.9rem; }
        .demo-bar-wrap { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
        .demo-bar { height: 100%; background: #ffd700; border-radius: 4px; }
        .demo-count { width: 30px; font-size: 0.9rem; font-weight: bold; text-align: right; }

        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { text-align: left; font-size: 0.85rem; color: #888; padding-bottom: 0.8rem; border-bottom: 1px solid #eee; }
        .admin-table td { padding: 0.8rem 0; font-size: 0.9rem; border-bottom: 1px solid #f9f9f9; }

        .activity-list { display: flex; flex-direction: column; gap: 1.2rem; }
        .activity-item { display: flex; gap: 1rem; position: relative; }
        .activity-dot { width: 10px; height: 10px; border-radius: 50%; background: #ffd700; margin-top: 5px; flex-shrink: 0; }
        .activity-content { font-size: 0.9rem; color: #444; display: flex; flex-direction: column; }
        .activity-content span { font-size: 0.75rem; color: #999; margin-top: 2px; }

        .admin-error { padding: 4rem; text-align: center; font-size: 1.2rem; color: #c62828; }

        @media (max-width: 1024px) {
          .admin-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .admin-grid { grid-template-columns: 1fr; }
          .admin-card.wide { grid-column: span 1; }
        }
      `}</style>
    </Layout>
  )
}
