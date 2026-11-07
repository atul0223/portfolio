import gsap from 'gsap'
import { clientWork, liveWork } from '../data'
import { Heading, enter, useGsap } from './motion'

const clean = (s: string) => s.replace(/\s—\s/g, ', ')

/**
 * AmaPlayer opens from a small card to full screen while pinned,
 * then every client design slides past in a pinned horizontal track.
 */
export default function Clients() {
  const ref = useGsap<HTMLElement>((root) => {
    // featured: frame grows to full screen, copy card rises
    const ft = gsap.timeline({ scrollTrigger: { trigger: root.querySelector('.feat'), start: 'top top', end: '+=140%', pin: true, scrub: 0.7 } })
    ft.fromTo(root.querySelector('.feat-frame'), { clipPath: 'inset(16% 20% 16% 20% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 })
      .fromTo(root.querySelector('.feat-frame img'), { scale: 1.35 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      .fromTo(root.querySelector('.feat-title'), { scale: 1.6, opacity: 1 }, { scale: 0.6, opacity: 0, ease: 'power1.in', duration: 0.6 }, 0)
      .add(enter(root.querySelector('.feat-card'), { yPercent: 140, opacity: 0, ease: 'power3.out', duration: 0.45 }), 0.55)

    // concept track: vertical scroll drives horizontal travel
    const track = root.querySelector<HTMLElement>('.track')!
    const pin = root.querySelector<HTMLElement>('.track-pin')!
    const dist = () => Math.max(0, track.scrollWidth - pin.clientWidth)
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: root.querySelector('.track-pin'), start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true },
    })
    // each card tilts in as it enters from the right, its screenshot drifts inside the frame
    root.querySelectorAll<HTMLElement>('.concept').forEach((card) => {
      // tilt finishes while the card is still well inside the screen, so no card is left angled
      gsap.fromTo(card, { rotateY: -24, scale: 0.9, opacity: 0.35 }, {
        rotateY: 0, scale: 1, opacity: 1, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 100%', end: 'left 78%', scrub: true },
      })
    })
    root.querySelectorAll<HTMLElement>('.track-client').forEach((c) => {
      enter(c.querySelectorAll('h3, p'), {
        y: 60, opacity: 0, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 90%', end: 'left 50%', scrub: true },
      })
    })
  })

  return (
    <section className="clients" id="clients" ref={ref}>
      <div className="wrap clients-head">
        <p className="kicker"><span className="prompt">#</span> client work</p>
        <Heading text="Built for real businesses." />
      </div>

      <div className="feat">
        <div className="feat-frame"><img src={liveWork.image} alt={`${liveWork.name} homepage`} /></div>
        <p className="feat-title" aria-hidden>{liveWork.name}</p>
        <div className="feat-card">
          <p className="tag-live"><i /> Live product</p>
          <h3>{liveWork.name}</h3>
          <p className="live-role">{liveWork.role}</p>
          <p className="feat-about">{liveWork.about}</p>
          <a className="btn btn-amber" href={liveWork.url} target="_blank" rel="noopener">Visit amaplayer.com &#8599;</a>
        </div>
      </div>

      <div className="track-pin">
        <p className="track-hint">Website designs for clients. Scroll to explore; open a design to see the full page.</p>
        <div className="track">
          {clientWork.map((c) => (
            <div className="track-group" key={c.client}>
              <div className="track-client">
                <p className="client-loc">{c.location}</p>
                <h3>{clean(c.client)}</h3>
                <p>{clean(c.brief)}</p>
              </div>
              {c.concepts.map((k) => (
                <a className="concept" key={k.name} href={k.url} target="_blank" rel="noopener" data-cursor="view">
                  <div className="concept-frame"><img src={k.image} alt={`${k.name} website design`} loading="lazy" /></div>
                  <div className="concept-meta">
                    <h4>{k.name} <span>&#8599;</span></h4>
                    <p>{k.mood}</p>
                    <span className="swatches">{k.swatches.map((s) => <i key={s} style={{ background: s }} />)}</span>
                  </div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
