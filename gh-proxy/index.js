"use strict"
const ASSET_URL = "https://yin1999.github.io/gh-proxy/"
// 前缀，如果自定义路由为example.com/gh/*，将PREFIX改为 "/gh/"，注意，少一个杠都会错！
const PREFIX = "/"
// 分支文件使用jsDelivr镜像的开关
const Config = {
	jsdelivr: true
}

/** @type {ResponseInit} */
const PREFLIGHT_INIT = {
	status: 204,
	headers: new Headers({
		"access-control-allow-origin": "*",
		"access-control-allow-methods": "GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS",
		"access-control-max-age": "1728000",
	})
}

/**
 * @param {any} body
 * @param {number} status
 * @param {Object<string, string>} headers
 */
function makeRes(body, status = 200, headers = {}) {
	headers["access-control-allow-origin"] = "*"
	return new Response(body, { status, headers })
}

/**
 * @param {string} urlStr
 */
function newUrl(urlStr) {
	try {
		return new URL(urlStr)
	} catch (err) {
		return null
	}
}

addEventListener("fetch", e => {
	const ret = fetchHandler(e)
		.catch(err => makeRes("cfworker error:\n" + err.stack, 502))
	e.respondWith(ret)
})

/**
 * @param {FetchEvent} e
 */
async function fetchHandler(e) {
	const req = e.request
	const urlStr = req.url
	const urlObj = new URL(urlStr)
	let path = urlObj.searchParams.get("q")
	if (path) {
		// console.log(path)
		return Response.redirect(`https://${urlObj.host}${PREFIX}${path}`, 301)
	}
	// cfworker 会把路径中的 `//` 合并成 `/`
	path = urlObj.href.substring(urlObj.origin.length + PREFIX.length).replace(/^https?:\/+/, "https://")
	// console.log(`path before: ${path}`)
	const expt = /^(?:https?:\/\/)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+/i
	if (path.search(expt) !== 0 && path) {
		path = `https://github.com/${path}`
		// console.log(`path after: ${path}`)
	}
	const exp = /^(https?:\/\/)?(?:.+\.)?(?:githubusercontent|github)\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?/i
	if (path.search(exp) !== 0) {
		return fetch(ASSET_URL + path)
	}

	const exp2 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:raw)\/.*$/i
	const exp3 = /^(?:https?:\/\/)?raw\.githubusercontent\.com\/.+?\/.+?\/.+?\/.+$/i
	if (Config.jsdelivr) {
		if (path.search(exp2) === 0) {
			// console.log("exp2 jsdelivr")
			const newUrl = path.replace("/raw/", "@").replace(/^(?:https?:\/\/)?github\.com/i, "https://cdn.jsdelivr.net/gh")
			return Response.redirect(newUrl, 302)
		} else if (path.search(exp3) === 0) {
			// console.log("exp3 jsdelivr")
			const newUrl = path.replace(/(?<=com\/.+?\/.+?)\/(.+?\/)/, "@$1").replace(/^(?:https?:\/\/)?raw\.githubusercontent\.com/i, "https://cdn.jsdelivr.net/gh")
			return Response.redirect(newUrl, 302)
		}
	}
	// console.log("proxy pass")

	return httpHandler(req, path)
}


/**
 * @param {Request} req
 * @param {string} pathname
 */
function httpHandler(req, pathname) {
	const reqHdrRaw = req.headers

	// preflight
	if (req.method === "OPTIONS" &&
		reqHdrRaw.has("access-control-request-headers")
	) {
		return new Response(null, PREFLIGHT_INIT)
	}

	const headers = new Headers(reqHdrRaw)

	if (!pathname.startsWith("http")) {
		pathname = `https://${pathname}`
	}
	const urlObj = newUrl(pathname)

	/** @type {RequestInit} */
	const reqInit = {
		method: req.method,
		headers,
		redirect: "follow",
		body: req.body
	}
	return proxy(urlObj, reqInit)
}

// js 注入修改网页中的URL
const injectScript = `<script defer src="/yin1999/yin1999.github.io/raw/main/gh-proxy/injected.js"></script>
`

/** @type {HTMLRewriterElementContentHandlers} */
const scriptInject = {
	element(element) {
		element.append(injectScript, { html: true })
	}
}

const rewriter = new HTMLRewriter()
	.on("head", scriptInject)

/**
 *
 * @param {URL} urlObj
 * @param {RequestInit} reqInit
 * @param {Number} rawLen
 */
async function proxy(urlObj, reqInit, rawLen = undefined) {
	const res = await fetch(urlObj.href, reqInit)
	const resHdrOld = res.headers
	const headers = new Headers(resHdrOld)

	// verify
	if (rawLen !== undefined) {
		const newLen = resHdrOld.get("content-length") ?? 0

		if (rawLen != newLen) {
			return makeRes(res.body, 400, {
				"--error": `bad len: ${newLen}, except: ${rawLen}`,
				"access-control-expose-headers": "--error"
			})
		}
	}
	const status = res.status
	headers.set("access-control-expose-headers", "*")
	headers.set("access-control-allow-origin", "*")

	headers.delete("content-security-policy")
	headers.delete("content-security-policy-report-only")
	headers.delete("clear-site-data")

	const newResp = new Response(res.body, {
		status,
		headers
	})

	if (resHdrOld.get("content-type")?.includes("text/html")) { // web access to html
		return rewriter.transform(newResp)
	}

	return newResp // other file
}
