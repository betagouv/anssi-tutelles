import assert from 'node:assert';
import describe, {  it } from 'node:test';
import { tutelles } from '../src/tutelles';

import baseDila from './dila_refOrga_admin_Etat_fr_20250526.json';

describe('Tutelles', () => {
    it("trouve la tutelle du siret qui dépend d'un ministère", () => {
        const service = '12004701400036';
        const expected_tutelles = ['172218'];

        assert.deepEqual(tutelles(service, baseDila['service']), expected_tutelles);
    });
    // it("trouve la tutelle du siret qui dépend de l'arcom", () => {
    //     const service = '12004701400036'; //FIXME
    //     const expected_tutelles = ['172218']; //FIXME

    //     assert.equal(tutelles(service, baseDila['service']), expected_tutelles);
    // });
});
