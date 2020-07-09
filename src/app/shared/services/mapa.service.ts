import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MapaService {

  constructor(
    private http: HttpClient
  ) { }

  getViviendas(): Observable<any>  {
    return this.http.get<any>( `leaflet_web/getViviendas.do?cve_ent=01&cve_enc=765`); 
  }

  makePopup(lon: any, lat: any): string {
    return `<div>Latitud: ${lat}</div> <div>Longitud: ${lon}</div>`
  }
}
