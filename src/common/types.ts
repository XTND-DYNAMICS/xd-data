import {EventEmitter} from 'events';

export interface Identifiable {
    id: string;
}

export interface Destroyable {
    destroy(): void;
}

export interface LivePropertyTarget {
    onPropertyChange: (propertyKey: string, value: any | null) => void;
}

export abstract class Model {
    static get modelName(): string {
        return this.definition?.name || this.name;
    }

    static definition: ModelDefinition;
}

export interface ModelDefinition {
    readonly name: string;
}

export enum EntityProperty {
    ID = 'id',
    LastUpdated = 'lastUpdated'
}

export enum EntityEvent {
    DataChange = 'dataChange',
}

export abstract class Entity extends Model implements Identifiable, Destroyable, LivePropertyTarget {

    change: EventEmitter = new EventEmitter();

    id: string;
    lastUpdated: Date;

    constructor() {
        super();
        console.log('Created Entity: ' + typeof this);
    }

    destroy() {
        // ignore
    }

    public onPropertyChange(propertyKey: string, value: any | null): void {
        if (this.change) {
            this.change.emit(EntityEvent.DataChange, {
                [propertyKey]: value
            });
        }
    }
}

export interface EntityRepository<T extends Model, ID = {}, Relations = {}> {

    entityClass: typeof Entity & {
        prototype: T;
    };

    findById(id: string): Promise<T>;
}

export interface DataChangeMessage {
    event: string;
    model: string;
    id: string;
    data: Partial<Entity>;

    clientId?: string;
}

export const IdentifierSeperator = ':';
