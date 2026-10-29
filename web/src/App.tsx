import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { faces, faceTitle, HOME_TITLE } from './data';
import { useFaceRoute } from './router';
import Bar from './components/Bar';
import Hero from './components/Hero';
import Showcase from './components/Showcase';
import Catalogue from './components/Catalogue';
import Features from './components/Features';
import Gallery from './components/Gallery';
import Faq from './components/Faq';
import Footer from './components/Footer';
import Loader from './components/Loader';

const Cta = lazy(() => import('./components/Cta'));
const Detail = lazy(() => import('./components/Detail'));

export default function App() {
  const slug = useFaceRoute();
  const face = slug ? faces.find((f) => f.slug === slug) : undefined;

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !!face);
    document.title = face ? faceTitle(face) : HOME_TITLE;
  }, [face]);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#catalogue">
        Skip to the catalogue
      </a>
      <div {...((face ? { inert: '' } : {}) as object)}>
      <Bar />
      <main>
        <Hero />
        <Showcase />
        <Catalogue />
        <Features />
        <Gallery />
        <Faq />
        <Suspense fallback={<section className="cta cta--loading"><Loader label="Loading the 3D watch" /></section>}>
          <Cta />
        </Suspense>
      </main>
      <Footer />
      </div>
      <AnimatePresence>
        {face && (
          <Suspense key={face.slug} fallback={<div className="detail detail--loading"><Loader label="Opening watch face" /></div>}>
            <Detail face={face} />
          </Suspense>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
