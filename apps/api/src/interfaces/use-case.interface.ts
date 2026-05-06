import { DomainError } from "@/shared/domain/errors/domain-errors";
import { Either } from "@/shared/domain/errors/either";

export interface UseCase<I, O, E extends DomainError = DomainError> {
    execute(input: I): Promise<Either<E, O>>;
}
