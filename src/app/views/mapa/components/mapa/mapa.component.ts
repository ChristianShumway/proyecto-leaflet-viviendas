import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L  from 'leaflet';
import * as PouchDB from '../../../../../../node_modules/pouchdb/dist/pouchdb.js';

import { MapaService } from '../../../../shared/services/mapa.service';
import { environment } from './../../../../../environments/environment';
import { ActivatedRoute, Params } from '@angular/router';

const leafletcached = require("../../../../../assets//librerias_externas/pouchdbcached.js");
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
  private layer;
  listaViviendas: any[];
  latLonViviendas: any[] = [];
  private polygon;
  panelOpenState = false;
  livingPlaceCount: number = 0;
  cveEnt;
  cveEnc;

  constructor(
    private mapaService: MapaService,
    private activatedRoute: ActivatedRoute
  ) { console.log(PouchDB)}

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.initMap();
    this.getViviendas()
  }

  getViviendas(){
    this.activatedRoute.params.subscribe ( (params:Params) => {
      console.log(params);
      this.cveEnt = params.cveEnt;
      this.cveEnc = params.cveEnc;

      this.mapaService.getViviendas(this.cveEnt, this.cveEnc)
      .then(
        response =>  {
          this.listaViviendas = response;
          let markerArray = [];
          console.log(this.listaViviendas);
          
          response.map( vivienda => {
            const color = vivienda.color.replace(/ /g,",");
            const geoGeojson = JSON.parse(vivienda.geojson_geo);
            const lat = JSON.parse(geoGeojson.coordinates[0]);
            const lon = JSON.parse(geoGeojson.coordinates[1]);
            const circle = L.circleMarker([lon, lat], {
              radius: 20,
              color: `rgba(${color})`,
            });
            
            circle.bindPopup(this.mapaService.makePopup(lat, lon));
            circle.addTo(this.map);
            this.latLonViviendas.push(circle._latlng);
            markerArray.push(L.marker([lon, lat]));
          });
  
          const group = L.featureGroup(markerArray);
          this.map.fitBounds(group.getBounds());
        }
      ).catch(  error => console.log(error) )
    });
    // this.cveEnt = '01';
    // this.cveEnc = '765';
  }

  printMapViviendas(){
    this.livingPlaceCount = 0;
    let offset = 0;
    this.panelOpenState = false;

    this.listaViviendas.map( vivienda => {
      setTimeout( () => {
        if(this.polygon){
          this.clearEntidad();
        }

        this.polygon = L.geoJSON(JSON.parse(vivienda.geojson_buffer_geo)).addTo(this.map);
        this.moveZoom();
        this.livingPlaceCount = this.livingPlaceCount + 1;
        if (this.livingPlaceCount === this.listaViviendas.length) {
          this.clearEntidad();
        }

        console.log(vivienda);
      }, 5000 + offset );
      offset += 5000;
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
			console.log('Desde Cache: ', ev.url);
		});
		this.layer.on('tilecachemiss',function(ev){
			console.log('No Cacheado: ', ev.url);
		});
		this.layer.on('tilecacheerror',function(ev){
			console.log('Cache error: ', ev.tile, ev.error);
		});

    this.layer.addTo(this.map);
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
			console.log('Desde Cache: ', ev.url);
		});
		wmsLayer.on('tilecachemiss',function(ev){
			console.log('no cacheado: ', ev.url);
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
