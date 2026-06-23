function Roundel() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M50 16 A34 34 0 0 1 84 50 L50 50 Z" fill="currentColor" opacity="0.9" />
      <path d="M16 50 A34 34 0 0 1 50 16 L50 50 Z" fill="currentColor" opacity="0.28" />
      <path d="M50 84 A34 34 0 0 1 16 50 L50 50 Z" fill="currentColor" opacity="0.9" />
      <path d="M84 50 A34 34 0 0 1 50 84 L50 50 Z" fill="currentColor" opacity="0.28" />
    </svg>
  )
}

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav__group nav__group--mobilehide">
        <a className="nav__link" href="#overview" data-magnet>
          Features
        </a>
        <a className="nav__link" href="#design" data-magnet>
          Models
        </a>
      </div>

      <a className="nav__logo" href="#" data-magnet>
        <Roundel />
        <span>330i</span>
      </a>

      <div className="nav__group">
        <a className="nav__link nav__group--mobilehide" href="#performance" data-magnet>
          Test drive
        </a>
        <a className="nav__link" href="#powertrain" data-magnet>
          Book now
        </a>
      </div>
    </nav>
  )
}
