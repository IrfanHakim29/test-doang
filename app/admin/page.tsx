'use client'

import { useState, useEffect } from 'react'

interface Link {
  id: string
  label: string
  created_at: string
  visit_count: number
  last_visit: string | null
}

interface Visit {
  id: number
  link_id: string
  label?: string
  visitor_name: string
  visitor_email: string
  ip_address: string
  user_agent: string
  device_type: string
  browser: string
  os: string
  screen_width: number
  screen_height: number
  language: string
  referrer: string
  city: string
  country: string
  isp: string
  latitude: number | null
  longitude: number | null
  visited_at: string
  duration_seconds: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'links' | 'logs'>('links')
  const [links, setLinks] = useState<Link[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedLink, setSelectedLink] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    fetchLinks()
    fetchLogs()
  }, [])

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links')
      const data = await res.json()
      setLinks(data)
    } catch (error) {
      console.error('Failed to fetch links')
    }
    setLoading(false)
  }

  const fetchLogs = async (linkId?: string) => {
    try {
      const url = linkId ? `/api/logs?linkId=${linkId}` : '/api/logs'
      const res = await fetch(url)
      const data = await res.json()
      setVisits(data)
    } catch (error) {
      console.error('Failed to fetch logs')
    }
  }

  const createLink = async () => {
    if (!newLabel.trim()) return
    
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel }),
      })
      
      if (res.ok) {
        setNewLabel('')
        setShowModal(false)
        fetchLinks()
      }
    } catch (error) {
      console.error('Failed to create link')
    }
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Yakin hapus link ini? Semua log kunjungan juga akan dihapus.')) return
    
    try {
      await fetch('/api/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      fetchLinks()
      fetchLogs()
    } catch (error) {
      console.error('Failed to delete link')
    }
  }

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(`${baseUrl}/v/${id}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} detik`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} menit ${secs} detik`
  }

  const totalVisits = links.reduce((sum, l) => sum + l.visit_count, 0)
  const uniqueDevices = new Set(visits.map(v => v.ip_address)).size

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">🎯 Link Tracker</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Buat Link Baru
        </button>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{links.length}</div>
          <div className="stat-label">Total Link</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalVisits}</div>
          <div className="stat-label">Total Kunjungan</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{uniqueDevices}</div>
          <div className="stat-label">Perangkat Unik</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => { setActiveTab('links'); setSelectedLink(null); fetchLogs(); }}
        >
          📎 Link Saya
        </button>
        <button 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => { setActiveTab('logs'); setSelectedLink(null); fetchLogs(); }}
        >
          📊 Log Kunjungan
        </button>
      </div>

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div>
          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : links.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📎</div>
              <p>Belum ada link. Buat link pertama kamu!</p>
            </div>
          ) : (
            links.map(link => (
              <div key={link.id} className="card fade-in">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{link.label}</h3>
                    <p className="card-subtitle">
                      Dibuat: {formatDate(link.created_at)} • 
                      {link.visit_count} kunjungan
                      {link.last_visit && ` • Terakhir: ${formatDate(link.last_visit)}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => { setActiveTab('logs'); setSelectedLink(link.id); fetchLogs(link.id); }}
                    >
                      Lihat Log
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteLink(link.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="copy-link">
                  <input 
                    type="text" 
                    value={`${baseUrl}/v/${link.id}`}
                    readOnly
                  />
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => copyToClipboard(link.id)}
                  >
                    {copiedId === link.id ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  💡 Tambahkan <code>?n=NamaOrang</code> untuk identifikasi. Contoh: <code>/v/{link.id}?n=Budi</code>
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div>
          {selectedLink && (
            <div style={{ marginBottom: '1rem' }}>
              <button 
                className="btn btn-sm" 
                style={{ background: 'var(--bg-secondary)' }}
                onClick={() => { setSelectedLink(null); fetchLogs(); }}
              >
                ← Lihat Semua Log
              </button>
              <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
                Menampilkan log untuk: <strong>{links.find(l => l.id === selectedLink)?.label}</strong>
              </span>
            </div>
          )}
          
          {visits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>Belum ada kunjungan.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Waktu</th>
                    {!selectedLink && <th>Link</th>}
                    <th>Pengunjung</th>
                    <th>Device</th>
                    <th>Browser/OS</th>
                    <th>Lokasi</th>
                    <th>ISP</th>
                    <th>Durasi</th>
                    <th>Layar</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map(visit => (
                    <tr key={visit.id}>
                      <td>
                        <div>{formatDate(visit.visited_at)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {visit.referrer !== 'Direct' ? `dari ${visit.referrer}` : 'Direct'}
                        </div>
                      </td>
                      {!selectedLink && (
                        <td>
                          <strong>{visit.label || visit.link_id}</strong>
                        </td>
                      )}
                      <td>
                        <strong style={{ color: visit.visitor_name === 'Anonymous' ? 'var(--text-secondary)' : 'var(--accent)' }}>
                          {visit.visitor_name}
                        </strong>
                        {visit.visitor_email && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            📧 {visit.visitor_email}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${visit.device_type.toLowerCase()}`}>
                          {visit.device_type}
                        </span>
                      </td>
                      <td>
                        <div>{visit.browser}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{visit.os}</div>
                      </td>
                      <td>
                        <div>{visit.city}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{visit.country}</div>
                        {visit.latitude && visit.longitude && (
                          <a 
                            href={`https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.75rem', color: 'var(--primary)' }}
                          >
                            📍 Lihat di Maps
                          </a>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>{visit.isp}</div>
                      </td>
                      <td>{formatDuration(visit.duration_seconds)}</td>
                      <td>{visit.screen_width}x{visit.screen_height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Link Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Buat Link Baru</h2>
            <div className="form-group">
              <label className="form-label">Label / Nama Target</label>
              <input
                type="text"
                className="form-input"
                placeholder="contoh: Link untuk Si A"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createLink()}
                autoFocus
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Label ini untuk kamu saja, tidak terlihat oleh pengunjung
              </p>
            </div>
            <div className="form-actions">
              <button className="btn" style={{ background: 'var(--bg-secondary)' }} onClick={() => setShowModal(false)}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={createLink}>
                Buat Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
