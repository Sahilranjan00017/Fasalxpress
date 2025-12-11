import React, { useEffect, useState } from "react";

type Banner = {
  id?: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  sort_order?: number;
  active?: boolean;
};

const FALLBACK_IMAGES = [
    "https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1661907005604-cec7ffb6a042?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
  "https://images.unsplash.com/photo-1559884743-74a57598c6c7?q=80&w=2952&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1611843467160-25afb8df1074?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetch("/api/banners")
      .then((r) => r.json())
      .then((payload) => {
        if (!mounted) return;
        // support both envelope { success, data: { banners } } and raw array
        const list: Banner[] =
          (payload && payload.data && payload.data.banners) || (Array.isArray(payload) ? payload : null);
        if (Array.isArray(list) && list.length > 0) {
          const active = list.filter((b) => b.active !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setBanners(active.length ? active : list);
        } else {
          setBanners(null);
        }
      })
      .catch(() => setBanners(null));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const intervalMs = banners && banners.length ? 3000 : 2000;
    const t = setInterval(() => {
      setIndex((i) => i + 1);
    }, intervalMs);
    return () => clearInterval(t);
  }, [banners]);

  const items = banners && banners.length ? banners.map((b) => b.image_url || "") : FALLBACK_IMAGES;
  const current = items.length ? items[index % items.length] : FALLBACK_IMAGES[0];

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg bg-white">
      <div className="relative h-64 md:h-96 w-full">
        <img
          src={current}
          alt="banner"
          className="w-full h-full object-cover transition-opacity duration-700"
        />

        {/* simple indicators */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {(items || []).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i % items.length === index % items.length ? "bg-white" : "bg-white/60"} inline-block border border-white/40`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
