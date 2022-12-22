import { getDomParser } from "./scraping.js";
import { Business } from "../models/business.js";
import { checkBusinessExists, createBusiness } from "./business.js";

const MAX_COUNTER = 5;

export async function getGuiaEmpresasBusinesses(province: string): Promise<Business[]> {
    const host = 'https://guiaempresas.universia.es', businessList: Business[] = [];
    var counter = 1, index = 1, pagination = 2;

    while (counter < MAX_COUNTER) {
        const { docu, errors } = await getDomParser(`${host}/provincia/${province}/?qPagLoc=${counter}`)

        if (errors || !docu) {
            console.log(errors)
            break;
        }

        for (const prov of docu.getElementsByClassName('provincias')) {
            for (const loc of prov.getElementsByTagName('a')) {
                index = 1, pagination = 2;

                while (index < pagination) {
                    console.log(index, pagination)
                    const { docu, errors } = await getDomParser(`${host}${loc.getAttribute('href')}/?qPagina=${index}`)

                    if (errors || !docu) {
                        console.log(errors)
                        index++
                        continue
                    }

                    if (pagination === 2) {
                        const pagtn= docu.getElementsByClassName('pagination')[0].getElementsByTagName('li');
                        pagination = Number(pagtn[pagtn.length - 2].textContent);
                    }
                    
                    const page = docu.getElementsByClassName('ranking_einf')[0];

                    if (!page) {
                        index++
                        continue
                    }

                    for (const buns of page.getElementsByTagName('a')) {
                        if (await checkBusinessExists(buns.textContent)) continue;

                        let { docu, errors } = await getDomParser(`${host}${buns.getAttribute('href')}`)
        
                        if (errors || !docu) continue;

                        const business: Business = { name: docu.getElementsByTagName('h1')[0].textContent, address: "", city: "", cnae: "", creationDate: undefined, province: "", mission: "", phones: [], url: "" }
 
                        const tableBody = docu.getElementsByTagName('tbody')[0]

                        try {
                            business.address = docu.getElementsByClassName('street-address')[0].textContent;
                        } catch(err) {
                            console.log(index, buns.textContent)
                            return
                        }
                        business.city = docu.getElementsByClassName('locality')[0].textContent;
                        business.province = docu.getElementById('situation_prov').textContent;
                        business.phones.push(tableBody.getElementsByTagName('tr')[3].getElementsByTagName('td')[0].textContent);

                        for (const tr of tableBody.getElementsByTagName('tr')) {
                            if (tr.getElementsByTagName('th')[0].textContent.includes('Otros Teléfonos') && !tr.getElementsByTagName('td')[0].textContent.includes("Ver teléfono")) {
                                business.phones = business.phones.concat(tr.getElementsByTagName('td')[0].innerHTML.split('<br>').filter(phn => phn.length > 0))
                            }
                            else if (tr.getElementsByTagName('th')[0].textContent.includes('CNAE')) {
                                business.cnae = tr.getElementsByTagName('td')[0].textContent
                            }
                            else if (tr.getElementsByTagName('th')[0].textContent.includes('Objeto Social')) {
                                business.mission = tr.getElementsByTagName('td')[0].getElementsByTagName('span')[1].textContent
                            }
                            else if (tr.getElementsByTagName('th')[0].textContent.includes('Fecha de creación')) {
                                const date = tr.getElementsByTagName('td')[0].textContent.split('/');
                                business.creationDate = new Date(`${date[2]}-${date[1]}-${date[0]}`);
                            }
                        }

                        for (const p of docu.getElementById('texto_ficha').getElementsByTagName('p')) {
                            if (!p.textContent.includes('www')) continue;

                            const url = new RegExp(/www.([\w\-\.]+)/g).exec(p.textContent)[0];
                            business.url = url.substring(0, url.length - 1);
                        }

                        createBusiness(business)
                            .then(res => console.log(`Negocio con id: ${res._id} registrado con éxito.`))
                            .catch(console.log)
                        businessList.push(business)
                    }

                    index++;
                }
            }
        }

        counter++;
    }

    return businessList;
}