$(document).ready(function() {

    var aktuelleDaten;
    var daten;
    var auswahlDaten;
    var datenUrl = "http://www.reinhard-austermeier.de/infos/";
    var datei = "&datei=infos.json";
    var filterID;
    var neu;
    var editiermodus = false;
    var editieren;
    var spalten;
    var spalte1 = {};
    //var hauptDatei = "?datei=infos.json";
    var gefunden;
    var username;
    var passwort;
    var selGruppe;
    
    username = localStorage.getItem("infosUsername");
    if (!username) {
        username = "xy";
    }
    passwort = localStorage.getItem("infosPasswort");
    if (!passwort) {
        passwort = "xy";
    }

    var leseUrl;

    editiermodusSetzen();

    lesen();

    $("#inpSuche").keyup(function() {
        neuAnwenden();
    });
    $("#inpSuche").click(function() {
        $("#inpSuche").val("");
        neuAnwenden();
    });

    /*
    $("#selectDatei").change(function name() {
        speichen("sichern-datum");
        if ($( "#selectDatei" ).val() == "abmelden") {
            username = "xy";
            passwort = "xy";
        } else {
            datei = "&datei=" + $( "#selectDatei" ).val()
        }
        lesen();
    })
    */

    $("#selectGruppe").change(function name() {
        neuAnwenden();
    })

    $("#selectAktiveInaktive").change(function name() {
        neuAnwenden();
    })

    //$("#selectNaviEdit").change(function name() {
    $("#btnNaviEdit").click(function name() {
        editiermodus = !editiermodus;
        editiermodusSetzen();
        neuAnwenden();
    })

    function anwenden() {

        daten.beziehungen.forEach(b => {
            b.titel = titelSetzen(b);
            if (b.unterID && daten.beziehungen.filter(b2 => b2.oberID == b.unterID).length > 0) {
                b.plus = "+";
            } else {
                b.plus = "";
            }
        });

        var filterInhalt = "";
        var protText = "";
        if (filterID) {
            aktuelleDaten = daten.beziehungen.filter(b => b.ID == filterID | b.oberID == filterID | b.unterID == filterID);
            var element = aktuelleDaten.find(b => b.ID == filterID);
            filterInhalt = "Filter: " + element.titel + " <button id='btnFilterAufheben'>aufheben</button>";
            
            // ein Plus anzeigen wenn es Unterpunkte gibt
            /*aktuelleDaten.forEach(a => {
                if (daten.beziehungen.find(b => b.oberID == a.ID) && !a.bezeichnung) {
                    a.bezeichnung = "+"
                }
            });*/
                
            // Änderungsprotokoll
            var prot = daten.protokoll.filter(p => p.ID == filterID);
            if (prot.length == 1) {
                protText = element.datum;             
            } else {
                prot.forEach(p => {
                    for(var propName in p) {
                        if (propName == "datum") {
                            protText += propName + ": " + p[propName] + ": ";
                        }
                    }
                    for(var propName in p) {
                        if (propName != "ID" && propName != "titel" && propName != "datum") {
                            var aend;
                            if (propName == "oberID" | propName == "unterID") {
                                aend = titelSetzen(daten.beziehungen.find(b => b.ID == p[propName]));
                            } else {
                                aend = p[propName];
                            } 
                            protText += propName + ": " + aend + "; ";
                        }
                    }
                    //protText += "\r\n";
                });
            }
        } else {
            //aktuelleDaten = daten.beziehungen.filter(b => editiermodus || !daten.beziehungen.find(bo => bo.oberID == b.ID) && !daten.beziehungen.find(bo => bo.unterID == b.ID)); // nur Oberpunkte anzeigen
            aktuelleDaten = daten.beziehungen.filter(b => !daten.beziehungen.find(bo => bo.oberID == b.ID) && !daten.beziehungen.find(bo => bo.unterID == b.ID)); // nur Oberpunkte anzeigen
            if ($("#inpSuche").val() != "") {
                $("#inpSuche").val().split(" ").forEach(wort => {
                    wort = wort.toUpperCase();
                    aktuelleDaten = aktuelleDaten.filter(b => b.titel.toUpperCase().includes(wort));
                });
            }
        }    
        
        $("#divFilterAnzeige").html(filterInhalt);
        $("#divProtokollAnzeige").html(protText);

        $("#btnFilterAufheben").click(function() {
            filterID = 0;
            anwenden();
        });        
    
        //auswahlDaten = daten.beziehungen.filter(b => !(b.oberID && b.bezeichnung)).slice(0).sort( vergleichTitel );
        auswahlDaten = daten.beziehungen.slice(0).sort( vergleichTitel );

        selGruppe = $("#selectGruppe").val();
        if (selGruppe != "alleGruppen") {
            aktuelleDaten = aktuelleDaten.filter(b => b.gruppe == selGruppe);
            //auswahlDaten = auswahlDaten.filter(b => b.gruppe == selGruppe);
        }

        if ($("#selectAktiveInaktive").val() == "aktive") {
            aktuelleDaten = aktuelleDaten.filter(b => b.inaktiv == false);
            auswahlDaten = auswahlDaten.filter(b => b.inaktiv == false);
        }    
        if ($("#selectAktiveInaktive").val() == "inaktive") {
            aktuelleDaten = aktuelleDaten.filter(b => b.inaktiv == true);
            //auswahlDaten = auswahlDaten.filter(b => b.inaktiv == true);
        }    

        Globalize.locale("de");

        var datenStore = new DevExpress.data.ArrayStore({
            key: "ID",
            data: aktuelleDaten
        });

        var objektAuswahl = {
            dataSource: {
                store: auswahlDaten /*,
                sort: "titel" */
            },
            displayExpr: "titel",
            valueExpr: "ID"
        };



        spalte1.lookup = objektAuswahl;
        spalte1.dataField = "oberID";
        spalte1.caption = "Oberobjekt";
        spalte1.width = "40%";
        spalte1.calculateSortValue = nachTextSortieren;
    
        spalten = [
            spalte1, 
            {
                dataField: "plus",
                caption: "",
                width: "2%",
                allowEditing: false
            }, {
                dataField: "unterID",
                caption: "Unterobjekt",
                width: "40%",
                lookup: objektAuswahl,
                calculateSortValue: nachTextSortieren
            }, {
                dataField: "bezeichnung",
                width: "15%"
            }
        ];
        if (editiermodus) {
            spalten.push({
                dataField: "inaktiv",
                dataType: "boolean", 
                width: "5%"
            });
            spalten.push({
                dataField: "gruppe",
                lookup: {
                    dataSource: daten.gruppen
                },
                width: "15%"
            });
        }

        $("#tabelle").dxDataGrid({
            dataSource: datenStore,
            showBorders: true,
            showRowLines: true,
            //groupPanel: { visible: true },
            sorting: { mode: "multiple" },
            editing: editieren,
            //filterRow: { visible: true },
            paging: {
                pageSize: 7
            },
            columns: spalten,
            onContentReady: function (e) {

            },
            onCellClick: function (e) {
                if (!editieren.allowUpdating && e.key && !e.key.__DX_INSERT_INDEX__) {
                    if (e.displayValue && (e.displayValue.startsWith("http") || e.displayValue.startsWith("file"))) {
                        window.location.href = e.displayValue;
                    } else {
                        //var id;
                        if (e.value == e.displayValue || !e.displayValue) {
                            filterID = e.key;
                        } else {
                            filterID = e.value;
                        }
                        //window.location.href = window.location.href.split("?")[0] + "?id=" + id;
                        anwenden();
                    }
                }
            },
            onInitNewRow: function(e) {
                if (filterID) {
                    e.data.oberID = filterID;
                }

                if (selGruppe != "alleGruppen") {
                    e.data.gruppe = selGruppe;
                } else {
                    daten.gruppen[0];
                }

                e.data.inaktiv = false;
            },
            /*
            onEditingStart: function(e) {
                editierModus = true;
            },*/
            onRowInserting: function(e) {
                if (e.data.bezeichnung) {
                    e.data.bezeichnung = e.data.bezeichnung.trim();
                }
                gefunden = e.data.bezeichnung && daten.beziehungen.find(b => b.bezeichnung == e.data.bezeichnung && b.gruppe == selGruppe);
                if (gefunden) {
                    gefunden.inaktiv = false;
                    gefunden.updaten = true;
                }
            },
            onRowInserted: function(e) {
                neu = e.data;
                if (!gefunden) {
                    neu.ID = e.key;
                    daten.beziehungen.push(neu);
                    neu.datum = new Date().toLocaleString();
                    //daten.protokoll.push(zuletztAngelegt);
                } else {
                    neu.ID = gefunden.ID;
                }
                //neueDaten.push(zuletztAngelegt);
                neu.titel = titelSetzen(neu);
                auswahlDaten.unshift(neu);
                speichen();
            },
            onRowUpdated: function(e) {
                var bAlt = daten.beziehungen.find(b => b.ID == e.key)
                for (var propName in e.data) {
                    bAlt[propName] = e.data[propName];
                }
                bAlt.datum = new Date().toLocaleString();
                bAlt.updaten = true;
                speichen();
            },
            onRowRemoved: function(e) {
                $.ajax({
                    url: leseUrl + datei,
                    dataType: "json",
                    success: function( data, status, xhr ) {
                        daten = data;
                        daten.beziehungen.find(b => b.ID == e.key).löschen = true;
                        for( var i = 0; i < daten.beziehungen.length; i++){ 
                            if ( daten.beziehungen[i].ID === e.key) {
                                daten.beziehungen.splice(i, 1); 
                            }
                        }
                        //speichen("sichern-datum");
                        $.ajax({
                            url: datenUrl + "daten.php?aktion=speichern",
                            dataType: "json",
                            type: "POST",
                            data: { daten: JSON.stringify(daten), aktion: "sichern-datum" },
                            error: function( xhr, status, error ) {
                                alert("Fehler beim Speichern");
                            }
                        });
                    },
                    error: function( xhr, status, error ) {
                        alert("Fehler beim Lesen vor dem Speichern");
                    }
                });
            }
        });
        
        function nachTextSortieren (data) {
            var value = this.calculateCellValue(data);
            return this.lookup.calculateCellValue(value);
        }
        
    }
    
    function neuAnwenden() {
        spalte1.sortIndex = 0;
        spalte1.sortOrder = "asc";

        anwenden();
    }

    function titelSetzen(datensatz) {
        var t = "";
        if (datensatz.bezeichnung) {
            t = datensatz.bezeichnung;
        }
        if (datensatz.oberID) {
            var ds = daten.beziehungen.find(b => b.ID == datensatz.oberID);
            if (ds) {
                if (datensatz.bezeichnung) {
                    t += "(";
                }
                t += titelSetzen(ds);
            }
        }
        if (datensatz.unterID) {
            var ds = daten.beziehungen.find(b => b.ID == datensatz.unterID);
            if (ds) {
                t += ": " + titelSetzen(ds);
                if (datensatz.bezeichnung) {
                    t += titelSetzen(ds) + ")";
                }
            }
        }
        return t;
    }

    function speichen(aktion) {
        
        neuAnwenden();

        //daten.gruppen.forEach(gruppe => {
            //datei = "infos-" + gruppe + ".json";
            $.ajax({
                //url: leseUrl + "&datei=" + datei,
                url: leseUrl + datei,
                dataType: "json",
                success: function( speicherDaten, status, xhr ) {
    
                    /*
                    aktuelleDaten.forEach(element => {
                        reo(element);
                    });
                    function reo(element) {
                        if (element.oberID) {
                            var elem = daten.beziehungen.find(b => b.ID == element.oberID)
                            if (elem) {
                                elem.gruppe = element.gruppe;
                                elem.updaten = true;
                                reo(elem);
                            }
                        }
                        if (element.unterID) {
                            var elem = daten.beziehungen.find(b => b.ID == element.unterID)
                            if (elem) {
                                elem.gruppe = element.gruppe;
                                elem.updaten = true;
                                reo(elem);
                            }
                        }
                    }
                    */
    
                    daten.beziehungen.forEach(element => {
                        /*
                        if (element.titel.includes("ütz") && element.gruppe == "Reini-privat") {
                            element.gruppe = "Schützenvorstand";
                            element.updaten = true;
                        }
                        */
                        element.titel = null;
                        var elemVorhanden = speicherDaten.beziehungen.find(b => b.ID == element.ID);
                        if (!elemVorhanden) {
                            speicherDaten.beziehungen.push(element);
                            speicherDaten.protokoll.push(element);
                        } else {
                            if (element.updaten) {
                                element.updaten = null;
                                var prot = {ID: element.ID};
                                for (var propName in element) {
                                    if (elemVorhanden[propName] != element[propName]) {
                                        elemVorhanden[propName] = element[propName];
                                        prot[propName] = element[propName];
                                    }
                                }
                                speicherDaten.protokoll.push(prot);
                            }
                        }
                    });
    
                    speicherDaten.protokoll = null; // temporär wg Dateigröße 6.11.
                    //speicherDaten.dateien = null;

                    $.ajax({
                        url: datenUrl + "daten.php?aktion=speichern",
                        dataType: "json",
                        type: "POST",
                        //data: { daten: JSON.stringify(speicherDaten), aktion: aktion, datei: datei },
                        data: { daten: JSON.stringify(speicherDaten), aktion: aktion},
                        error: function( xhr, status, error ) {
                            alert("Fehler beim Speichern");
                        }
                    });
                },
                error: function( xhr, status, error ) {
                    alert("Fehler beim Lesen vor dem Speichern");
                }
            });
        //});
    }

    function editiermodusSetzen () {
        //if ($("#selectNaviEdit").val() == "navi") {
        if (editiermodus) {
            $("#btnNaviEdit").html("Navigieren");
            editieren = {
                mode: "cell",
                allowUpdating: true,
                allowAdding: true,
                allowDeleting: true
            };
        } else {
            $("#btnNaviEdit").html("Editieren");
            editieren = {
                mode: "cell",
                allowUpdating: false,
                allowAdding: true,
                allowDeleting: false
            };
        }
    }    

    function lesen() {
        $("#divAnmeldung").hide();
        $("#divAnzeige").show();

        leseUrl = datenUrl + "daten.php" + "?aktion=lesen" + "&username=" + username.toLowerCase() + "&passwort=" + passwort;
        
        $.getJSON(leseUrl + datei , function( data ) {
            if (!data.Fehler) {
                localStorage.setItem("infosUsername", username);
                localStorage.setItem("infosPasswort", passwort);

                daten = data;
    
                daten.beziehungen.forEach(b => {
                    b.titel = titelSetzen(b);
                });
        
                //auswahlDaten = daten.beziehungen.filter(b => !(b.oberID && b.bezeichnung)).slice(0).sort( vergleichTitel );
        
                var option = '<option></option>';
                option += '<option value=abmelden>Abmelden</option>';
                /*
                for (var i=0;i<daten.dateien.length;i++){
                    option += '<option value="'+ daten.dateien[i] + '">' + daten.dateien[i] + '</option>';
                }
                $('#selectDatei').append(option);
                */

                option = '';
                daten.gruppen.forEach(gruppe => {
                    option += '<option value="'+ gruppe + '">' + gruppe + '</option>';
                });
                $('#selectGruppe').append(option);
                $('#selectGruppe').val(daten.gruppen[0]);
        
                filterID = 0;
    
                anwenden();
            } else{
                anmelden();
            }
        } );
    }

    function anmelden() {
        $("#divAnmeldung").show();
        $("#divAnzeige").hide();
        $("#btnAnmelden").click( function () {
            username = $("#inpUsername").val();
            passwort = $("#inpPasswort").val();
            lesen();
        });
    }

    function bezeichnungAusObjekt(daten, id) {
        var bez = "";
        var obj;
        obj = daten.beziehungen.find(o => o.ID == id);
        if (obj) {
            bez = obj.bezeichnung;
        }
        return bez;
    }

    function vergleichTitel( a, b ) {
        if ( a.titel < b.titel ){
          return -1;
        }
        if ( a.titel > b.titel ){
          return 1;
        }
        return 0;
    }
    /*function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }    
        }    
    };*/    
} );    


