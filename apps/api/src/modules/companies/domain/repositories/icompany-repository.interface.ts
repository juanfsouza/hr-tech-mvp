import { Company } from "../entities/company.entity";
import { Cnpj } from "@shared/domain/value-objects/cnpj.vo";

export interface ICompanyRepository {
    findById(id: string): Promise<Company | null>;
    findByCnpj(cnpj: Cnpj): Promise<Company | null>;
    save(company: Company): Promise<void>;
    update(company: Company): Promise<void>;
    delete(id: string): Promise<void>;
    existsByCnpj(cnpj: Cnpj): Promise<boolean>;
}
