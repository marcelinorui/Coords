var app;
(function (app) {
    angular.module('app', [
        'ui.router',
        'app.services',
        'app.coordinate',
        'app.coordinateList',
        'googleMap'
    ]);
})(app || (app = {}));

var app;
(function (app) {
    var coordinate;
    (function (coordinate) {
        angular.module('app.coordinate', [
            'ui.router',
            'app.services',
            'googleMap'
        ]);
    })(coordinate = app.coordinate || (app.coordinate = {}));
})(app || (app = {}));

var app;
(function (app) {
    var coordinateList;
    (function (coordinateList) {
        angular.module('app.coordinateList', [
            'ui.router',
            'app.services',
            'app.coordinate'
        ]);
    })(coordinateList = app.coordinateList || (app.coordinateList = {}));
})(app || (app = {}));

var app;
(function (app) {
    var googlemap;
    (function (googlemap) {
        angular.module('googleMap', []);
    })(googlemap = app.googlemap || (app.googlemap = {}));
})(app || (app = {}));

var app;
(function (app) {
    var services;
    (function (services) {
        angular.module('app.services', []);
    })(services = app.services || (app.services = {}));
})(app || (app = {}));

var app;
(function (app) {
    var services;
    (function (services) {
        var CoordService = (function () {
            function CoordService() {
                this.nextId = 1;
                this.data = [];
                this.init();
            }
            CoordService.prototype.setItem = function (dt, item) {
                this.dataItemType = dt;
                this.dataItem = item;
            };
            CoordService.prototype.newItem = function () {
                return {
                    id: -1,
                    latlong: {
                        lat: '',
                        long: ''
                    },
                    utm: '',
                    mgrs: ''
                };
            };
            CoordService.prototype.removeItem = function (id) {
                var idx = this.findIndexById(id);
                this.data.splice(idx, 1);
            };
            CoordService.prototype.findIndexById = function (id) {
                for (var idx = 0; idx < this.data.length; idx++) {
                    if (this.data[idx].id == id) {
                        return idx;
                    }
                }
                return -1;
            };
            CoordService.prototype.getAll = function () {
                return this.data;
            };
            CoordService.prototype.getOne = function (id) {
                var idx = this.findIndexById(id);
                return this.data[idx];
            };
            CoordService.prototype.getItemType = function () {
                return this.dataItemType;
            };
            CoordService.prototype.getItem = function () {
                return this.dataItem;
            };
            CoordService.prototype.save = function (item) {
                var idx = this.findIndexById(item.id);
                if (idx < 0) {
                    item.id = this.nextId++;
                    this.data.push(item);
                }
                else {
                    this.data[idx] = item;
                }
            };
            CoordService.prototype.init = function () {
                this.save(new app.utils.LatLongCoord(38.8167061815206, -9.117622375488281));
                this.save(new app.utils.MgrsCoord('29S MC 91877 99082'));
                this.save(new app.utils.UtmCoord('29 N 493251 4302552'));
            };
            CoordService.Factory = function () {
                return new CoordService();
            };
            return CoordService;
        }());
        CoordService.Factory.$inject = [];
        angular
            .module('app.services')
            .factory('coordService', CoordService.Factory);
    })(services = app.services || (app.services = {}));
})(app || (app = {}));

var app;
(function (app) {
    var coordinate;
    (function (coordinate) {
        var CoordinateController = (function () {
            CoordinateController.$inject = ['coordService', '$state'];
            function CoordinateController(coordService, $state) {
                this.coordService = coordService;
                this.$state = $state;
                if ($state.params['id']) {
                    this.itemType = 'E';
                    this.item = coordService.getOne($state.params['id']);
                }
                else {
                    this.itemType = 'N';
                    this.item = coordService.newItem();
                }
            }
            CoordinateController.prototype.onSave = function () {
                this.coordService.save(this.item);
                this.$state.go('coordinateList');
            };
            return CoordinateController;
        }());
        angular
            .module('app.coordinate')
            .controller('coordinateController', CoordinateController);
    })(coordinate = app.coordinate || (app.coordinate = {}));
})(app || (app = {}));

var app;
(function (app) {
    var coordinateList;
    (function (coordinateList) {
        var CoordinateListController = (function () {
            CoordinateListController.$inject = ['$state', 'coordService'];
            function CoordinateListController($state, coordService) {
                this.$state = $state;
                this.coordService = coordService;
                this.table = coordService.getAll();
            }
            CoordinateListController.prototype.onNew = function () {
                this.$state.go('coordinateEdit', {});
            };
            CoordinateListController.prototype.onRemove = function (item) {
                this.coordService.removeItem(item.id);
            };
            CoordinateListController.prototype.onEdit = function (item) {
                this.$state.go('coordinateEdit', { id: item.id });
            };
            return CoordinateListController;
        }());
        coordinateList.CoordinateListController = CoordinateListController;
        angular
            .module('app.coordinateList')
            .controller('coordinateListController', CoordinateListController);
    })(coordinateList = app.coordinateList || (app.coordinateList = {}));
})(app || (app = {}));

var app;
(function (app) {
    var googlemap;
    (function (googlemap) {
        var GoogleMapDirective = (function () {
            function GoogleMapDirective() {
                this.restrict = 'A';
                this.replace = false;
            }
            GoogleMapDirective.prototype.link = function (scope, element, attrs) {
                var _this = this;
                var mapOptions;
                var addMarker = function (pos) {
                    var myLatlng = new google.maps.LatLng(pos.lat, pos.lng);
                    var marker = new google.maps.Marker({
                        position: myLatlng,
                        draggable: true
                    });
                    marker.setMap(_this.map);
                    _this.map.setCenter(marker.getPosition());
                    var listener = google.maps.event.addListener(marker, 'dragend', function () {
                        var item = new app.utils.LatLongCoord(marker.getPosition().lat(), marker.getPosition().lng());
                        scope.cc.item = item;
                        scope.$apply();
                    });
                    scope.$on('$destroy', function () {
                        google.maps.event.removeListener(listener);
                    });
                };
                var editMarker = function (scope, element, attrs) {
                    var mapOptions = {
                        zoom: 12,
                        center: new google.maps.LatLng(scope.cc.item.latlong.lat, scope.cc.item.latlong.long),
                        scaleControl: true,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapTypeControlOptions: {
                            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                        }
                    };
                    _this.map = new google.maps.Map(document.getElementById(attrs.id));
                    _this.map.setOptions(mapOptions);
                    addMarker({ lat: scope.cc.item.latlong.lat, lng: scope.cc.item.latlong.long });
                };
                var newMarker = function (scope, element, attrs) {
                    var mapOptions = {
                        zoom: 12,
                        scaleControl: true,
                        center: new google.maps.LatLng(38.73908844187687, -9.1351318359375),
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapTypeControlOptions: {
                            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                        }
                    };
                    _this.map = new google.maps.Map(document.getElementById(attrs.id));
                    _this.map.setOptions(mapOptions);
                    var listener = google.maps.event.addListenerOnce(_this.map, 'click', function (e) { return onMapClick(e); });
                    scope.$on('$destroy', function () {
                        google.maps.event.removeListener(listener);
                    });
                };
                var onMapClick = function (e) {
                    addMarker({
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng()
                    });
                    var item = new app.utils.LatLongCoord(e.latLng.lat(), e.latLng.lng());
                    scope.cc.item = item;
                    scope.$apply();
                };
                if (scope.cc.item.latlong.lat !== '') {
                    editMarker(scope, element, attrs);
                }
                else {
                    newMarker(scope, element, attrs);
                }
            };
            GoogleMapDirective.Factory = function () {
                return new GoogleMapDirective();
            };
            return GoogleMapDirective;
        }());
        angular
            .module('googleMap')
            .directive('map', GoogleMapDirective.Factory);
    })(googlemap = app.googlemap || (app.googlemap = {}));
})(app || (app = {}));

var app;
(function (app) {
    initDebug.$inject = ['$compileProvider'];
    initRouter.$inject = ['$locationProvider', '$urlRouterProvider', '$stateProvider'];
    angular
        .module('app')
        .config(initDebug)
        .config(initRouter);
    function initDebug($compileProvider) {
        $compileProvider.debugInfoEnabled(true);
    }
    function initRouter($locationProvider, $urlRouterProvider, $stateProvider) {
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
})(app || (app = {}));

var app;
(function (app) {
    Template.$inject = ['$templateCache'];
    function Template($templateCache) {
        $templateCache.put('coordinate', '<div class=\"col-md-6\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Latitude:</label><input type=\"text\" class=\"form-control\" ng-model=\"cc.item.latlong.lat\"></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Longitude:</label><input type=\"text\" class=\"form-control\" ng-model=\"cc.item.latlong.long\"></div></div><div class=\"col-md-12\"><div class=\"form-group\"><label>UTM:</label><input type=\"text\" class=\"form-control\" ng-model=\"cc.item.utm\"></div><div class=\"form-group\"><label>MGRS:</label><input type=\"text\" class=\"form-control\" ng-model=\"cc.item.mgrs\"></div></div></div><div class=\"row\"><div class=\"col-md-offset-4 col-md-8\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"cc.onSave()\">Save</button> <button type=\"button\" class=\"btn btn-primary\" ui-sref=\"coordinateList()\">Cancel</button></div></div></div><div class=\"col-md-6\"><div map id=\"gmap\" style=\"width:100%;height: 450px;border: 1px solid #333335;margin-bottom:20px\"></div></div>');
        $templateCache.put('coordinateList', '<table ng-controller=\"coordinateListController as clc\" class=\"table table-striped table-condensed\"><thead><tr><th>#</th><th>Lat/Long</th><th>UTM</th><th>MGRS</th><th><button class=\"btn btn-sm btn-default\" ng-click=\"clc.onNew()\">New</button></th><th></th></tr></thead><tbody><tr ng-repeat=\"item in clc.table\"><td>{{item.id}}</td><td>{{item.latlong.lat}}<br>{{item.latlong.long}}</td><td>{{item.utm}}</td><td>{{item.mgrs}}</td><td><a class=\"btn btn-sm btn-warning\" ng-click=\"clc.onEdit(item)\">Edit</a> <a class=\"btn btn-sm btn-danger\" ng-click=\"clc.onRemove(item)\">Remove</a></td><td></td></tr></tbody></table>');
    }
    angular.module('app').run(Template);
})(app || (app = {}));

var app;
(function (app) {
    var utils;
    (function (utils) {
        var degFmt = 0;
        var fixDig = '';
        var utmDigits = 0;
        var LatLongCoord = (function () {
            function LatLongCoord(lat, lng) {
                var ll = new LatLon(lat, lng);
                var utm = ll.toUtm(utmDigits);
                var mgrs = utm.toMgrs().toString();
                this.id = -1;
                this.latlong = {
                    lat: ll.lat,
                    long: ll.lon
                };
                this.utm = utm.toString(utmDigits);
                this.mgrs = mgrs;
            }
            return LatLongCoord;
        }());
        utils.LatLongCoord = LatLongCoord;
        var UtmCoord = (function () {
            function UtmCoord(utmString) {
                var utm = Utm.parse(utmString);
                var ll = utm.toLatLonE();
                var mgrs = utm.toMgrs().toString();
                this.id = -1;
                this.latlong = {
                    lat: ll.lat,
                    long: ll.lon
                };
                this.utm = utmString;
                this.mgrs = mgrs;
            }
            return UtmCoord;
        }());
        utils.UtmCoord = UtmCoord;
        var MgrsCoord = (function () {
            function MgrsCoord(mgrsString) {
                var mgrs = Mgrs.parse(mgrsString);
                var utmCoord = mgrs.toUtm();
                var utm = utmCoord.toString(utmDigits);
                var ll = utmCoord.toLatLonE();
                this.id = -1;
                this.latlong = {
                    lat: ll.lat,
                    long: ll.lon
                };
                this.utm = utm;
                this.mgrs = mgrs.toString();
            }
            return MgrsCoord;
        }());
        utils.MgrsCoord = MgrsCoord;
    })(utils = app.utils || (app.utils = {}));
})(app || (app = {}));
