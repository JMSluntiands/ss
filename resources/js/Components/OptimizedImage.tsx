import { ImgHTMLAttributes, useEffect, useState } from 'react';

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    /** Used when `src` is a thumbnail that may not exist yet for older uploads. */
    fallbackSrc?: string;
};

export default function OptimizedImage({
    priority = false,
    loading,
    decoding,
    fetchPriority,
    fallbackSrc,
    src,
    onError,
    ...props
}: OptimizedImageProps) {
    const [resolvedSrc, setResolvedSrc] = useState(src);

    useEffect(() => {
        setResolvedSrc(src);
    }, [src]);

    return (
        <img
            {...props}
            src={resolvedSrc}
            loading={loading ?? (priority ? 'eager' : 'lazy')}
            decoding={decoding ?? 'async'}
            fetchPriority={fetchPriority ?? (priority ? 'high' : 'low')}
            onError={(e) => {
                if (fallbackSrc && resolvedSrc !== fallbackSrc) {
                    setResolvedSrc(fallbackSrc);
                }
                onError?.(e);
            }}
        />
    );
}
