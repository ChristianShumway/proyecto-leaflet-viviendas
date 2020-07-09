import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';

import { MapaRoutingModule } from './mapa-routing.module';
import { MapaComponent } from './components/mapa/mapa.component';


@NgModule({
  declarations: [
    MapaComponent
  ],
  imports: [
    CommonModule,
    MapaRoutingModule,
    MaterialModule
  ]
})
export class MapaModule { }
