import createCache from '@emotion/cache';

export default function createEmotionCache() {
    return createCache({key:'css',prepend:true})
}

export function createTssCache() {
    return createCache({
        key:'tss-css',
    });
}