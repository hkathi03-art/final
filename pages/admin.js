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
        supabase.from('profiles').select('id', { count: 'estimated', head: true }),
        supabase.from('student_listings').select('id', { count: 'estimated', head: true }),
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

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="dash-body admin-body">
      <div className="admin-nav-row">
        <button className="btn btn-ghost btn-sm" onClick={goBack}>
          <i className="fas fa-arrow-left" /> Back
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => router.push('/dashboard')}>
          <i className="fas fa-gauge" /> Dashboard
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => router.push('/')}>
          <i className="fas fa-house" /> Home
        </button>
      </div>

      <div>
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
  )
}
