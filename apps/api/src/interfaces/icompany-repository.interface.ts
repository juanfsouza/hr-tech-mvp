/**
 * ICompanyRepository — contrato do repositório de empresas
 */
export interface ICompanyRepository {
    findById(id: string): Promise<Company | null>;
    findByCnpj(cnpj: Cnpj): Promise<Company | null>;
    save(company: Company): Promise<void>;
    update(company: Company): Promise<void>;
    delete(id: string): Promise<void>;
    existsByCnpj(cnpj: Cnpj): Promise<boolean>;
}
