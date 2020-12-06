import {Chance} from 'chance';
import {EntityRepositoryDataAdapter} from "../src/loopback";
import {TestEntity, TestRepository, TestSocket} from "./mocks";
import {Socket} from "socket.io-client";

const chance = new Chance();

describe('EntityRepositoryDataAdapter', () => {
    describe('refById', () => {
        it('should work', () => {

            const entityId: string = 'test-1234-5678-0000';

            // @ts-ignore
            const adapter = new EntityRepositoryDataAdapter(new TestSocket() as unknown as Socket, new TestRepository());

            const entityRef: TestEntity = adapter.refById(entityId) as TestEntity;
            entityRef.name = chance.name();

            entityRef.destroy();
        });
    });
});
