import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CONTACT } from '../data';

const CARDS = [
  {
    tab: 'Watches',
    q: 'Will it work on my watch?',
    a: 'Yes, if it runs Wear OS: Samsung Galaxy Watch 4 and newer (including Ultra), Google Pixel Watch, and other Wear OS watches. The newest faces need Wear OS 5 or later. Tizen watches such as the Galaxy Watch 3 and Gear series are not supported.',
  },
  {
    tab: 'Installing',
    q: 'How do I get a face onto the watch?',
    a: 'Open the face on Google Play from your phone, choose your watch in the Install menu, and it downloads to the watch. Then touch and hold the current watch face, swipe to the end and tap Add to pick it.',
  },
  {
    tab: 'Colours',
    q: 'How do I change colours and shortcuts?',
    a: 'Touch and hold the face on your watch and tap Customise. Swipe between the pages to set the colour, the hands where there are options, the complications and the shortcuts. The Galaxy Wearable app on your phone offers the same settings.',
  },
  {
    tab: 'Battery',
    q: 'What happens with always-on display?',
    a: 'With always-on display turned on in your watch settings, the face drops to a dim, mostly black layout that keeps the time readable. On AMOLED screens black pixels are switched off, which is what keeps it light on battery.',
  },
  {
    tab: 'Buying',
    q: 'What if I bought the wrong one?',
    a: 'Purchases go through Google Play, so refunds follow Google Play’s policy and are requested from your Play order history. If a face doesn’t look right on your watch, write first and it can usually be fixed.',
  },
  {
    tab: 'Contact',
    q: 'Something not working, or an idea for a face?',
    a: `Write to ${CONTACT} with your watch model and the face’s name. Requests for colours and features are read, and some have become faces.`,
  },
];

const COLOURS = ['var(--field-1)', 'var(--field-2)', 'var(--field-3)'];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Before you install</h2>
      <div className="faq__drawer">
        {CARDS.map((c, i) => {
          const isOpen = open === i;
          return (
            <div
              key={c.tab}
              className={`card${isOpen ? ' is-open' : ''}`}
              style={{ background: COLOURS[i % COLOURS.length], ['--n' as string]: i, zIndex: i + 1 }}
            >
              <span className="card__tab" style={{ background: COLOURS[i % COLOURS.length] }} aria-hidden="true">
                {c.tab}
              </span>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  id={`faq-q-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  {c.q}
                  <span className="card__sign" aria-hidden="true" />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    className="card__a"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <p>
                      {c.tab === 'Contact' ? (
                        <>
                          Write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a> with your watch model and the face’s name.
                          Requests for colours and features are read, and some have become faces.
                        </>
                      ) : (
                        c.a
                      )}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
