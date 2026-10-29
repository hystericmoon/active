import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { faces } from './data';
import { useRoute } from './router';
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
  const route = useRoute();
  const slug = route.startsWith('/face/') ? route.slice(6) : null;
  const face = slug ? faces.find((f) => f.slug === slug) : undefined;

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !!face);
    document.title = face
      ? `${face.name}: ${face.category} watch face · Active Design`
      : 'Active Design: Watch Faces for Wear OS';
  }, [face]);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#catalogue">
        Skip to the catalogue
      </a>
      <Bar />
      <main {...((face ? { inert: '' } : {}) as object)}>
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
