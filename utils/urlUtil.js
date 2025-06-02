export function getOriginPath(oriUrl) {
    const url = new URL(oriUrl);
    return `${url.origin}${url.pathname}`
}


export function getSupabaseUrl(oriUrl) {
    const url = new URL(oriUrl);
    let s3Url = `${url.origin}${url.pathname}`;
    // 替换s3路径为object/public
    s3Url = s3Url.replace('/s3/', '/object/public/');
    return s3Url;
}