import { UniqueEntityID } from './unique-entity-id';

/**
 * Entity base — todas as entidades de domínio estendem esta classe
 * Igualdade por identidade (ID), não por referência
 */
export abstract class Entity<TProps> {
  protected readonly _id: UniqueEntityID;
  protected props: TProps;

  protected constructor(props: TProps, id?: UniqueEntityID) {
    this._id = id ?? UniqueEntityID.create();
    this.props = props;
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  equals(entity?: Entity<TProps>): boolean {
    if (entity === null || entity === undefined) return false;
    if (this === entity) return true;
    if (!(entity instanceof Entity)) return false;
    return this._id.equals(entity._id);
  }
}
