/** Resolve relative path to URL using env provided by vite */
export function vPath(path: string) {
    if(path.at(0) === '/') path = path.slice(1);
    return import.meta.env.BASE_URL + path;
}