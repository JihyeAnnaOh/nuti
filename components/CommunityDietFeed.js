'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { communityPosts } from '../utils/communityPosts';

/**
 * Styled-by-you community gallery showcasing diets/meals shared by users.
 * Uses static data for now; can be wired to Firestore later.
 */
export default function CommunityDietFeed() {
  const posts = useMemo(() => communityPosts.slice(0, 9), []);
  const scrollerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const scrollByAmount = useCallback((direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((idx) => (idx + posts.length - 1) % posts.length);
  }, [activeIndex, posts.length]);
  const showNext = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((idx) => (idx + 1) % posts.length);
  }, [activeIndex, posts.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (activeIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, closeLightbox, showPrev, showNext]);

  if (posts.length === 0) return null;

  return (
    <section className="w-full py-12 relative bg-white">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#3B3B3B]">Styled By You</h2>
        <p className="text-xs md:text-sm text-[#7C6A6A] mt-2">Click to explore the meals our community loves</p>
      </div>

      {/* Full-width section; inner track constrained to max 4 cards */}
      <div className="relative mx-auto w-full max-w-[1120px] px-4">
        {/* Arrows anchored to inner track */}
        <button
          onClick={() => {
            const el = scrollerRef.current;
            const card = el?.querySelector('article');
            const step = (card?.offsetWidth || 260) + 16; // width + gap
            el?.scrollBy({ left: -step, behavior: 'smooth' });
          }}
          className="hidden sm:flex absolute -left-1.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-white/90 border border-[#EECFD4] shadow hover:bg-[var(--primary)] hover:text-white transition"
          aria-label="Scroll left"
        >
          ‹
        </button>
        <button
          onClick={() => {
            const el = scrollerRef.current;
            const card = el?.querySelector('article');
            const step = (card?.offsetWidth || 260) + 16;
            el?.scrollBy({ left: step, behavior: 'smooth' });
          }}
          className="hidden sm:flex absolute -right-1.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-white/90 border border-[#EECFD4] shadow hover:bg-[var(--primary)] hover:text-white transition"
          aria-label="Scroll right"
        >
          ›
        </button>

        {/* Carousel */}
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto px-1 scroll-smooth bg-white"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {posts.map((post) => (
            <article
              key={post.id}
              className="group relative w-[200px] min-w-[200px] max-w-[200px] sm:w-[240px] sm:min-w-[240px] sm:max-w-[240px] lg:w-[260px] lg:min-w-[260px] lg:max-w-[260px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(posts.findIndex((p) => p.id === post.id))}
                className="relative w-full h-[200px] sm:h-[220px] lg:h-[240px] cursor-zoom-in bg-white overflow-hidden"
                aria-label="Zoom image"
              >
                <Image
                  src={post.image}
                  alt={post.caption || post.handle}
                  fill
                  className="object-cover transition-transform duration-500 scale-[1.12] group-hover:scale-[1.16] will-change-transform"
                  sizes="(max-width: 640px) 200px, (max-width: 1024px) 220px, 240px"
                  priority={false}
                />
              </button>

              <div className="pt-2 flex flex-col items-center gap-2">
                <span className="text-[11px] sm:text-sm font-medium text-[#3B3B3B] text-center">{post.handle}</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {(post.tags || []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] sm:text-[11px] px-2 py-[2px] rounded-full bg-[#EECFD4] text-[#7C6A6A] whitespace-nowrap"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/meal-planner"
          className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-[#3B3B3B] text-sm font-semibold shadow hover:bg-[var(--accent)] transition"
        >
          Share your diet — Start planning
        </Link>
      </div>

      {/* Lightbox Modal */}
      {activeIndex !== null && posts[activeIndex] && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-50"
            onClick={closeLightbox}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-[92vw] h-[82vh] max-w-5xl">
              <Image
                src={posts[activeIndex].image}
                alt={posts[activeIndex].caption || posts[activeIndex].handle}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            {/* Controls */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-[#3B3B3B] hover:bg-white z-[60]"
              aria-label="Close"
            >
              ✕
            </button>
            <button
              onClick={showPrev}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/90 text-[#3B3B3B] hover:bg-white z-[60]"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={showNext}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/90 text-[#3B3B3B] hover:bg-white z-[60]"
              aria-label="Next image"
            >
              ›
            </button>
          </div>
        </>
      )}
    </section>
  );
}


