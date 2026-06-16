import OptimizedImage from '@/Components/OptimizedImage';
import SiteLogo from '@/Components/SiteLogo';
import { memberImageSrc } from '@/utils/publicStorage';
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export interface HeroSlideData {
    id: number;
    title_primary: string;
    title_secondary: string;
    tagline: string | null;
    tagline_accent: string | null;
    cta_label: string | null;
    cta_url: string | null;
    cta_opens_join_modal: boolean;
    image_url: string | null;
    use_logo_visual: boolean;
    sort_order: number;
}

type HeroCarouselProps = {
    slides: HeroSlideData[];
    onJoinClick?: () => void;
};

function HeroLogoVisual() {
    return (
        <div className="relative mx-auto max-w-full px-6 sm:px-10 py-4">
            <SiteLogo
                glow
                blend
                className="w-48 h-48 sm:w-72 sm:h-72 lg:w-[400px] lg:h-[400px] mx-auto object-contain"
            />

            <svg className="absolute top-0 right-2 sm:-top-6 sm:-right-8 w-12 h-20 sm:w-16 sm:h-24 animate-lightning-1" viewBox="0 0 64 96" fill="none">
                <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg1)" />
                <defs><linearGradient id="lg1" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#ef4444" /></linearGradient></defs>
            </svg>

            <svg className="absolute bottom-0 left-0 sm:-bottom-4 sm:-left-10 w-10 h-16 sm:w-14 sm:h-20 rotate-[200deg] animate-lightning-2" viewBox="0 0 64 96" fill="none">
                <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg2)" />
                <defs><linearGradient id="lg2" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fca5a5" /><stop offset="1" stopColor="#dc2626" /></linearGradient></defs>
            </svg>

            <svg className="absolute top-1/2 right-0 sm:-right-12 w-10 h-14 sm:w-12 sm:h-16 -rotate-[30deg] animate-lightning-3" viewBox="0 0 64 96" fill="none">
                <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg3)" />
                <defs><linearGradient id="lg3" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#b91c1c" /></linearGradient></defs>
            </svg>

            <svg className="absolute top-0 left-0 sm:-top-2 sm:-left-8 w-8 h-12 sm:w-10 sm:h-14 rotate-[160deg] animate-lightning-4" viewBox="0 0 64 96" fill="none">
                <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg4)" />
                <defs><linearGradient id="lg4" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fecaca" /><stop offset="1" stopColor="#ef4444" /></linearGradient></defs>
            </svg>

            <svg className="absolute bottom-2 right-1 sm:bottom-4 sm:-right-6 w-8 h-12 sm:w-10 sm:h-16 rotate-[45deg] animate-lightning-2" viewBox="0 0 64 96" fill="none">
                <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg5)" />
                <defs><linearGradient id="lg5" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#dc2626" /></linearGradient></defs>
            </svg>

            <svg className="absolute top-6 left-1 sm:top-8 sm:-left-6 w-7 h-10 sm:w-8 sm:h-12 -rotate-[120deg] animate-lightning-1" viewBox="0 0 64 96" fill="none">
                <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg6)" />
                <defs><linearGradient id="lg6" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fca5a5" /><stop offset="1" stopColor="#b91c1c" /></linearGradient></defs>
            </svg>
        </div>
    );
}

function HeroSlideVisual({ slide }: { slide: HeroSlideData }) {
    if (slide.use_logo_visual) {
        return <HeroLogoVisual />;
    }

    const imageSrc = memberImageSrc(slide.image_url, 'full');

    if (!imageSrc) {
        return <HeroLogoVisual />;
    }

    return (
        <div className="relative mx-auto max-w-full px-4 sm:px-8 py-4">
            <OptimizedImage
                src={imageSrc}
                alt={`${slide.title_primary} ${slide.title_secondary}`}
                className="w-full max-w-lg mx-auto h-auto max-h-[400px] object-contain drop-shadow-[0_0_40px_rgba(220,38,38,0.25)]"
            />
        </div>
    );
}

function CtaButton({
    slide,
    onJoinClick,
}: {
    slide: HeroSlideData;
    onJoinClick?: () => void;
}) {
    if (!slide.cta_label) {
        return null;
    }

    const buttonClass =
        'mb-6 inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-900/30 transition-colors mx-auto lg:mx-0';

    const arrow = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
    );

    if (slide.cta_opens_join_modal && onJoinClick) {
        return (
            <button type="button" onClick={onJoinClick} className={buttonClass}>
                {slide.cta_label}
                {arrow}
            </button>
        );
    }

    if (slide.cta_url) {
        const isExternal = /^https?:\/\//i.test(slide.cta_url);

        if (isExternal) {
            return (
                <a href={slide.cta_url} target="_blank" rel="noopener noreferrer" className={buttonClass}>
                    {slide.cta_label}
                    {arrow}
                </a>
            );
        }

        return (
            <Link href={slide.cta_url} className={buttonClass}>
                {slide.cta_label}
                {arrow}
            </Link>
        );
    }

    return null;
}

const AUTO_INTERVAL_MS = 7000;

export default function HeroCarousel({ slides, onJoinClick }: HeroCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const count = slides.length;

    const goTo = useCallback(
        (index: number) => {
            if (count === 0) return;
            setActiveIndex(((index % count) + count) % count);
        },
        [count],
    );

    const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
    const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

    useEffect(() => {
        if (count <= 1 || isPaused) return;

        const timer = window.setInterval(goNext, AUTO_INTERVAL_MS);
        return () => window.clearInterval(timer);
    }, [count, isPaused, goNext]);

    if (count === 0) {
        return null;
    }

    const slide = slides[activeIndex];

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
        >
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="text-center lg:text-left order-2 lg:order-1">
                    <div key={`text-${slide.id}`} className="animate-hero-fade-in">
                        <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none mb-6 break-words">
                            {slide.title_primary}
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-600">
                                {slide.title_secondary}
                            </span>
                        </h1>

                        {(slide.tagline || slide.tagline_accent) && (
                            <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                                {slide.tagline}
                                {slide.tagline && slide.tagline_accent ? ' ' : ''}
                                {slide.tagline_accent && (
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-600 font-semibold">
                                        {slide.tagline_accent}
                                    </span>
                                )}
                            </p>
                        )}

                        <CtaButton slide={slide} onJoinClick={onJoinClick} />
                    </div>
                </div>

                <div className="flex justify-center order-1 lg:order-2 w-full min-w-0">
                    <div key={`visual-${slide.id}`} className="w-full animate-hero-fade-in">
                        <HeroSlideVisual slide={slide} />
                    </div>
                </div>
            </div>

            {count > 1 && (
                <>
                    <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous slide"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-950/70 text-gray-400 hover:text-white hover:border-red-500/40 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next slide"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-950/70 text-gray-400 hover:text-white hover:border-red-500/40 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-8">
                        {slides.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => goTo(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className={`h-2 rounded-full transition-all ${
                                    index === activeIndex
                                        ? 'w-8 bg-red-500'
                                        : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
