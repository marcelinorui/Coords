namespace app.coordinateList {
    export class CoordinateListController {
        public table: app.services.ICoordData[];

        // @ngInject
        public constructor(
            public $state: ng.ui.IStateService,
            public coordService: app.services.ICoordService 
            /*,
        $controller: ng.IControllerService
        */) {
            this.table = coordService.getAll();
        }

        public onNew(): void {
            this.$state.go('coordinateEdit', { });            
        }

        public onRemove(item: app.services.ICoordData): void {            
            this.coordService.removeItem(item.id);
        }

        public onEdit(item: app.services.ICoordData): void {
            this.$state.go('coordinateEdit', { id: item.id });            
        }
    }

    angular
        .module('app.coordinateList')
        .controller('coordinateListController', CoordinateListController);
}