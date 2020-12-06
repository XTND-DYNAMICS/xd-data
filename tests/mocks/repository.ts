import moment from 'moment';
import {Chance} from 'chance';
import {TestEntity} from './entity';
import {EntityProperty, EntityRepository} from '../../src/common';

const chance = new Chance();

export class TestRepository implements EntityRepository<TestEntity> {

  entityClass: any = TestEntity;

  findById(id: string): Promise<TestEntity> {
    return new Promise((resolve, reject) => {
      resolve({
        [EntityProperty.ID]: id,
        [EntityProperty.LastUpdated]: moment().toDate(),
        name: chance.name(),
      } as TestEntity);
    });
  }
}
