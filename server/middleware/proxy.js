import fetch from "node-fetch";
export function createQwenProxy(target, username, password, pathFilter, pathPrefix) {
    return (async (req, res, next) => {
        if (req.path.startsWith(pathFilter)) {
            const headers = new Headers(Object.assign(req.headers, {
                ["Authorization"]: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
                ["authorization"]: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
            }));
            const url = new URL(req.url.slice(pathPrefix.length), target);
            console.log("url", url);
            console.log("headers", headers);
            console.log("body", req.body);
            const response = await fetch(url.href, {
                headers: Object.fromEntries(headers),
                method: req.method,
                body: JSON.stringify(req.body),
            });
            console.log(response);
            if (response.ok) {
                const data = await response.json();
                for (const key of response.headers.keys()) {
                    res.status(response.status);
                    res.header(key, response.headers.get(key));
                }
                res.json(data);
            }
            else {
                res.header(key, response.headers.get(key));
                res.status(response.status).end(await response.text());
            }
        }
        else {
            next();
        }
    });
}
//# sourceMappingURL=proxy.js.map