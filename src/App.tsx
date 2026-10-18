import { useRef, useState } from 'react'
import {
  Bell,
  Clock3,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Heart,
  Home,
  Library,
  ListMusic,
  Pause,
  Play,
  Repeat2,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  Waves,
} from 'lucide-react'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

type Track = {
  title: string
  artist: string
  album: string
  file: string
  audio: string
  image: string
}

const audioFiles = import.meta.glob('../songs/*.{mp3,m4a}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const coverFiles = import.meta.glob('../covers/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const trackMetadata = [
  { title: 'Char Baj Gaye', artist: 'Hard Kaur · Sachin-Jigar', album: 'F.A.L.T.U', file: "Char Baj Gaye Full Video - F.A.L.T.UJackky BhagnaniHard KaurRemo D'SouzaSachin-Jigar.mp3" },
  { title: 'Deva Shree Ganesha', artist: 'Ajay-Atul', album: 'Agneepath', file: 'Deva Shree Ganesha- Official 4K Video  Agneepath  Priyanka Chopra  Hrithik Roshan  Ganpati Song.mp3' },
  { title: 'Pehla Pyaar', artist: 'Armaan Malik', album: 'Kabir Singh', file: 'Full Song_ Pehla Pyaar  Kabir Singh  Shahid Kapoor, Kiara Advani  Armaan Malik  Vishal Mishra.mp3' },
  { title: 'I Am The Best', artist: 'Abhijeet', album: 'Phir Bhi Dil Hai Hindustani', file: 'I Am The Best  Phir Bhi Dil Hai Hindustani  Shah Rukh Khan.mp3' },
  { title: 'Ik Vaari Aa', artist: 'Arijit Singh', album: 'Raabta', file: 'Ik_Vaari_Aa_Lyrics_Raabta_Sushant_Singh_Rajput_Kriti_Sa_y2HsyzUulDI_140.mp3' },
  { title: 'Itni Si Baat Hain', artist: 'Arijit Singh · Antara Mitra', album: 'Azhar', file: 'Itni_Si_Baat_Hain_Full_Lyric_Video_Song_AZHAR_Emraan_Ha_z1Y8Ds7R_rU_140.mp3' },
  { title: 'Jo Bhi Kasmein', artist: 'Alka Yagnik · Udit Narayan', album: 'Raaz', file: 'Jo Bhi Kasmein Khai Thi Humne - Raaz  Bipasha Basu & Dino Morea  Alka Yagnik & Udit Narayan.mp3' },
  { title: 'Paisa Hai Toh', artist: 'Sachin-Jigar · Vishal Dadlani', album: 'Farzi', file: 'Paisa Hai Toh - Farzi Sachin-Jigar, Vishal Dadlani, MellowD Shahid Kapoor.mp3' },
  { title: 'Qaafirana', artist: 'Arijit Singh · Nikhita Gandhi', album: 'Kedarnath', file: 'Qaafirana  Kedarnath  Sushant Rajput  Sara Ali Khan  Arijit Singh & Nikhita  Amit Trivedi.mp3' },
  { title: 'Radha Nachegi', artist: 'Alka Yagnik', album: 'Saudagar', file: 'Radha Nachegi - Saudagar 128 Kbps.mp3' },
  { title: 'Same Beef', artist: 'Bohemia · Sidhu Moose Wala', album: 'Same Beef', file: 'Same Beef - Bohemia, Sidhu Moose Wala.m4a' },
  { title: 'Teri Yaadon Mein', artist: 'KK · Shreya Ghoshal', album: 'The Killer', file: 'Teri Yaadon Mein Lyrical Video  The Killer  K K, Shreya Ghosal  Emraan Hashmi, Nisha Kothari.mp3' },
  { title: 'Scam 1992 Theme', artist: 'Achint Thakkar', album: 'Scam 1992', file: 'THEME SONG  SCAM 1992 - The Harshad Mehta Story  SonyLIV Originals (1).mp3' },
  { title: 'Tuch Maajhi Aai Devaa', artist: 'Marathi devotional', album: 'Tuch Maajhi Aai Devaa', file: 'Tuch Maajhi Aai Devaa.mp3' },
  { title: 'Brothers Anthem', artist: 'Vishal Dadlani', album: 'Brothers', file: 'Vishal Dadlani - Brothers Anthem  Akshay Kumar, Sidharth Malhotra  Ajay-Atul (1).mp3' },
  { title: 'Zara Sa', artist: 'KK · Pritam', album: 'Jannat', file: 'Zara Sa  4K Music Video  Jannat  Emraan Hashmi  Sonal Chauhan  KK  Pritam  Sayeed Quadri.mp3' },
]

const tracks: Track[] = trackMetadata.map((track, index) => ({
  ...track,
  audio: audioFiles[`../songs/${track.file}`] ?? '',
  image: coverFiles[`../covers/track-${String(index + 1).padStart(2, '0')}.jpg`] ?? '',
}))

function loadTrackIndexes(key: string, fallback: number[]) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(key) ?? 'null')
    return Array.isArray(stored)
      ? stored.filter((index): index is number => Number.isInteger(index) && index >= 0 && index < tracks.length)
      : fallback
  } catch {
    return fallback
  }
}

type TrackListProps = {
  indexes: number[]
  likedIndexes: Set<number>
  activeTrack: number
  isPlaying: boolean
  onPlay: (index: number) => void
  onLike: (index: number) => void
}

function TrackList({ indexes, likedIndexes, activeTrack, isPlaying, onPlay, onLike }: TrackListProps) {
  return <div className="song-list">
    {indexes.map((index) => {
      const track = tracks[index]
      return <article className={`song-row ${activeTrack === index && isPlaying ? 'is-playing' : ''}`} key={track.file}>
        <button className="song-main" onClick={() => onPlay(index)} aria-label={`Play ${track.title}`}>
          <img src={track.image} alt="" />
          <span className="song-copy"><strong>{track.title}</strong><small>{track.artist} · {track.album}</small></span>
          <span className="song-row-play">{activeTrack === index && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</span>
        </button>
        <button className={`song-like ${likedIndexes.has(index) ? 'is-liked' : ''}`} onClick={() => onLike(index)} aria-label={likedIndexes.has(index) ? `Remove ${track.title} from liked songs` : `Like ${track.title}`} aria-pressed={likedIndexes.has(index)}>
          <Heart size={17} fill={likedIndexes.has(index) ? 'currentColor' : 'none'} />
        </button>
      </article>
    })}
  </div>
}

function PageHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <section className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></section>
}

function App() {
  return <BrowserRouter><SoundWaveApp /></BrowserRouter>
}

function SoundWaveApp() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTrack, setActiveTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioError, setAudioError] = useState('')
  const [likedIndexes, setLikedIndexes] = useState(() => new Set(loadTrackIndexes('soundwave-liked', [])))
  const [recentIndexes, setRecentIndexes] = useState(() => loadTrackIndexes('soundwave-recent', tracks.slice(0, 8).map((_, index) => index)))

  const currentTrack = tracks[activeTrack]
  const route = location.pathname
  const filteredTracks = tracks.filter((track) =>
    `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query.toLowerCase()),
  )
  const toggleLike = (index: number) => {
    setLikedIndexes((previous) => {
      const next = new Set(previous)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      window.localStorage.setItem('soundwave-liked', JSON.stringify([...next]))
      return next
    })
  }
  const selectTrack = (index: number) => {
    const track = tracks[index]
    const audio = audioRef.current
    setAudioError('')
    setActiveTrack(index)
    setElapsed(0)
    setDuration(0)
    setRecentIndexes((previous) => {
      const next = [index, ...previous.filter((item) => item !== index)]
      window.localStorage.setItem('soundwave-recent', JSON.stringify(next))
      return next
    })
    if (!audio || !track?.audio) {
      setAudioError('This song file could not be found.')
      setIsPlaying(false)
      return
    }
    audio.src = track.audio
    audio.currentTime = 0
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      setIsPlaying(false)
      setAudioError('Could not play this audio file in your browser.')
    })
  }
  const changeTrack = (direction: number) => {
    selectTrack((activeTrack + direction + tracks.length) % tracks.length)
  }
  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false)
        setAudioError('Could not play this audio file in your browser.')
      })
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
  const progress = duration ? (elapsed / duration) * 100 : 0

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="SoundWave home"><span className="brand-mark"><Waves size={22} /></span><strong>SoundWave</strong></Link>
        <p className="side-label">MENU</p>
        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'selected' : ''}`}><Home size={18} />Home</NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'selected' : ''}`}><Search size={18} />Search</NavLink>
          <NavLink to="/library" className={({ isActive }) => `nav-link ${isActive ? 'selected' : ''}`}><Library size={18} />Library</NavLink>
        </nav>
        <div className="library-heading"><span className="side-label">YOUR LIBRARY</span><button aria-label="Add to library"><CirclePlus size={18} /></button></div>
        <nav className="library-links" aria-label="Saved music">
          <NavLink to="/liked" className={({ isActive }) => `nav-link ${isActive ? 'selected' : ''}`}><Heart size={17} fill="currentColor" />Liked Songs</NavLink>
          <NavLink to="/recent" className={({ isActive }) => `nav-link ${isActive ? 'selected' : ''}`}><Clock3 size={17} />Recently played</NavLink>
        </nav>
        <div className="sidebar-bottom"><span className="ready-dot" />Ready when you are</div>
      </aside>

      <main className="main-panel" id="home">
        <header className="topbar">
          <div className="topbar-left">
            <div className="history-buttons"><button aria-label="Go back" onClick={() => navigate(-1)}><ChevronLeft size={17} /></button><button aria-label="Go forward" onClick={() => navigate(1)}><ChevronRight size={17} /></button></div>
            <label className="search-control"><Search size={17} /><input value={query} onFocus={() => navigate('/search')} onChange={(event) => { setQuery(event.target.value); if (route !== '/search') navigate('/search') }} placeholder="What do you want to play?" aria-label="Search music" /></label>
          </div>
          <div className="topbar-actions"><button aria-label="Notifications"><Bell size={18} /></button><button className="profile-avatar" aria-label="Profile">V</button></div>
        </header>

        <div className="content-scroll">
          <Routes>
            <Route path="/" element={<>
              <section className="home-heading">
                <div><p className="eyebrow">TUESDAY, YOUR WAY</p><h1>Good evening</h1></div>
                <div className="category-tabs" role="tablist" aria-label="Browse category">
                  {['All', 'Music', 'Podcasts'].map((item) => <button role="tab" aria-selected={category === item} className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}
                </div>
              </section>
              {category === 'Podcasts' ? <div className="empty-state"><h2>No podcasts yet</h2><p>Your music is ready whenever you are.</p></div> : <>
                <section className="recent-grid" aria-label="Quick picks">
                  {recentIndexes.slice(0, 8).map((index) => <button className="recent-tile" key={tracks[index].file} onClick={() => selectTrack(index)}>
                    <img src={tracks[index].image} alt="" /><strong>{tracks[index].title}</strong><span className="recent-play"><Play size={14} fill="currentColor" /></span>
                  </button>)}
                </section>
                <section className="mix-section" id="made-for-you">
                  <div className="section-heading"><div><p className="eyebrow">A LITTLE BIT OF EVERYTHING</p><h2>Made for your day</h2></div><Link className="see-all" to="/playlist/today">Show all <span>→</span></Link></div>
                  <div className="album-grid">
                    {tracks.slice(0, 6).map((track, index) => <article className="album-card" key={track.file}>
                      <button className="album-main" onClick={() => selectTrack(index)} aria-label={`Play ${track.album}`}><img src={track.image} alt="" /><strong>{track.album}</strong><small>{track.artist} · {track.title}</small><span className="album-play"><Play size={18} fill="currentColor" /></span></button>
                    </article>)}
                  </div>
                </section>
                <section className="quick-section"><div className="section-heading"><h2>Jump back in</h2><Link className="see-all" to="/recent">Show all <span>→</span></Link></div><TrackList indexes={recentIndexes.slice(0, 6)} likedIndexes={likedIndexes} activeTrack={activeTrack} isPlaying={isPlaying} onPlay={selectTrack} onLike={toggleLike} /></section>
              </>}
            </>} />
            <Route path="/search" element={<>
              <PageHeading eyebrow="FIND YOUR NEXT FAVORITE" title="Search" />
              {query ? <TrackList indexes={filteredTracks.map((track) => tracks.indexOf(track))} likedIndexes={likedIndexes} activeTrack={activeTrack} isPlaying={isPlaying} onPlay={selectTrack} onLike={toggleLike} /> : <div className="empty-state"><Search size={28} /><h2>Search your music</h2><p>Find a song, artist, or album from your collection.</p></div>}
              {query && filteredTracks.length === 0 && <div className="empty-state"><h2>No matches found</h2><p>Try another song, artist, or album.</p></div>}
            </>} />
            <Route path="/library" element={<><PageHeading eyebrow="YOUR COLLECTION" title="Library" /><TrackList indexes={tracks.map((_, index) => index)} likedIndexes={likedIndexes} activeTrack={activeTrack} isPlaying={isPlaying} onPlay={selectTrack} onLike={toggleLike} /></>} />
            <Route path="/liked" element={<><PageHeading eyebrow="SAVED FOR LATER" title="Liked Songs" />{likedIndexes.size ? <TrackList indexes={tracks.map((_, index) => index).filter((index) => likedIndexes.has(index))} likedIndexes={likedIndexes} activeTrack={activeTrack} isPlaying={isPlaying} onPlay={selectTrack} onLike={toggleLike} /> : <div className="empty-state"><Heart size={28} /><h2>Songs you like will show up here</h2><p>Tap the heart beside any song to save it to your collection.</p></div>}</>} />
            <Route path="/recent" element={<><PageHeading eyebrow="YOUR LISTENING HISTORY" title="Recently played" />{recentIndexes.length ? <TrackList indexes={recentIndexes} likedIndexes={likedIndexes} activeTrack={activeTrack} isPlaying={isPlaying} onPlay={selectTrack} onLike={toggleLike} /> : <div className="empty-state"><Clock3 size={28} /><h2>Your recent listens will show up here</h2><p>Play a song to start building your listening history.</p></div>}</>} />
            <Route path="/playlist/today" element={<><PageHeading eyebrow="MADE FOR YOUR DAY" title="Your daily mix" /><TrackList indexes={tracks.slice(0, 6).map((_, index) => index)} likedIndexes={likedIndexes} activeTrack={activeTrack} isPlaying={isPlaying} onPlay={selectTrack} onLike={toggleLike} /></>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <footer className="player-bar">
        <div className="now-playing"><img src={currentTrack.image} alt="" /><div className="now-playing-copy"><strong>{currentTrack.title}</strong><small className={audioError ? 'player-error' : ''}>{audioError || currentTrack.artist}</small></div><button className={`heart-button ${likedIndexes.has(activeTrack) ? 'liked' : ''}`} aria-label={likedIndexes.has(activeTrack) ? 'Unlike track' : 'Like track'} onClick={() => toggleLike(activeTrack)}><Heart size={17} fill={likedIndexes.has(activeTrack) ? 'currentColor' : 'none'} /></button></div>
        <div className="player-center"><span className="player-time">{formatTime(elapsed)}</span><div className="player-controls"><button aria-label="Shuffle"><Shuffle size={16} /></button><button aria-label="Previous track" onClick={() => changeTrack(-1)}><SkipBack size={17} /></button><button className="play-button" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlayback}>{isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button><button aria-label="Next track" onClick={() => changeTrack(1)}><SkipForward size={17} /></button><button aria-label="Repeat"><Repeat2 size={16} /></button></div><span className="player-time">{formatTime(duration)}</span></div>
        <div className="player-extra"><button aria-label="Mini player"><Play size={15} /></button><button aria-label="Queue"><ListMusic size={17} /></button><button aria-label="Volume"><Volume2 size={17} /></button><input type="range" min="0" max="100" defaultValue="72" aria-label="Volume" onChange={(event) => { if (audioRef.current) audioRef.current.volume = Number(event.target.value) / 100 }} /></div>
        <input className="progress-range" type="range" min="0" max={duration || 1} value={elapsed} aria-label="Track progress" style={{ background: `linear-gradient(to right, var(--green) 0%, var(--green) ${progress}%, #424346 ${progress}%, #424346 100%)` }} onChange={(event) => { const time = Number(event.target.value); setElapsed(time); if (audioRef.current) audioRef.current.currentTime = time }} />
        <audio ref={audioRef} src={currentTrack.audio} preload="metadata" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onEnded={() => changeTrack(1)} onError={() => { setIsPlaying(false); setAudioError('Unable to load this song file.') }} />
      </footer>
    </div>
  )
}

export default App
