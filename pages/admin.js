import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { supabase } from '../lib/supabase'
import { MENTORS } from '../lib/data'

function toInt(value) {
  return Number.isFinite(value) ? value : 0
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [busy, setBusy] = useState(true)
  const [profilesCount, setProfilesCount] = useState(0)
  const [listingCount, setListingCount] = useState(0)
  const [recentProfiles, setRecentProfiles] = useState([])
  const [recentListings, setRecentListings] = useState([])
  const [countryMix, setCountryMix] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
      return
    }

    loadOversightData()
  }, [loading, user])

  const staffView = useMemo(() => {
    if (!user?.email) return false
    const email = user.email.toLowerCase()
    const major = (user.major || '').toLowerCase()
    return (
      (email.endsWith('@bowiestate.edu') && !email.includes('@students.')) ||
      major.includes('staff') ||
      major.includes('faculty')
    )
  }, [user])

  async function loadOversightData() {
    setBusy(true)
    setError('')
    try {
      const [
        profilesCountRes,
        listingsCountRes,
        profilesRes,
        listingsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('student_listings').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, full_name, email, major, country, created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('student_listings').select('id, title, location, price, user_id, created_at').order('created_at', { ascending: false }).limit(8),
      ])

      if (profilesCountRes.error) throw profilesCountRes.error
      if (listingsCountRes.error) throw listingsCountRes.error
      if (profilesRes.error) throw profilesRes.error
      if (listingsRes.error) throw listingsRes.error

      const loadedProfiles = profilesRes.data || []
      const countries = loadedProfiles.reduce((acc, profile) => {
        const c = (profile.country || 'Unknown').trim() || 'Unknown'
        acc[c] = (acc[c] || 0) + 1
        return acc
      }, {})

      setProfilesCount(toInt(profilesCountRes.count))
      setListingCount(toInt(listingsCountRes.count))
      setRecentProfiles(loadedProfiles)
      setRecentListings(listingsRes.data || [])
      setCountryMix(Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 6))
    } catch (e) {
      setError(e.message || 'Unable to load admin oversight data.')
    } finally {
      setBusy(false)
    }
  }

  if (!user) return null

  return (
    <div className="main-wrap">
      <div className="dash-body admin-body">
        <div className="dash-welcome">
          <h1>Admin Dashboard <span>Oversight Hub</span></h1>
          <p>
            Monitor student engagement, housing activity, and mentorship capacity in one place.
          </p>
        </div>

        {!staffView && (
          <div className="alert-bar admin-note">
            <i className="fas fa-user-shield" />
            <div>
              <strong>Read-only preview:</strong> This page is intended for staff and faculty oversight accounts.
            </div>
          </div>
        )}

        {error && (
          <div className="error-box" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        <div className="kpi-grid admin-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-val">{profilesCount}</div>
            <div className="kpi-lbl">Registered Students</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val">{listingCount}</div>
            <div className="kpi-lbl">Active Housing Listings</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val">{MENTORS.length}</div>
            <div className="kpi-lbl">Mentor Capacity</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val">{countryMix.length}</div>
            <div className="kpi-lbl">Countries Represented (Top)</div>
          </div>
        </div>

        <div className="admin-grid">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h3>Latest Student Profiles</h3>
              <button className="btn btn-ghost btn-sm" onClick={loadOversightData} disabled={busy}>
                <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`} /> Refresh
              </button>
            </div>

            {recentProfiles.length === 0 ? (
              <p className="admin-empty">{busy ? 'Loading profile records...' : 'No profile records found yet.'}</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Major</th>
                      <th>Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProfiles.map((profile) => (
                      <tr key={profile.id}>
                        <td>
                          <div className="admin-name-cell">
                            <strong>{profile.full_name || 'No name'}</strong>
                            <span>{profile.email}</span>
                          </div>
                        </td>
                        <td>{profile.major || 'Unspecified'}</td>
                        <td>{profile.country || 'Unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h3>Housing Listings Requiring Review</h3>
            </div>

            {recentListings.length === 0 ? (
              <p className="admin-empty">{busy ? 'Loading listings...' : 'No listings to review yet.'}</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Listing</th>
                      <th>Location</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentListings.map((listing) => (
                      <tr key={listing.id}>
                        <td>{listing.title || 'Untitled listing'}</td>
                        <td>{listing.location || 'Unknown'}</td>
                        <td>${toInt(listing.price).toLocaleString()}/mo</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="admin-panel" style={{ marginTop: '1rem' }}>
          <div className="admin-panel-head">
            <h3>Student Country Distribution (Top 6)</h3>
          </div>
          {countryMix.length === 0 ? (
            <p className="admin-empty">{busy ? 'Analyzing country mix...' : 'No country information available yet.'}</p>
          ) : (
            <div className="country-pills">
              {countryMix.map(([country, count]) => (
                <div key={country} className="country-pill">
                  <span>{country}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
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
