import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SECTIONS } from '../lib/sections.js'

gsap.registerPlugin(ScrollTrigger)

function Lines({ lines, className }) {
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span className="reveal-line" key={i}>
          <span>{l}</span>
        </span>
      ))}
    </span>
  )
}

function Section({ s }) {
  const { variant } = s
  const cls = `section section--${variant}`

  if (variant === 'hero') {
    return (
      <section className={cls} id={s.id}>
        <div className="hero__inner">
          <h1 className="hero__title">
            <Lines lines={s.title} />
          </h1>
          <div className="hero__sub r-fade">{s.sub}</div>
          <a className="cta r-pop" href="#powertrain" data-magnet>
            <span className="dot" />
            {s.cta}
          </a>
        </div>
        <div className="hero__scrollcue r-pop">
          <span>Scroll</span>
          <span className="bar" />
        </div>
      </section>
    )
  }

  if (variant === 'word') {
    return (
      <section className={cls} id={s.id}>
        <span className="eyebrow r-fade">{s.eyebrow}</span>
        <h2 className="bigword">
          <span className="reveal-line">
            <span>{s.word}</span>
          </span>
        </h2>
        <p className="section-copy">
          <span className="reveal-line">
            <span>{s.body}</span>
          </span>
        </p>
      </section>
    )
  }

  // left / right / outro share the "head" structure
  return (
    <section className={cls} id={s.id}>
      <div className="section__head">
        <span className="eyebrow r-fade">{s.eyebrow}</span>

        {s.stat && (
          <div className="stat">
            <span className="reveal-line">
              <span>
                {s.stat.value} <em className="unit">{s.stat.unit}</em>
              </span>
            </span>
          </div>
        )}

        {s.title && (
          <h2 className="section-title headline">
            <Lines lines={s.title} />
          </h2>
        )}

        <p className="section-copy">
          <span className="reveal-line">
            <span>{s.body}</span>
          </span>
        </p>

        {s.specs && (
          <div className="specgrid r-fade">
            {s.specs.map((c) => (
              <div className="cell" key={c.k}>
                <div className="k">{c.k}</div>
                <div className="v">{c.v}</div>
              </div>
            ))}
          </div>
        )}

        {s.link && (
          <span className="link r-fade" data-magnet>
            {s.link} →
          </span>
        )}

        {s.cta && variant === 'outro' && (
          <a className="cta r-pop" href="#" data-magnet>
            <span className="dot" />
            {s.cta}
          </a>
        )}
      </div>
    </section>
  )
}

export default function Overlay() {
  const rootRef = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context((self) => {
      const sections = self.selector('.section')
      sections.forEach((sec) => {
        const lines = sec.querySelectorAll('.reveal-line > span')
        const fades = sec.querySelectorAll('.r-fade')
        const pops = sec.querySelectorAll('.r-pop')
        if (reduced) {
          gsap.set(lines, { y: '0%' })
          gsap.set(fades, { opacity: 1, y: 0 })
          gsap.set(pops, { opacity: 1 })
          return
        }
        const tl = gsap.timeline({
          scrollTrigger: { trigger: sec, start: 'top 74%', once: false, toggleActions: 'play none none reverse' },
        })
        if (lines.length)
          tl.to(lines, { y: '0%', duration: 0.9, ease: 'power4.out', stagger: 0.08 }, 0)
        if (fades.length)
          tl.to(fades, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 }, 0.15)
        if (pops.length)
          tl.to(pops, { opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.08 }, 0.35)
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <main className="scroll-root" ref={rootRef}>
      {SECTIONS.map((s) => (
        <Section s={s} key={s.id} />
      ))}
    </main>
  )
}
