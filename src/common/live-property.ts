import _ from 'lodash';
import moment from 'moment';
import {LivePropertyTarget, EntityProperty, DataChangeKeys} from "../common/types";

export function LivePropertyDecorator(): any {

    return function (
        target: LivePropertyTarget,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): void {

        const notifyFn = (target: LivePropertyTarget, propertyKey: string, value: any | null) => {
            target.onPropertyChange(propertyKey, value);
        }

        const fieldKey = `_${propertyKey}`;
        Object.defineProperty(target, propertyKey, {

            get() {
                const value = _.get(this, fieldKey);
                // console.log(`Live Property GET (${fieldKey}:${value})`);
                return value;
            },

            set(newValue) {

                const currentValue = _.get(this, fieldKey);
                if (currentValue === newValue) {
                    // We ignore updates to equivalent values
                    return;
                }

                console.log(`Live Property SET (${fieldKey}:${newValue})`);

                _.set(this, fieldKey, newValue);
                _.set(this, EntityProperty.LastUpdated, moment().toDate());

                if (!_.get(this, DataChangeKeys.LivePropertyDisabled)) {
                    notifyFn(this as LivePropertyTarget, propertyKey, newValue);
                }
            },

            enumerable: true,
            configurable: true
        })
    };
}
