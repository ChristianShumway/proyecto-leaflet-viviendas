import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L  from 'leaflet';
import { MapaService } from '../../../../shared/services/mapa.service';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';

const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
  backgroundColor:  '#e85141'
});

L.Marker.prototype.options.icon = iconDefault;


@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnInit, AfterViewInit {
  private map;
  listaViviendas: any[] = [];
  
  constructor(
    private mapaService: MapaService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.initMap();
    this.getViviendas()
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 19.4263466279, -99.1266128269 ],
      zoom: 5
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });
    tiles.addTo(this.map);
  }

  getViviendas(){
    this.mapaService.getViviendas().subscribe(
      result =>  {
        let markerArray = [];

        result.map( vivienda => {
          const geoGeojson = JSON.parse(vivienda.geojson_geo);
          const lat = JSON.parse(geoGeojson.coordinates[0]);
          const lon = JSON.parse(geoGeojson.coordinates[1]);
          const marker = L.marker([lon, lat], {});
          marker.bindPopup(this.mapaService.makePopup(lat, lon));
          marker.addTo(this.map);
          // marker.on('click', function(e) {
          //   this.map.setView(e.latlng, 13)
          // });
          
          // console.log(marker._latlng);
          this.listaViviendas.push(marker._latlng);

          
          markerArray.push(L.marker([lon, lat]));
        });
        // console.log(this.listaViviendas);
        const group = L.featureGroup(markerArray);
        this.map.fitBounds(group.getBounds());
      },
      error => console.log(error)
    );
  }
  
  levelZoom(e){
    console.log(e.latlng);
    this.map.setView(e.latlng, 13);
  }

}
