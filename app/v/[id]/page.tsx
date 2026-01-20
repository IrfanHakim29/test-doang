'use client'

import { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import gsap from 'gsap'

interface GoogleUser {
  email: string
  name: string
  picture: string
}

// Beautiful gallery images with categories - Nature & Water theme
const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', title: 'Puncak Gunung', author: 'Alex Chen', category: '🏔️ Gunung' },
  { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', title: 'Hutan Tropis', author: 'Maria Santos', category: '🌲 Hutan' },
  { src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600', title: 'Jalan Setapak', author: 'James Wilson', category: '🌲 Hutan' },
  { src: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600', title: 'Air Terjun', author: 'Emma Liu', category: '💧 Air' },
  { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600', title: 'Danau Cermin', author: 'David Kim', category: '💧 Air' },
  { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600', title: 'Bukit Kabut', author: 'Sarah Johnson', category: '🌿 Alam' },
  { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600', title: 'Lembah Hijau', author: 'Michael Brown', category: '🌿 Alam' },
  { src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600', title: 'Padang Rumput', author: 'Lisa Anderson', category: '🌾 Savana' },
  { src: 'https://images.unsplash.com/photo-1465795451264-6f8f0f9f5e90?w=600', title: 'Sunset Gurun', author: 'Chris Taylor', category: '🏜️ Gurun' },
  { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', title: 'Angin Laut', author: 'Nina Patel', category: '🌊 Laut' },
  { src: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600', title: 'Surga Tropis', author: 'Tom Garcia', category: '🏝️ Pantai' },
  { src: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=600', title: 'Puncak Salju', author: 'Anna White', category: '🏔️ Gunung' },
  { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', title: 'Pantai Pasir', author: 'Ryan Lee', category: '🏝️ Pantai' },
  { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600', title: 'Malam Berbintang', author: 'Kate Miller', category: '🌙 Malam' },
  { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', title: 'Pegunungan Alpen', author: 'John Davis', category: '🏔️ Gunung' },
  { src: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=600', title: 'Cakrawala', author: 'Emily Clark', category: '🌅 Sunset' },
  { src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600', title: 'Ombak Besar', author: 'Jake Wilson', category: '🌊 Laut' },
  { src: 'https://images.unsplash.com/photo-1505820013142-f86a3439c5b2?w=600', title: 'Aurora Borealis', author: 'Erik Hansen', category: '🌙 Malam' },
]

export default function GalleryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const linkId = params.id as string
  
  const [showConsent, setShowConsent] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<typeof galleryImages[0] | null>(null)
  const [visitId, setVisitId] = useState<number | null>(null)
  const [loginMethod, setLoginMethod] = useState<'google' | 'form'>('google')
  const [hasGoogleClientId, setHasGoogleClientId] = useState(false)
  
  const startTime = useRef<number>(Date.now())
  const consentRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const lightboxRef = useRef<HTMLDivElement>(null)

  // Check for pre-filled email from URL parameter
  useEffect(() => {
    const urlEmail = searchParams.get('e') || searchParams.get('email')
    const urlName = searchParams.get('n') || searchParams.get('name')
    
    if (urlEmail) {
      // Auto-submit if email is in URL (for research - pre-identified users)
      setEmail(urlEmail)
      setName(urlName || urlEmail.split('@')[0])
      setAgreed(true)
      
      // Auto-submit after a brief delay
      setTimeout(() => {
        handleAutoSubmit(urlEmail, urlName || urlEmail.split('@')[0])
      }, 500)
    }
    
    // Check if Google Client ID is configured
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    setHasGoogleClientId(!!clientId && clientId.length > 0)
  }, [searchParams])

  // Handle Google Sign-In success
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        const decoded = jwtDecode<GoogleUser>(credentialResponse.credential)
        setEmail(decoded.email)
        setName(decoded.name)
        setIsLoading(true)
        
        // Auto-submit with Google data
        await submitTracking(decoded.email, decoded.name)
      } catch (error) {
        console.error('Failed to decode Google credential')
        setLoginMethod('form')
      }
    }
  }

  // Handle auto-submit from URL parameters
  const handleAutoSubmit = async (autoEmail: string, autoName: string) => {
    setIsLoading(true)
    await submitTracking(autoEmail, autoName)
  }

  // Shared tracking submit function
  const submitTracking = async (submitEmail: string, submitName: string) => {
    // Start animation immediately
    gsap.to(consentRef.current, {
      y: -50, opacity: 0, scale: 0.9, duration: 0.5, ease: 'power2.in',
      onComplete: () => setShowConsent(false)
    })
    
    // Get user agent and device info
    const ua = navigator.userAgent
    
    let deviceType = 'Desktop'
    if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile'
    else if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet'
    
    let browser = 'Unknown'
    if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Edg')) browser = 'Edge'
    else if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Safari')) browser = 'Safari'
    
    let os = 'Unknown'
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'MacOS'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iOS') || ua.includes('iPhone')) os = 'iOS'
    else if (ua.includes('Linux')) os = 'Linux'

    // Try to get GPS (async)
    const location = await getLocation()

    // Send tracking data
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link_id: linkId,
          visitor_name: submitName || submitEmail.split('@')[0],
          visitor_email: submitEmail,
          user_agent: ua,
          device_type: deviceType,
          browser,
          os,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          language: navigator.language,
          referrer: document.referrer || 'Direct',
          latitude: location.lat,
          longitude: location.lng,
        }),
      })
      const data = await response.json()
      if (data.visitId) setVisitId(data.visitId)
    } catch (e) { 
      console.log('Tracking sent') 
    }
    setIsLoading(false)
  }

  // Advanced GSAP Consent Form Animation
  useLayoutEffect(() => {
    if (showConsent && consentRef.current) {
      const tl = gsap.timeline()
      
      // Background circles with floating effect
      tl.fromTo('.consent-bg-circle', 
        { scale: 0, opacity: 0, rotation: -180 }, 
        { scale: 1, opacity: 0.4, rotation: 0, duration: 2, stagger: 0.3, ease: 'elastic.out(1, 0.5)' }
      )
      
      // Card entrance with 3D effect
      tl.fromTo(consentRef.current, 
        { y: 100, opacity: 0, scale: 0.8, rotateX: 15 }, 
        { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1, ease: 'power4.out' }, 
        '-=1.5'
      )
      
      // Icon bounce
      tl.fromTo('.consent-icon', 
        { scale: 0, rotation: -45 }, 
        { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1.2, 0.5)' }, 
        '-=0.6'
      )
      
      // Title with letter animation
      tl.fromTo('.consent-title', 
        { y: 50, opacity: 0, skewY: 3 }, 
        { y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: 'power3.out' }, 
        '-=0.4'
      )
      
      // Subtitle fade
      tl.fromTo('.consent-subtitle', 
        { y: 30, opacity: 0, filter: 'blur(10px)' }, 
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, 
        '-=0.3'
      )
      
      // Form fields stagger with slide
      tl.fromTo('.form-group', 
        { x: -50, opacity: 0, scale: 0.95 }, 
        { x: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.4)' }, 
        '-=0.2'
      )
      
      // Google button animation
      tl.fromTo('.google-login-wrapper',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.3'
      )
      
      // Button pulse entrance
      tl.fromTo('.consent-btn', 
        { y: 30, opacity: 0, scale: 0.8 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.6)' }, 
        '-=0.1'
      )
      
      // Privacy text
      tl.fromTo('.consent-privacy', 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 
        '-=0.2'
      )
      
      // Continuous floating animation for background circles
      gsap.to('.circle-1', { y: -20, x: 10, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.circle-2', { y: 15, x: -15, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 })
      gsap.to('.circle-3', { scale: 1.1, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 })
    }
  }, [showConsent])

  // Advanced Gallery GSAP Animation
  useLayoutEffect(() => {
    if (!showConsent && galleryRef.current) {
      const tl = gsap.timeline()
      
      // Background blobs
      gsap.to('.blob-1', { y: -30, x: 20, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.blob-2', { y: 20, x: -30, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 })
      
      // Header slide down with bounce
      tl.fromTo(headerRef.current, 
        { y: -150, opacity: 0, scale: 0.9 }, 
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.8)' }
      )
      
      // Title words with 3D flip effect
      tl.fromTo('.gallery-title-word', 
        { y: 100, opacity: 0, rotateX: -90, transformOrigin: 'center bottom' }, 
        { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.15, ease: 'back.out(2)' }, 
        '-=0.8'
      )
      
      // Tagline with blur fade
      tl.fromTo('.gallery-tagline', 
        { y: 40, opacity: 0, filter: 'blur(15px)', scale: 0.9 }, 
        { y: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.8, ease: 'power3.out' }, 
        '-=0.5'
      )
      
      // Category pills explosion effect
      tl.fromTo('.category-pill', 
        { scale: 0, opacity: 0, rotation: -10 }, 
        { scale: 1, opacity: 1, rotation: 0, duration: 0.5, stagger: 0.08, ease: 'elastic.out(1.2, 0.6)' }, 
        '-=0.3'
      )
    }
  }, [showConsent])

  // Card load animation with stagger cascade
  const handleImageLoad = (index: number) => {
    const card = cardsRef.current[index]
    if (card) {
      const row = Math.floor(index / 5)
      const col = index % 5
      const delay = (row * 0.1) + (col * 0.08)
      
      gsap.fromTo(card, 
        { y: 80, opacity: 0, scale: 0.85, rotateY: 15 }, 
        { y: 0, opacity: 1, scale: 1, rotateY: 0, duration: 0.9, ease: 'power3.out', delay }
      )
    }
  }

  // Lightbox animation
  useEffect(() => {
    if (lightboxImage && lightboxRef.current) {
      const tl = gsap.timeline()
      tl.fromTo(lightboxRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
      tl.fromTo('.lightbox-image', 
        { scale: 0.6, opacity: 0, y: 80, rotateX: 15 }, 
        { scale: 1, opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: 'back.out(1.7)' }, 
        '-=0.1'
      )
      tl.fromTo('.lightbox-info', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 
        '-=0.2'
      )
    }
  }, [lightboxImage])

  // Advanced card hover animation
  const handleCardHover = (index: number, isEntering: boolean) => {
    const card = cardsRef.current[index]
    if (card) {
      if (isEntering) {
        gsap.to(card, { y: -15, scale: 1.05, duration: 0.4, ease: 'power2.out' })
        gsap.to(card.querySelector('.card-overlay'), { opacity: 1, duration: 0.3 })
        gsap.to(card.querySelector('.overlay-content'), { y: 0, duration: 0.4, ease: 'power2.out' })
        gsap.to(card.querySelector('img'), { scale: 1.12, duration: 0.6, ease: 'power2.out' })
        gsap.to(card.querySelector('.card-actions'), { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' })
      } else {
        gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: 'power2.out' })
        gsap.to(card.querySelector('.card-overlay'), { opacity: 0, duration: 0.3 })
        gsap.to(card.querySelector('.overlay-content'), { y: 15, duration: 0.4, ease: 'power2.out' })
        gsap.to(card.querySelector('img'), { scale: 1, duration: 0.6, ease: 'power2.out' })
        gsap.to(card.querySelector('.card-actions'), { opacity: 0, y: -10, duration: 0.3 })
      }
    }
  }

  // Get GPS location - will fallback to IP-based on server if denied
  const getLocation = (): Promise<{lat: number | null, lng: number | null}> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { 
        // No geolocation API - server will use IP-based location
        resolve({ lat: null, lng: null })
        return 
      }
      
      // Try to get GPS with short timeout
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          // User denied or error - that's OK, server will use IP-based location
          resolve({ lat: null, lng: null })
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      )
    })
  }

  const handleSubmit = async () => {
    if (!agreed || !email) return
    setIsLoading(true)
    await submitTracking(email, name)
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (visitId) {
        navigator.sendBeacon('/api/track/duration', JSON.stringify({ visitId, duration: Math.floor((Date.now() - startTime.current) / 1000) }))
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [visitId])

  const closeLightbox = () => {
    const tl = gsap.timeline()
    tl.to('.lightbox-info', { y: 20, opacity: 0, duration: 0.2, ease: 'power2.in' })
    tl.to('.lightbox-image', { scale: 0.7, opacity: 0, y: 50, rotateX: 10, duration: 0.35, ease: 'power2.in' }, '-=0.1')
    tl.to(lightboxRef.current, { opacity: 0, duration: 0.25, onComplete: () => setLightboxImage(null) }, '-=0.15')
  }

  const categories = [...new Set(galleryImages.map(img => img.category))]

  if (showConsent) {
    return (
      <div className="consent-wrapper">
        <div className="consent-bg">
          <div className="consent-bg-circle circle-1"></div>
          <div className="consent-bg-circle circle-2"></div>
          <div className="consent-bg-circle circle-3"></div>
        </div>
        <div className="consent-card" ref={consentRef}>
          <div className="consent-icon">🌿</div>
          <h1 className="consent-title">Selamat Datang</h1>
          <p className="consent-subtitle">Masuk untuk melihat koleksi foto alam yang menakjubkan</p>
          
          <div className="consent-form">
            {/* Google Sign-In Button - Primary Method */}
            {hasGoogleClientId && loginMethod === 'google' && (
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setLoginMethod('form')}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="pill"
                  width="300"
                />
                <p className="login-toggle" onClick={() => setLoginMethod('form')}>
                  atau <span className="toggle-link">masuk dengan email manual</span>
                </p>
              </div>
            )}
            
            {/* Manual Form - Fallback Method */}
            {(!hasGoogleClientId || loginMethod === 'form') && (
              <>
                <div className="form-group">
                  <label className="form-label">🌸 Nama (opsional)</label>
                  <input type="text" className="form-input" placeholder="Nama Anda" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">📧 Email <span className="required">*</span></label>
                  <input type="email" className="form-input" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <span className="checkbox-custom">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    <span className="checkbox-text">Saya setuju menyimpan email sebagai history akses gallery</span>
                  </label>
                </div>
                <button className={`consent-btn ${agreed && email ? 'active' : ''}`} onClick={handleSubmit} disabled={!agreed || !email || isLoading}>
                  {isLoading ? <div className="loading-spinner"></div> : '🍃 Jelajahi Gallery →'}
                </button>
                {hasGoogleClientId && (
                  <p className="login-toggle" onClick={() => setLoginMethod('google')}>
                    atau <span className="toggle-link">masuk dengan Google</span>
                  </p>
                )}
              </>
            )}
            
            {isLoading && loginMethod === 'google' && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Memuat gallery...</p>
              </div>
            )}
          </div>
          <p className="consent-privacy">🔒 Data Anda aman & tidak akan dibagikan</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="gallery-wrapper" ref={galleryRef}>
        <div className="gallery-bg">
          <div className="bg-blob blob-1"></div>
          <div className="bg-blob blob-2"></div>
        </div>
        <header className="gallery-header" ref={headerRef}>
          <div className="header-content">
            <h1 className="gallery-title">
              {'Nature Gallery'.split(' ').map((word, i) => (
                <span key={i} className="gallery-title-word">{word} </span>
              ))}
            </h1>
            <p className="gallery-tagline">✨ Koleksi foto alam menakjubkan dari seluruh dunia 🌍</p>
            <div className="category-pills">
              {categories.map((cat, i) => (
                <span key={i} className="category-pill">{cat}</span>
              ))}
            </div>
          </div>
        </header>
        <div className="pinterest-grid">
          {galleryImages.map((img, i) => (
            <div 
              key={i} 
              ref={el => { cardsRef.current[i] = el }} 
              className="pinterest-card" 
              onClick={() => setLightboxImage(img)}
              onMouseEnter={() => handleCardHover(i, true)} 
              onMouseLeave={() => handleCardHover(i, false)} 
              style={{ opacity: 0 }}
            >
              <div className="card-image-wrapper">
                <img src={img.src} alt={img.title} loading="lazy" onLoad={() => handleImageLoad(i)} />
                <div className="card-overlay">
                  <div className="overlay-content">
                    <span className="card-category">{img.category}</span>
                    <h3 className="card-title">{img.title}</h3>
                    <p className="card-author">
                      <span className="author-avatar"></span>
                      {img.author}
                    </p>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="action-btn" onClick={(e) => { e.stopPropagation(); }}>♡</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <footer className="gallery-footer">
          <p>🌿 Made with ❤️ | Enjoy the beauty of nature 🌺</p>
        </footer>
      </div>
      {lightboxImage && (
        <div className="lightbox-overlay" ref={lightboxRef} onClick={closeLightbox}>
          <div className="lightbox-container" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>
            <img src={lightboxImage.src.replace('w=600', 'w=1400')} alt={lightboxImage.title} className="lightbox-image" />
            <div className="lightbox-info">
              <h2>{lightboxImage.title}</h2>
              <p>📸 by {lightboxImage.author} | {lightboxImage.category}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
