import _ from 'lodash';
import {v4 as uuid} from 'uuid';
import {Socket} from 'socket.io-client';
import {
    DataAdapterBase,
    DataChangeMessage,
    Entity,
    EntityEvent,
    EntityProperty,
    EntityRepository, IdentifierSeperator
} from '../common/index';

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
            if(event.clientId === this.clientId) {
                console.log('We received our own feedback update, ignoring...');
                // We dont process updates made from our own client
                return;
            }
            _.assign(entity, event.data);
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
                    this.socket.emit(eventName, message);
                });
            });

        entity.destroy = () => {
            this.socket.off(eventName, onDataChange);
        };

        return entity as T;
    }

    // protected entityProxyHandler(): ProxyHandler<any> {
    //     return {
    //         get: function (target, prop, receiver) {
    //             return Reflect.get(target, prop, receiver);
    //         }
    //     };
    // }

    protected getEventName(id: string): string {
        const result: string = [
            EntityEvent.DataChange,
            this.repository.entityClass.modelName,
            id
        ].join(IdentifierSeperator);
        return result;
    }
}
