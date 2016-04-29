namespace app.services {
    export interface ICoordData {
        id: number,
        latlong: {
            lat: string|number
            , long: string|number
        },
        utm: string,
        mgrs: string
    }

    export interface ICoordService {
        setItem(dt: string, item: ICoordData): void;
        newItem(): ICoordData;
        removeItem(idx: number): void;
        findIndexById(id: number): number;
        getAll(): ICoordData[];
        getOne(idx: number): ICoordData;
        getItemType(): string;
        getItem(): ICoordData;
        save(item: ICoordData): void;
    }

    class CoordService implements ICoordService {
        data: ICoordData[];
        dataItem: ICoordData;
        dataItemType: string;
        nextId: number;

        constructor() {
            this.nextId = 1;
            this.data = [];
            this.init();
        }

        setItem(dt: string, item: ICoordData) {
            this.dataItemType = dt;
            this.dataItem = item;
        }

        newItem(): ICoordData {
            return {
                id: -1,
                latlong: {
                    lat: '',
                    long: ''
                },
                utm: '',
                mgrs: ''
            }
        }

        removeItem(id: number) {
            let idx = this.findIndexById(id);
            this.data.splice(idx, 1);
        }

        findIndexById(id: number): number {
            for (let idx = 0; idx < this.data.length; idx++) {
                if (this.data[idx].id == id) {
                    return idx;
                }
            }
            return -1;
        }

        getAll() {
            return this.data;
        }

        getOne(id: number) {
            let idx = this.findIndexById(id);
            return this.data[idx];
        }

        getItemType() {
            return this.dataItemType;
        }

        getItem(): ICoordData {
            return this.dataItem;
        }

        save(item: ICoordData) {
            let idx = this.findIndexById(item.id);
            if (idx < 0) {
                item.id = this.nextId++;
                this.data.push(item);
            } else {
                this.data[idx] = item;
            }
        }

        init() {
            this.save(new app.utils.LatLongCoord(38.8167061815206,-9.117622375488281));
            this.save(new app.utils.MgrsCoord('29S MC 91877 99082'));
            this.save(new app.utils.UtmCoord('29 N 493251 4302552'));
            
        }

        // @ngInject
        static Factory() {
            return new CoordService();
        }
    }

    CoordService.Factory.$inject = [];

    angular
        .module('app.services')
        .factory('coordService', CoordService.Factory)
}