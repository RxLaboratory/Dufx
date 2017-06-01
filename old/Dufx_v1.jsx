/*
	

Dufx / Duduf FX Manager for After Effects
Copyright (c) 2011 Nicolas Dufresne
http://www.duduf.net



This file is part of Dufx.

     Dufx is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

     Dufx is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with  Dufx. If not, see <http://www.gnu.org/licenses/>.
*/	

	//================
	var version = "1.1";
	//================


function FXManager(thisObj) {


//lister les différents types
function listerTypes() {

var types = ["Tous"];

	//parcourir le projet
	for(i=1;i<=app.project.items.length;i++) {
		if (app.project.items[i] instanceof CompItem) {
			var compo = app.project.items[i];
			//pour chaque comp parcourir les calques
			if (compo.layers.length !=0) {
				for (j=1;j<=compo.layers.length;j++) {
					//parcourir les effets
					if (!(app.project.items[i].layer(j) instanceof CameraLayer) && !(app.project.items[i].layer(j) instanceof LightLayer)) {
                            if(app.project.items[i].layer(j).effect.numProperties !=0) {
                                for (k=1;k<=app.project.items[i].layer(j).effect.numProperties;k++) {
                                    var type = compo.layer(j).effect(k).matchName;
                                    //parcourir les types pour ajouter seulement si c'est un nouveau
                                    var nouveau = true;
                                    for (l=0;l<types.length;l++) if (type == types[l]) nouveau = false;
                                    if (nouveau) types.push(type);
                                }
                          }
                      }
				}
			}
		}
delete compo;
delete type;
}
 typeList.removeAll();
for (i=0;i<types.length;i++) typeList.add("item",types[i]);
typeList.selection = 0;
}

//chercher les FX
function listerFX() {
var FX = [];
//chercher dans tout le projet
if (emplacementFX.selection == 0) {
	//parcourir le projet
	for(i=1;i<=app.project.items.length;i++) {
		if (app.project.items[i] instanceof CompItem) {
			var compo = app.project.items[i];
			//pour chaque comp parcourir les calques
			if (compo.layers.length !=0) {
				for (j=1;j<=compo.layers.length;j++) {
					//parcourir les effets
                        if (!(app.project.items[i].layer(j) instanceof CameraLayer) && !(app.project.items[i].layer(j) instanceof LightLayer)) {
                            if(compo.layer(j).effect.numProperties !=0) {
                                for (k=1;k<=compo.layer(j).effect.numProperties;k++) {
                                var effet = compo.layer(j).effect(k);
                                if (typeList.selection != null && (typeList.selection.text == "Tous" || effet.matchName == typeList.selection.text))
                                FX.push([effet.matchName,effet.name,effet.enabled,j,compo.name,i,j,k]);
                                }
                            }
					}
				}
			}
		}
	}
delete compo;
delete effet;
}
//chercher dans les compos sélectionnées
if (emplacementFX.selection == 1) {
	//parcourir le projet
	for(i=1;i<=app.project.items.length;i++) {
		if (app.project.items[i] instanceof CompItem && app.project.items[i].selected) {
			var compo = app.project.items[i];
			//pour chaque comp parcourir les calques
			if (compo.layers.length !=0) {
                if (!(app.project.items[i].layer(j) instanceof CameraLayer) && !(app.project.items[i].layer(j) instanceof LightLayer)) {
				for (j=1;j<=compo.layers.length;j++) {
					//parcourir les effets
					if(compo.layer(j).effect.numProperties !=0) {
						for (k=1;k<=compo.layer(j).effect.numProperties;k++) {
						var effet = compo.layer(j).effect(k);
						if (typeList.selection != null && (typeList.selection.text == "Tous" || effet.matchName == typeList.selection.text))
						FX.push([effet.matchName,effet.name,effet.enabled,j,compo.name,i,j,k]);
						}
                        }
					}
				}
			}
		}
	}
delete compo;
delete effet;
}
//chercher dans la compo active
if (emplacementFX.selection == 2) {
			var compo = app.project.activeItem;
			//chercher l'index de la compo active (on en a besoin pour pouvoir la retrouver et activer/desactiver les FX
			for (i=1;i<=app.project.items.length;i++) { if (app.project.items[i] == compo) break };
			//pour chaque comp parcourir les calques
			if (compo.layers.length !=0) {
				for (j=1;j<=compo.layers.length;j++) {
                    if (!(app.project.items[i].layer(j) instanceof CameraLayer) && !(app.project.items[i].layer(j) instanceof LightLayer)) {
					//parcourir les effets
					if(compo.layer(j).effect.numProperties !=0) {
						for (k=1;k<=compo.layer(j).effect.numProperties;k++) {
						var effet = compo.layer(j).effect(k);
						if (typeList.selection != null && (typeList.selection.text == "Tous" || effet.matchName == typeList.selection.text))
						FX.push([effet.matchName,effet.name,effet.enabled,j,compo.name,i,j,k]);
						}
                        }
					}
				}
	}
delete compo;
delete effet;
}
//construire la liste
listeFX.removeAll();
for (i=0;i<FX.length;i++) {
	var FXItem = listeFX.add('item',eval(FX[i][2])?"X":"-");
	FXItem.subItems[0].text = FX[i][1];
	FXItem.subItems[1].text = FX[i][0];
	FXItem.subItems[2].text = FX[i][3];
	FXItem.subItems[3].text = FX[i][4];
    FXItem.C = FX[i][5];
    FXItem.L = FX[i][6];
    FXItem.E = FX[i][7];
	}
delete FXItem;
}

//activer FX sélectionnés
function activerFX() {  
	if (listeFX.selection != null) {
		for(i=0;i<listeFX.selection.length;i++) {
			var FXItem = listeFX.selection[i];
			app.project.item(FXItem.C).layer(FXItem.L).effect(FXItem.E).enabled = true;
			}
		listerFX();
		}
    }

//désactiver FX sélectionnés
function desactiverFX() {  
	if (listeFX.selection != null) {
		for(i=0;i<listeFX.selection.length;i++) {
			 var FXItem = listeFX.selection[i];
			app.project.item(FXItem.C).layer(FXItem.L).effect(FXItem.E).enabled = false;
			}
		listerFX();
		}
    }


// FENETRE FX
var fenetreFX = (thisObj instanceof Panel) ? thisObj : new Window("palette","Gestionnaire FX");
fenetreFX.bounds = [300,300,500,800];
fenetreFX.add("statictext",[2,5,80,20],"Type :");
var boutonRefreshTypes = fenetreFX.add("button",[82,2,100,22],"R");
boutonRefreshTypes.onClick = listerTypes;
var typeList = fenetreFX.add("dropdownlist",[102,2,198,20],["Tous"]);
typeList.selection = 0;
typeList.onChange = listerFX;
fenetreFX.add("statictext",[2,41,100,56],"Emplacement :");
var emplacementFX = fenetreFX.add("dropdownlist",[102,36,198,56],["Projet","Compositions sélectionnées","Composition Active"]);
emplacementFX.selection = 0;
emplacementFX.onChange = listerFX;
//les titre de colonnes ne fonctionnent pas sur CS5
if (app.version.substring(0,app.version.indexOf(".")) == "10")
    var listeFX = fenetreFX.add("listbox",[2,58,198,300],"FX",{numberOfColumns: 5,/*showHeaders: true,columnTitles:["Actif","Nom","Type","Calque","Composition"],*/multiselect:true});
else
    var listeFX = fenetreFX.add("listbox",[2,58,198,300],"FX",{numberOfColumns: 5,showHeaders: true,columnTitles:["Actif","Nom","Type","Calque","Composition"],multiselect:true});
var boutonActiverFX = fenetreFX.add("button",[2,302,66,320],"Activer");
boutonActiverFX.onClick = activerFX;
var boutonDesactiverFX = fenetreFX.add("button",[68,302,133,320],"Désactiver");
boutonDesactiverFX.onClick = desactiverFX;
fenetreFX.add("statictext",[135,302,198,320],"v" + version);

listerTypes();

}

FXManager(this);