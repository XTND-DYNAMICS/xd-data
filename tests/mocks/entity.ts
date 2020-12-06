import {Entity, ModelDefinition} from "../../src/common";
import {LivePropertyDecorator as live} from '../../src/common';

export class TestEntity extends Entity {

    static definition: ModelDefinition = {
        name: 'TestModel'
    };

    constructor() {
        super();
    }

    @live()
    name: string;
}
