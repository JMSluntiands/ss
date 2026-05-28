import { ImgHTMLAttributes } from 'react';

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
};

export default function OptimizedImage({
    priority = false,
    loading,
    decoding,
    fetchPriority,
    ...props
}: OptimizedImageProps) {
    return (
        <img
            {...props}
            loading={loading ?? (priority ? 'eager' : 'lazy')}
            decoding={decoding ?? 'async'}
            fetchPriority={fetchPriority ?? (priority ? 'high' : 'low')}
        />
    );
}
