/*
	Dufx / Duduf Effecs Manager for After Effects

	Copyright (c) 2011-2017 Nicolas Dufresne, Rainbox Productions

	https://rainboxprod.coop

	__Contributors:__

		Nicolas Dufresne - Lead Developer

	__Translations:__


	__Thanks to:__


	__This script makes use of:__

		• libDuik
		Copyright (c) 2008 - 2017 Nicolas Dufresne, Rainbox Productions
		Licensed under the GNU General Public License v3
		libDuik is a framework for extendscript development for Adobe After Effects.
		https://rainboxprod.coop
		Source code and development: https://github.com/Rainbox-dev/Duik
		libDuik itself includes other free tools, visit the github repository or view its source code for more information.

	This file is part of Dufx

		License extract / Disclaimer / URL...

		Dufx is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.

		Dufx is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.

		You should have received a copy of the GNU General Public License
		along with Duik. If not, see <http://www.gnu.org/licenses/>.
*/

#include libduik.jsxinc

/**
 * The whole script is encapsulated to avoid global variables
 * @property {object}	thisObj		- The 'this' of the script itself, either a ScriptUI Panel or undefined
 */
(function (thisObj) {

	//================
	var version = '2.0-Alpha';
	var scriptName = 'Dufx';
	//================

	var allEffects = [];

	/*
	 * This block contains the functions of the script
	 */
	{
		/**
		 * Gets the list of all the effects of the project and populates the UI
		 */
		 function refresh()
		 {
			//keep the orignial selection
			var selectionText = typeButton.selection.text;
 			var selectionIndex = 0;
 			var matchNames = [];
 			typeButton.removeAll();
 			typeButton.add("item","All");

			 allEffects = [];
			 for(item=1;item<=app.project.items.length;item++)
 			{
 				//if it's a comp
 				if (app.project.items[item] instanceof CompItem)
 				{
 					var comp = app.project.items[item];
 					//gat all layers
 					if (comp.layers.length !=0)
 					{
 						for (lay=1;lay<=comp.layers.length;lay++)
 						{
 							//gat all effects
 							var layer = comp.layer(lay);
 							if (layer instanceof CameraLayer || layer instanceof LightLayer) continue;
 							if(layer.effect.numProperties > 0)
 							{
                                 for (fx=1;fx<=layer.effect.numProperties;fx++)
 								{
                                     allEffects.push(layer.effect(fx));
									 var matchName = layer.effect(fx).matchName;
									 //add the effect if not already there
					 				if (Duik.js.arrayIndexOf(matchNames,matchName) < 0)
					 				{
										typeButton.add("item",matchName);
										matchNames.push(matchName);
					 					//check if this is the one which must be selected
					 					if (matchName == selectionText) selectionIndex = typeButton.items.length - 1;
					 				}
                            	}
 							}
 						}
 					}
 				}
 			}
			typeButton.selection = selectionIndex;
			search();
		 }

		 /**
		  * Populates the table with effects corresponding to current search
		  */
		 function search()
		 {
			 //empty table
			 effectsList.removeAll();
			 for (var fx = 0 ; fx < allEffects.length ; fx++)
			 {
				 var ok = false
				 var effect = allEffects[fx];
				 var containingComp = Duik.utils.getPropertyComp(effect);
				 //in current comp
				 if (locationButton.selection == 2)
				 {
					 if (containingComp.id == app.project.activeItem.id) ok = true;
				 }
				 //in one of selected Comps
				 else if (locationButton.selection == 1)
				 {
					 for (var i = 0 ; i < app.project.selection.length ; i++)
					 {
						 if (containingComp.id == app.project.selection[i].id)
						 {
							 ok = true;
							 break;
						 }
					 }
				 }
				 //in all comps
				 else ok = true;

				 if (!ok) continue;
				 ok = false;

				 //check matchName
				 if (typeButton.selection > 0)
				 {
					 if (effect.matchName == typeButton.selection.text) ok = true;
				 }
				 else ok = true;

				 if (!ok) continue;

				 //check name and add to list
				 var name = effect.name;
				 var searchString = searchField.text;
				 if (!caseButton.value)
				 {
					 name = name.toLowerCase();
					 searchString = searchString.toLowerCase();
				 }
				 if (name.indexOf(searchString) >= 0)
				 {
					 var item = effectsList.add('item', effect.enabled ? '•' : 'o');
					 var layer = Duik.utils.getPropertyLayer(effect);
					 item.subItems[0].text = effect.name;
					 item.subItems[1].text = effect.matchName;
					 item.subItems[2].text = layer.containingComp.name;
					 item.subItems[3].text = layer.index + ' ' + layer.name;
					 item.effect = effect;
				 }
			 }
		 }

		 /**
		  *	Empties the search field
		  */
		 function resetSearch()
		 {
			 searchField.text = '';
			 search();
		 }

		/**
		 * Toggle the enabled property of the effects selected in the table
		 */
		function toggleEnabled()
		{
			if (effectsList.selection != null)
			{
				var enabled = !effectsList.selection[0].effect.enabled;
				var statusText = '•';
				if (!enabled) statusText = '-';
		  		for(i=0;i<effectsList.selection.length;i++)
				{
		  			effectsList.selection[i].effect.enabled = enabled;
					effectsList.selection[i].text = statusText;
		  		}
			}
		}
	}


	/*
	 * This block constructs and intializes the UI
	 */
	{
		// Load images
		function checkFile(name, content)
		{
			var file = new File(name);
			var fileContent = '';
			if (file.exists)
			{
				file.encoding = 'BINARY';
				if (file.open('r', 'TEXT', '????'))
				{
					fileContent = file.read();

					file.close();
				}
			}
			else
			{
				var folder = new Folder(file.path);
				if (!folder.exists)
				{
					folder.create();
				}
			}
			var success = fileContent == content;
			if (!success)
			{
				file.encoding = 'BINARY';
				if (file.open('w'))
				{
					success = file.write(content);
					file.close();
				}
			}
			return success;
		}

		#include Dufx_images.jsxinc

		var duFolder = new Folder(Folder.userData.fsName + '/Duduf');
		if (!duFolder.exists) duFolder.create();
		var imgFolder = new Folder(duFolder.fsName + '/DuFX').fsName;
		for (var k in scriptMng.files)
		{
			if (scriptMng.files.hasOwnProperty(k))
			{
				if (!checkFile(imgFolder + k, scriptMng.files[k]))
				{
					alert(tr("Error writing file: ") + k);
				}
			}
		}

		// Create the UI Main Palette
		var mainPalette = Duik.ui.createUI(thisObj,scriptName);


		// -------- Content -------------

		mainPalette.spacing = 5;

		var headerGroup = mainPalette.add('group');
		headerGroup.orientation = 'row';
		headerGroup.alignment = ['center','top'];

		var refreshButton = Duik.ui.addImageButton(headerGroup,'',imgFolder + '/' + 'refresh.png',"Reload effect list",imgFolder + '/' + 'refresh_o.png');
		refreshButton.group.alignment = ['fill','fill'];

		var selectorsForm = Duik.ui.addForm(headerGroup);
		selectorsForm.alignment = ['fill','top'];

		var typeButton = Duik.ui.addFormField(selectorsForm,"Type",'dropdownlist',["All"],"The type of the effect");

		var locationButton = Duik.ui.addFormField(selectorsForm,"Location",'dropdownlist',["Project","Selected Comps","Current Comp"],"Where do you want to search the effects?");

		var searchGroup = mainPalette.add('group');
		searchGroup.alignment = ['fill','top'];

		var searchButton = Duik.ui.addImageButton(searchGroup,'',imgFolder + '/' + 'search.png',"Search effect (using its name)",imgFolder + '/' + 'search_o.png');
		searchButton.group.alignment = ['left','top'];
		searchButton.group.margins = [4,4,0,0];

		var searchFieldGroup = searchGroup.add('group');
		searchFieldGroup.orientation = 'column';
		searchFieldGroup.alignment = ['fill','top'];

		var searchField = searchFieldGroup.add('edittext',undefined,"");
		searchField.alignment = ['fill','fill'];

		var caseButton = searchFieldGroup.add('checkbox',undefined,"Case sensitive");
		caseButton.alignment = ['left','top'];
		caseButton.value = false;

		var resetSearchButton = Duik.ui.addImageButton(searchGroup,'',imgFolder + '/' + 'cancel.png',"Reset search",imgFolder + '/' + 'cancel_o.png');
		resetSearchButton.group.alignment = ['right','top'];
		resetSearchButton.group.margins = [0,4,4,0];

		// add the table. Column headers do not work on CS5
		var effectsList;
		if (Duik.aeVersion >= 10 && Duik.aeVersion < 11)
		{
			effectsList = mainPalette.add("listbox",undefined,"FX",{numberOfColumns: 5,multiselect:true});
		}
		else
		{
			effectsList = mainPalette.add("listbox",undefined,"FX",{numberOfColumns: 5,columnTitles:["Active","Name","Type","Composition","Layer"],multiselect:true});
		}
		effectsList.alignment = ['fill','fill'];

		var actionsGroup = mainPalette.add('group');
		actionsGroup.alignment = ['center','bottom'];

		var activateButton = actionsGroup.add('button',undefined,"(de)activate");
		activateButton.helpTip = "(De)activate selected effects";

		var bottomGroup = mainPalette.add('group');
		bottomGroup.alignment = ['fill','bottom'];
		var urlLabel = bottomGroup.add('statictext',undefined,'rainboxprod.coop');
		urlLabel.alignment = ['left','bottom'];
		var versionLabel = bottomGroup.add('statictext',undefined,scriptName + ' v' + version);
		versionLabel.alignment = ['right','bottom'];

		// --------- Connexions ---------

		refreshButton.onClick = refresh;
		typeButton.onChange = search;
		locationButton.onChange = search;
		searchField.onChanging = search;
		searchButton.onClick = search;
		resetSearchButton.onClick = resetSearch;
		activateButton.onClick = toggleEnabled;
		caseButton.onClick = search;

		// --------- Init UI ------------
		locationButton.selection = 0;
		typeButton.selection = 0;
		refresh();


		// Show the UI
		Duik.ui.showUI(mainPalette);
	}
})(this);
