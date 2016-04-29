namespace app.utils {
    declare var LatLon: any;
    declare var Utm: any;
    declare var Dms: any;
    declare var Mgrs: any;

    let degFmt = 0;
    let fixDig = '';
    let utmDigits = 0;

    export class LatLongCoord implements app.services.ICoordData {
        id: number;
        latlong: {
            lat: string | number,
            long: string | number
        };
        utm: string;
        mgrs: string;

        constructor(lat: number, lng: number) {           
            let ll = new LatLon(lat, lng);
            let utm = ll.toUtm(utmDigits);
            let mgrs = utm.toMgrs().toString();
            
            this.id = -1;
            this.latlong = {
                lat: ll.lat,
                long: ll.lon
            }
            this.utm = utm.toString(utmDigits);
            this.mgrs = mgrs;
        }
    }


    export class UtmCoord implements app.services.ICoordData {
        id: number;
        latlong: {
            lat: string | number
            , long: string | number
        };
        utm: string;
        mgrs: string;

        constructor(utmString: string) {
            let utm = Utm.parse(utmString);
            let ll = utm.toLatLonE();
            let mgrs = utm.toMgrs().toString();

            this.id = -1;
            this.latlong = {
                lat: ll.lat,
                long: ll.lon
            };
            this.utm = utmString;
            this.mgrs = mgrs;
        }
    }
    
     export class MgrsCoord implements app.services.ICoordData {
        id: number;
        latlong: {
            lat: string | number
            , long: string | number
        };
        utm: string;
        mgrs: string;

        constructor(mgrsString: string) {            
            let mgrs = Mgrs.parse(mgrsString);
            let utmCoord = mgrs.toUtm();
            let utm = utmCoord.toString(utmDigits);
            let ll = utmCoord.toLatLonE();

            this.id = -1;
            this.latlong = {
                lat: ll.lat,
                long: ll.lon
            };
            this.utm = utm;
            this.mgrs = mgrs.toString();
        }
    }
}