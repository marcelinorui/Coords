namespace app {
    angular
        .module('app')
        .config(initDebug)
        .config(initRouter)
    ;


    // @ngInject
    function initDebug($compileProvider: ng.ICompileProvider): void {
        $compileProvider.debugInfoEnabled(true);
    }


    // @ngInject
    function initRouter(
                        $locationProvider: ng.ILocationProvider, 
                        $urlRouterProvider: ng.ui.IUrlRouterProvider,
                        $stateProvider: ng.ui.IStateProvider): void {

        //$locationProvider.html5Mode({enabled: true});
        $urlRouterProvider.otherwise('/coordinate');
        
        $stateProvider
            .state('coordinateList', {
                url: '/coordinate',
                templateUrl: 'coordinateList',
                controller: 'coordinateListController as clc',
            })
            .state('coordinateEdit', {
                url: '/coordinate/edit/:id',
                templateUrl: 'coordinate',
                controller: 'coordinateController as cc'
            });
    }
}