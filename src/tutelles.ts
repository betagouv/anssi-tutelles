export const tutelles = (siret: string, database: Record<any, any>): string[] => {
    const service = database.find((item: any) => item.siret === siret);

    const pathFromRoot = hierarchy(database, service);
    return [pathFromRoot[2].itm_identifiant]
}

function hierarchy(services, service) {
    const id = service.id;
    const parent = services.find(s => 
        s.hierarchie.find(h => h.service === id)
    );
    if (parent) {
        const result = hierarchy(services, parent)
        result.push(service);
        return result;
    } else {
        return [service];
    }
}

type ServiceDila = {
    itm_identifiant: string;
    nom: string;
    siret: string;
    id: string;
    hierarchie: Array<{type_hierarchie: string, service: string}>;
}

type Service = {
    id: string;
    tutelles: Array<string>;
}

export function organigramme(database: Array<ServiceDila>): Array<Service> {
    const un = passeUne(database);
    const deux = passeDeux(un);
    const trois = passeTrois(deux);
    const services: Array<Service> = [];
    for (const [_id, service] of trois) {
        services.push({
            ...service.donneesService,
            id: service.id,
            tutelles: service.ancetres
        });
    }
    return services;
}

type ServicePasseUne = {
    id: string;
    fils: Array<string>;
    donneesService: DonneesService;
}

type DonneesService = {
    itm_identifiant: string;
    siret: string;
    nom: string;
}

function passeUne(database: Array<ServiceDila>): Map<string, ServicePasseUne> {
    const servicesMap = new Map<string, ServicePasseUne>();
    for (const service of database) {
        servicesMap.set(service.id, {
            id: service.id,
            fils: fils(service),
            donneesService: {
                itm_identifiant: service.itm_identifiant,
                siret: service.siret,
                nom: service.nom,
            }
        });
    }
    return servicesMap;
}

function fils(service: ServiceDila): string[] {
    const filsList: string[] = [];
    for (const hierarchie of service.hierarchie) {
        if (hierarchie.type_hierarchie === 'Service Fils') {
            const serviceFils = hierarchie.service;
            filsList.push(serviceFils);
        }
    }
    return filsList;
}

type ServicePasseDeux = {
    id: string;
    parents: Array<string>;
    donneesService: DonneesService;
}

function passeDeux(database: Map<string, ServicePasseUne>): Map<string, ServicePasseDeux> {
    const servicesMap = new Map<string, ServicePasseDeux>();

    for (const [_id, service] of database) {
        servicesMap.set(service.id, {
            id: service.id,
            parents: [],
            donneesService: service.donneesService
        });
    }
    for (const [_id, service] of database) {
        for (const fils of service.fils) {
            servicesMap.get(fils)?.parents.push(service.id);
        }
    }

    return servicesMap;
}

type ServicePasseTrois = {
    id: string;
    ancetres: Array<string>;
    donneesService: DonneesService;
}

function passeTrois(database: Map<string, ServicePasseDeux>): Map<string, ServicePasseTrois> {
    const servicesMap = new Map<string, ServicePasseTrois>();

    for (const [_id, service] of database) {
        ancetres(database, servicesMap, service);
    }
    return servicesMap;
}

function ancetres(databaseIn: Map<string, ServicePasseDeux>, databaseOut: Map<string, ServicePasseTrois>, service: ServicePasseDeux): string[] {
    const serviceDeux = databaseOut.get(service.id);
    if (serviceDeux) {
        return serviceDeux.ancetres;
    } else {
        const ancetresList: string[] = [];
        for (const parent of service.parents) {
            ancetresList.push(parent);
            ancetresList.push(...ancetres(databaseIn, databaseOut, databaseIn.get(parent)!));
        }
        databaseOut.set(service.id, {
            id: service.id,
            ancetres: ancetresList,
            donneesService: service.donneesService
        });
        return ancetresList;
    }
}

