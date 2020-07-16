import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L  from 'leaflet';
import * as PouchDB from 'pouchdb';

import { MapaService } from '../../../../shared/services/mapa.service';
import { environment } from './../../../../../environments/environment';

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

var tilesDb = {
  getItem: function (key) {
      // return Promise that has the image Blob/File/Stream.
  },

  saveTiles: function (tileUrls) {
      // return Promise.
  },

  clear: function () {
      // return Promise.
  }
};


@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnInit, AfterViewInit {
  private map;
  private layer;
  listaViviendas: any[]; 
  latLonViviendas: any[] = [];
  private polygon;
  
  constructor(
    private mapaService: MapaService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.initMap();
    this.getViviendas()
  }

  getViviendas(){
    this.mapaService.getViviendas().subscribe(
      response =>  {
        this.listaViviendas = response;
        let markerArray = [];
        response.map( vivienda => {
          const geoGeojson = JSON.parse(vivienda.geojson_geo);
          const lat = JSON.parse(geoGeojson.coordinates[0]);
          const lon = JSON.parse(geoGeojson.coordinates[1]);
          const circle = L.circleMarker([lon, lat], {
            radius: 20,
            color: `#${vivienda.color}`
          });
          // console.log(vivienda.color);
          circle.bindPopup(this.mapaService.makePopup(lat, lon));
          circle.addTo(this.map);
          // marker.on('click', function(e) {
          //   this.map.setView(e.latlng, 13)
          // });
          
          // console.log(marker._latlng);
          this.latLonViviendas.push(circle._latlng);

          
          markerArray.push(L.marker([lon, lat]));
        });
        // console.log(this.latLonViviendas);
        const group = L.featureGroup(markerArray);
        this.map.fitBounds(group.getBounds());
      },
      error => console.log(error)
    );
  }

  printMapViviendas(){
    // const entidad = this.listaEntidades.find( entidad => entidad.cve_ent === cveEntidad);
    // console.log(this.listaViviendas);

    this.listaViviendas.map( vivienda => {
      setTimeout(() => {
      if(this.polygon){
        this.clearEntidad();
      }
        console.log(vivienda);
        // this.polygon = L.geoJSON(JSON.parse(vivienda.geojson_buffer_geo)).addTo(this.map);
        // this.moveZoom();
      }, 5000);
    });

  }

  clearEntidad(){
    this.map.removeLayer(this.polygon);
  };

  moveZoom(){
    this.map.fitBounds(this.polygon.getBounds());
  }

  private initMap(): void {
    // this.map = L.map('map', {
    //   center: [ 19.4263466279, -99.1266128269 ],
    //   zoom: 5,
    //   useCache: true,
	  //   crossOrigin: true
    // });

    // const tiles = L.tileLayer(environment.urlTemplate, {
    //   maxZoom: 19
    // });
    // tiles.addTo(this.map);

    this.map = L.map('map',{ crs: L.CRS.EPSG900913}).setView([40,-100], 4);

    this.layer = L.tileLayer.wms('geoserver/mnv/wms?', {
      layers: 'td_localidades',
      transparent:true,
      format: 'image/gif',
      //cql_filter:"ambito='U'",
      id: 'xpain.test-cach',
      useCache: true,
      crossOrigin: true
    });

    this.layer.on('tilecachehit',function(ev){
			console.log('Dese Cache: ', ev.url);
		});
		this.layer.on('tilecachemiss',function(ev){
			console.log('No Cacheado: ', ev.url);
		});
		this.layer.on('tilecacheerror',function(ev){
			console.log('Cache error: ', ev.tile, ev.error);
		});

    this.layer.addTo(this.map);

    // L.TileLayer.PouchDBCached
// L.TileLayer.addInitHook(function() {
//   if (!this.options.useCache) {
//     this._db = null;
//     this._canvas = null;
//     return;
//   }

//   this._db = new PouchDB('offline-tiles');
//   this._canvas = document.createElement('canvas');

//   if (!(this._canvas.getContext && this._canvas.getContext('2d'))) {
   
//     this._canvas = null;
//   }
// });

// L.TileLayer.prototype.options.useCache = false;
// L.TileLayer.prototype.options.saveToCache = true;
// L.TileLayer.prototype.options.useOnlyCache = false;
// L.TileLayer.prototype.options.cacheFormat = 'image/png';
// L.TileLayer.prototype.options.cacheMaxAge = 24 * 3600 * 1000;


   
    this.layerWMS();
    this.displayProgress();
    
  }

  layerWMS(){
    var wmsLayer = L.tileLayer.wms("NLB_CE/balancer.do?map=/opt/map/viviendaproduc.map&", {
			layers: 'c100,c103t,c101,c108t,c109t,c113t,c500t,c530t,c102t,c114t,c110,c501t,c531t,c809,c502t,c532t,c503t,c536t,c533t,c537t,c112t,c119t,c111t,c539t,c116t,c504t,c529t,c534t,c535t,c505t',
			format: 'image/png',
			transparent: true,
			attribution: "INEGI 2020",
			
			EDO:'01',
			NIVEL:'PB',
			CONTORNO:'FALSE',
			EAR:'TRUE',
			EGR:'TRUE',
			EGU:'TRUE',

			useCache: true,
			//cacheMaxAge: 30 * 1000,	// 30 seconds
			crossOrigin: true
    });
    
		wmsLayer.addTo(this.map);

		wmsLayer.on('tilecachehit',function(ev){
			console.log('Cache hit: ', ev.url);
		});
		wmsLayer.on('tilecachemiss',function(ev){
			console.log('Cache miss: ', ev.url);
		});
		wmsLayer.on('tilecacheerror',function(ev){
			console.log('Cache error: ', ev.tile, ev.error);
    });
  }
  
  // Seed the base layer, for the whole world, for zoom levels 0 through 4.
  seed() {
    var bbox = L.latLngBounds(L.latLng(-80,-180), L.latLng(85,180));
    this.layer.seed( bbox, 0, 4 );
  }

  displayProgress(){
     // Display seed progress on console
		this.layer.on('seedprogress', function(seedData){
			var percent = 100 - Math.floor(seedData.remainingLength / seedData.queueLength * 100);
			console.log('Seeding ' + percent + '% done');
		});
		this.layer.on('seedend', function(seedData){
			console.log('Cache seeding complete');
		});
  }
  
  levelZoom(e){
    console.log(e.latlng);
    this.map.setView(e.latlng, 13);
  }

}
