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