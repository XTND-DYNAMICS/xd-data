export class TestSocket {

    on(channel: string, listener: Function): TestSocket {
        console.log('Socket ON: ' + channel);
        return this;
    };

    off(channel: string, listener: Function): TestSocket {
        console.log('Socket OFF: ' + channel);
        return this;
    }

    emit(channel: string, data?: any): TestSocket {
        console.log('Socket EMIT: ' + channel);
        console.dir(data);
        return this;
    }
}
