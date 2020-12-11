import {Observable} from "rxjs";

export interface LoopbackCrudControllerService<E> {
    findById(
        params: {
            id: string
        }
    ): Observable<E>;
}
