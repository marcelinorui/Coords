namespace app.googlemap {
    class GoogleMapDirective implements ng.IDirective {
        map: google.maps.Map;
        restrict: string = 'A';
        replace: boolean = false;
        template: '<div></div>';
        marker: google.maps.Marker;
        scope: any;

        link(scope: any, element: any, attrs: any) {
            let mapOptions: google.maps.MapOptions;

            let addMarker = (pos: google.maps.LatLngLiteral): void => {
                let myLatlng = new google.maps.LatLng(pos.lat, pos.lng);

                let marker = new google.maps.Marker({
                    position: myLatlng,
                    draggable: true
                });

                marker.setMap(this.map);

                this.map.setCenter(marker.getPosition());
                let listener = google.maps.event.addListener(marker, 'dragend', () => {
                    let item = new app.utils.LatLongCoord(marker.getPosition().lat(),marker.getPosition().lng());
                    scope.cc.item = item;
                    scope.$apply();
                });

                scope.$on('$destroy', () => {
                    google.maps.event.removeListener(listener);
                });
            };

            let editMarker = (scope: any, element: any, attrs: any) => {
                let mapOptions: google.maps.MapOptions = {
                    zoom: 12,
                    center: new google.maps.LatLng(scope.cc.item.latlong.lat, scope.cc.item.latlong.long),
                    scaleControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                    }
                };
                this.map = new google.maps.Map(document.getElementById(attrs.id));
                this.map.setOptions(mapOptions);
                addMarker(<google.maps.LatLngLiteral>{ lat: scope.cc.item.latlong.lat, lng: scope.cc.item.latlong.long });
            };

            let newMarker = (scope: any, element: any, attrs: any) => {
                let mapOptions: google.maps.MapOptions = {
                    zoom: 12,
                    scaleControl: true,
                    center: new google.maps.LatLng(38.73908844187687, -9.1351318359375),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                    }
                };

                this.map = new google.maps.Map(document.getElementById(attrs.id));
                this.map.setOptions(mapOptions);

                let listener = google.maps.event.addListenerOnce(this.map, 'click', (e: any) => onMapClick(e));

                scope.$on('$destroy', () => {
                    google.maps.event.removeListener(listener);
                });
            };

            let onMapClick = (e: any): void => {
                addMarker(<google.maps.LatLngLiteral>{
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                });
                
                let item = new app.utils.LatLongCoord(e.latLng.lat(),e.latLng.lng());
                scope.cc.item = item;                
                scope.$apply();
            };

            if (scope.cc.item.latlong.lat !== '') {
                editMarker(scope, element, attrs);
            } else {
                newMarker(scope, element, attrs);
            }


        }

        // @ngInject
        static Factory() {
            return new GoogleMapDirective();
        }
    }
    
    angular
        .module('googleMap')
        .directive('map', GoogleMapDirective.Factory);
}