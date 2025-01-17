import _ from 'lodash';
import {v4 as uuid} from 'uuid';
import {Socket} from 'socket.io-client';
import {
    DataChangeKeys,
    DataChangeMessage,
    Entity,
    EntityEvent,
    EntityProperty,
    EntityRepository,
    IdentifierSeperator
} from "./types";
import {DataAdapterBase} from "./data-adapter";

export class EntityRepositoryDataAdapter<T extends Entity> extends DataAdapterBase<T> {

    protected readonly clientId: string = uuid();

    constructor(
        protected socket: Socket,
        protected repository: EntityRepository<Entity, String, any>,
    ) {
        super();
    }

    refById(id: string): T {

        const entity: T = new this.repository.entityClass() as T;
        _.set(entity, EntityProperty.ID, id);

        const onDataChange = (event: DataChangeMessage) => {

            if (event.clientId === this.clientId) {
                console.log('We received our own feedback update, ignoring...');
                // We dont process updates made from our own client
                return;
            }

            _.set(entity, DataChangeKeys.LivePropertyDisabled, !event.clientId);
            _.assign(entity, event.data);
            _.unset(entity, DataChangeKeys.LivePropertyDisabled);
        };

        const eventName = this.getEventName(id);

        this.repository.findById(id)
            .then(data => {

                // Update the Entity
                _.assign(entity, data);

                // We dont sign up until after we received the first one
                this.socket.on(eventName, onDataChange);

                entity.change.on(EntityEvent.DataChange, (data) => {
                    const message: DataChangeMessage = {
                        event: EntityEvent.DataChange,
                        clientId: this.clientId,
                        model: this.repository.entityClass.modelName,
                        id,
                        data
                    }
                    console.log(`Emitting Event from Client: ${eventName}`);
                    this.socket.emit(eventName, message);
                });
            });

        entity.destroy = () => {
            this.socket.off(eventName, onDataChange);
        };

        return entity as T;
    }

    protected getEventName(id: string): string {
        return [
            EntityEvent.DataChange,
            this.repository.entityClass.modelName,
            id
        ].join(IdentifierSeperator);
    }
}
