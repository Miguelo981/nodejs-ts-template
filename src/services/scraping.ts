import axios from "axios";
import sanitizeHtml from 'sanitize-html';
import {JSDOM} from 'jsdom';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch';
import DomParser, { Dom } from 'dom-parser';

export enum DomErrorType {
    CERTIFICATE, NOTFOUND, UNEXPECTED
}

type DOMParserRes = {
    docu?: Document | Dom;
    errors?: DomErrorType;
}

export const parser = new DomParser();

export const allowedTags = [
    "article", "aside", "footer", "header", "h1", "h2", "h3", "h4",
    "h5", "h6", "hgroup", "main", "nav", "section", "dd", "div",
    "dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
    "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
    "em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
    "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
    "col", "colgroup", "tfoot", "thead"
]

export const allowedTags2 = [
    "aside", "footer", "header", "h1", "h2", "h3", "h4",
    "h5", "h6", "hgroup", "main", "nav", "section", "dd", "div",
    "dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
    "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
    "em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
    "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
    "col", "colgroup", "tfoot", "thead"
]

export async function download(fileUrl: string, outputLocationPath: string, headers?: any): Promise<any> {
    return axios(headers || {
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    }).then(async response => {
        response.data.pipe(createWriteStream(outputLocationPath));
    }).catch(error => {
        console.error("Unexpected error during download: " + fileUrl + " with error: " + error);
    })
}

export async function downloadFile(url: string, path: string) {
    //const response = await fetch(url);
    //const buffer = await response.buffer();

    fetch(url)
	.then(res =>
        {
        if (!res.body) return;
		res.body.pipe(createWriteStream(path))
    }).catch(console.log)
}

export async function getImage(url: string) {
    try {
        const response = await fetch(url);
        const buffer = await response.buffer();

        return buffer;
    } catch (error) {
        console.error('getImage request got unexcpected error: ' + error + ' on: ' + url + ' route.')
    }
}

export function getDomParserHtml(html: string) {
    try {
        return new JSDOM(html).window.document;
        //return parser.parseFromString(sanitizeHtml(html));
    } catch (error) {
        console.error('DOMParserHTML got unexcpected error: ' + error);
    }
}

export async function getParsedDOM(route: string, headers?: any): Promise<DOMParserRes> { //: Promise<Document>
    try {
        route = route.includes('%') ? route : encodeURI(route);
        const web = headers ? await axios.get(route, headers) : await axios.get(route);

        if (web.status !== 200) console.warn('DOMParser request got error: ' + web.data + '. and status: ' + web.status + ' on: ' + route + ' route.');

        return { docu: parser.parseFromString(sanitizeHtml(web.data, { allowedTags: allowedTags })), errors: undefined }

    } catch (error: any) {
        if (error.code === 'CERT_HAS_EXPIRED' || (error.response && error.response.status === 503)) {
            return { docu: undefined, errors: DomErrorType.CERTIFICATE }
        } else if (error.response && (error.response.status !== 404 && error.response.status !== 400)) {
            console.warn('DOMParser request got unexected error: ' + error + ' on: ' + route + ' route.');
            return { docu: undefined, errors: DomErrorType.UNEXPECTED }
        } else {
            return { docu: undefined, errors: DomErrorType.NOTFOUND }
        }
    }

    return { docu: undefined, errors: undefined }
}

export async function getDomParser(route: string, headers?: any): Promise<DOMParserRes> {
    try {
        route = route.includes('%') ? route : encodeURI(route);

        const web = headers ? await axios.get(route, headers) : await axios.get(route);

        if (web.status !== 200) console.warn('DOMParser request got error: ' + web.data + '. and status: ' + web.status + ' on: ' + route + ' route.');

        const sanitizedHtml = sanitizeHtml(web.data);
        //const docu = new JSDOM(sanitizedHtml); //docu.window.document
        const docu = await JSDOM.fromURL(route);

        return { docu: docu.window.document }

    } catch (error: any) {
        if (error.code === 'CERT_HAS_EXPIRED' || (error.response && error.response.status === 503)) {
            return { errors: DomErrorType.CERTIFICATE }
        } else if (error.response && (error.response.status !== 404 && error.response.status !== 400)) {
            console.warn('DOMParser request got unexected error: ' + error + ' on: ' + route + ' route.');
            return { errors: DomErrorType.UNEXPECTED }
        }

        return { errors: DomErrorType.NOTFOUND }
    }
}