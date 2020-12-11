import _ from 'lodash';
import {v4 as uuid} from 'uuid';
import {Socket} from 'socket.io-client';
import {
    LoopbackCrudControllerService
} from '../loopback/types';
import {
    DataAdapterBase,
    DataChangeKeys,
    DataChangeMessage,
    Entity,
    EntityEvent,
    EntityProperty,
    IdentifierSeperator
} from "../common";

export class LoopbackCrudControllerDataAdapter<T extends Entity> extends DataAdapterBase<T> {

    protected readonly clientId: string = uuid();

    constructor(
        protected socket: Socket,
        protected entityClass: typeof Entity & {
            prototype: T;
        },
        protected controller: LoopbackCrudControllerService<T>,
    ) {
        super();
    }

    refById(id: string): T {

        const entity: T = new this.entityClass() as T;
        _.set(entity, EntityProperty.ID, id);

        const onDataChange = (event: DataChangeMessage) => {
            console.log(`Receiving DataEvent on Client: ${event.event}`);

            if (event.clientId === this.clientId) {
                console.log('We received our own feedback update, ignoring...');
                // We dont process updates made from our own client
                return;
            }

            _.set(entity, DataChangeKeys.LivePropertyDisabled, !!event.clientId);
            _.assign(entity, event.data);
            _.unset(entity, DataChangeKeys.LivePropertyDisabled);
        };

        const eventName = this.getEventName(id);

        this.controller.findById({id})
            .subscribe(data => {

                // Update the Entity
                _.assign(entity, data);

                // We dont sign up until after we received the first one
                console.log(`Subscribing to Events from Server: ${eventName}`);
                this.socket.on(eventName, onDataChange);

                entity.change.on(EntityEvent.DataChange, (data) => {
                    const message: DataChangeMessage = {
                        event: EntityEvent.DataChange,
                        clientId: this.clientId,
                        model: this.entityClass.modelName,
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
            this.entityClass.modelName,
            id
        ].join(IdentifierSeperator);
    }
}
