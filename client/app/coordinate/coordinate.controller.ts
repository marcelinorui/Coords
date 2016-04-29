namespace app.coordinate {

    class CoordinateController {
        itemType: string;
        item: app.services.ICoordData;
                
        // @ngInject
        constructor(
            public coordService: app.services.ICoordService, 
            public $state: ng.ui.IStateService) {
            if ( $state.params['id'] ){
              this.itemType = 'E';
              this.item = coordService.getOne($state.params['id']);   
            } else {
              this.itemType = 'N';
              this.item = coordService.newItem();
            }            
        }
        
        public onSave() {
            this.coordService.save(this.item);
            this.$state.go('coordinateList');
        }
    }

    angular
        .module('app.coordinate')
        .controller('coordinateController', CoordinateController);
}