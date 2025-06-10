import assert from 'node:assert';
import describe, {  it } from 'node:test';
import { organigramme as calculOrganigramme, tutelles } from '../src/tutelles';

import baseDila from './dila_refOrga_admin_Etat_fr_20250526.json';

describe('Tutelles', () => {
    it("trouve la tutelle du siret qui dépend d'un ministère", () => {
        const service = '12004701400036';
        const expected_tutelles = ['172218'];
        
        assert.deepEqual(tutelles(service, baseDila['service']), expected_tutelles);
    });

    it("trouve toutes les tutelles possibles du siret", () => {
        const service = '12004701400036';
        const expected_tutelles = ['172218'];

        const organigramme = calculOrganigramme(baseDila['service']);

        console.log(organigramme);

        assert.deepEqual(organigramme.find(s => s.siret === service), expected_tutelles);
    });

    // it("trouve la tutelle du siret qui dépend de l'arcom", () => {
    //     const service = '12004701400036'; //FIXME
    //     const expected_tutelles = ['172218']; //FIXME

    //     assert.equal(tutelles(service, baseDila['service']), expected_tutelles);
    // });
});
type Service = {
    hierarchie: Array<{type_hierarchie: string, service: string}>;
    id: string;
    itm_identifiant: string;
    siret?: string;
}

function mapSiretATutelles(baseDeDonnees: Array<Service>): Map<string, string[]> {
    const tutellesMap = new Map<string, string[]>();
    for (const service of baseDeDonnees) {
        for (const hierarchie of service.hierarchie) {
            if (hierarchie.type_hierarchie === 'Service Fils') {
                const serviceFils = baseDeDonnees.find(s => s.id === hierarchie.service);
                if (serviceFils && serviceFils.siret) {
                    const tutelles = tutellesMap.get(serviceFils.siret) || [];
                    tutellesMap.set(serviceFils.siret, [...tutelles, service.itm_identifiant]);
                }
            }
        }
    }
    return tutellesMap;
}

