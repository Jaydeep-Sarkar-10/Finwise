import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './Masonry.css';

const useMedia = (queries, values, defaultValue) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  };

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 1.2,
  stagger = 0.18,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.98,
  blurToFocus = true,
}) => {
  const columns = useMedia(
    ['(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [3, 2, 1],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [isReady, setIsReady] = useState(false);
  const isVisible = useRef(false);
  const activeTimelines = useRef([]);

  useEffect(() => {
    setIsReady(true);
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return [];

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = child.height || 260;
      const y = colHeights[col];

      colHeights[col] += height;

      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const containerHeight = useMemo(() => {
    if (!width || grid.length === 0) return 0;
    const heights = [];
    const columnWidth = width / columns;
    const colHeights = new Array(columns).fill(0);
    grid.forEach(item => {
      const col = Math.round(item.x / columnWidth);
      if (colHeights[col] !== undefined) {
        colHeights[col] = item.y + item.h;
      }
    });
    return Math.max(...colHeights);
  }, [grid, columns, width]);

  // Function to run the entrance animation for all items
  const runEntranceAnimation = () => {
    // Kill any active animations
    activeTimelines.current.forEach(tl => tl && tl.kill());
    activeTimelines.current = [];

    grid.forEach((item, index) => {
      const el = document.querySelector(`[data-key="masonry-item-${item.id}"]`);
      if (!el) return;

      // Reset item to hidden state first
      const initialY = animateFrom === 'bottom' ? item.y + 80 : animateFrom === 'top' ? item.y - 80 : item.y;
      const initialX = animateFrom === 'left' ? item.x - 80 : animateFrom === 'right' ? item.x + 80 : item.x;

      gsap.set(el, {
        x: initialX,
        y: initialY,
        width: item.w,
        height: item.h,
        opacity: 0,
        ...(blurToFocus && { filter: 'blur(12px)' })
      });

      const tl = gsap.to(el, {
        x: item.x,
        y: item.y,
        opacity: 1,
        ...(blurToFocus && { filter: 'blur(0px)' }),
        duration: duration,
        ease: ease,
        delay: index * stagger,
      });

      activeTimelines.current.push(tl);
    });
  };

  // Position items (without animating) when layout changes
  useLayoutEffect(() => {
    if (!isReady || grid.length === 0) return;

    grid.forEach(item => {
      const el = document.querySelector(`[data-key="masonry-item-${item.id}"]`);
      if (!el) return;
      // Only update position if already visible; skip if not yet been revealed
      if (isVisible.current) {
        gsap.set(el, { x: item.x, y: item.y, width: item.w, height: item.h });
      } else {
        // Hide items below their start until intersection fires
        gsap.set(el, {
          x: item.x,
          y: item.y + 80,
          width: item.w,
          height: item.h,
          opacity: 0,
          ...(blurToFocus && { filter: 'blur(12px)' })
        });
      }
    });
  }, [grid, isReady]);

  // IntersectionObserver — re-animate every time the section scrolls into view
  useEffect(() => {
    if (!containerRef.current || !isReady || grid.length === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.current = true;
          runEntranceAnimation();
        } else {
          isVisible.current = false;
          // Reset to hidden so animation replays next scroll-in
          grid.forEach(item => {
            const el = document.querySelector(`[data-key="masonry-item-${item.id}"]`);
            if (!el) return;
            gsap.set(el, {
              opacity: 0,
              y: item.y + 80,
              ...(blurToFocus && { filter: 'blur(12px)' })
            });
          });
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, grid]);

  const handleMouseEnter = (e, item) => {
    const selector = `[data-key="masonry-item-${item.id}"]`;
    if (scaleOnHover) {
      gsap.to(selector, { scale: hoverScale, duration: 0.35, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = (e, item) => {
    const selector = `[data-key="masonry-item-${item.id}"]`;
    if (scaleOnHover) {
      gsap.to(selector, { scale: 1, duration: 0.35, ease: 'power2.out' });
    }
  };

  return (
    <div ref={containerRef} className="list" style={{ height: containerHeight }}>
      {grid.map(item => (
        <div
          key={item.id}
          data-key={`masonry-item-${item.id}`}
          className="item-wrapper"
          onMouseEnter={e => handleMouseEnter(e, item)}
          onMouseLeave={e => handleMouseLeave(e, item)}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

export default Masonry;
