import { getGuiaEmpresasBusinesses } from "./services/scrapers.js";
import { startMongoClient } from "./config.js";
//import { getDomParser, getParsedDOM } from "./services/scraping.js";

/* (async () => {
    const dom = await getDomParser("https://www.doctoralia.es/dentista/santa-cruz-de-tenerife")

    if (dom.errors || !dom.docu) return;

    for (const box of dom.docu.getElementsByClassName('text-body')) {
        if (!box.getElementsByTagName('span')[0]) continue;

        console.log(box.getElementsByTagName('span')[0].textContent)
    }
})() */
startMongoClient()
getGuiaEmpresasBusinesses('SANTA-CRUZ-TENERIFE')
