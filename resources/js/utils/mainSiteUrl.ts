export function mainSitePath(mainSiteUrl: string, path: string): string {
    const base = mainSiteUrl.replace(/\/$/, '');
    const segment = path.startsWith('/') ? path : `/${path}`;

    return `${base}${segment}`;
}

export function mainSiteBlogPostUrl(mainSiteUrl: string, postId: number): string {
    return mainSitePath(mainSiteUrl, `/blog/${postId}`);
}
