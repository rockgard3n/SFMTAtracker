// this picks the bus route you want to mess with
//const selectedRoute = "1";


// const url = "http://api.511.org/transit/VehicleMonitoring?api_key=f0e7e4f5-928b-4378-abdd-2f04c0c4d0ae&agency=SF"

function createMap() {
    // TODO: add your own access token
    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9ja2dhcmQzbiIsImEiOiJja3hxYnFhd3Q1MnVrMm5vY3hhNGtwaWg2In0.JhEvifYpx8vXyOf4vSq8ng';
  
    //makes map
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.4377, 37.7912],
        zoom: 13,
      });
    
     //makes my custom marker icon 
     
      map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
        if (error) throw error;
        map.addImage('custom-marker', image);
    
        console.log("image loaded");

        });

        console.log("created map")

        // calls the funciton to make markers
    setMarkers(map);

    //calls function to update markers to show movement of busses
    setInterval(updateMarkers, 30000, map);
      }
    

//loads main funciton when window loads
/*
window.onload = () => {
      createMap();
    };
*/


var count = 0;

//this function sets up the markers using a GEOJSON format
async function setMarkers(map) {
    // calls the collect function and then breaks it into outbound and inbound data arrays 
    
    //collects input for direction
    var rawInputDir = document.getElementById("busDirection");
    var selectedDir = rawInputDir.value;

    console.log("SetMarkers() called")
      var BusObject = await collect();

      console.log(Date.now() + " " + BusObject.Inbound.features[0].geometry.coordinates);

    if(selectedDir == "IB"){  
         //creates the GeoJSON and adds my inbound bus route
        map.addSource('IB', {
            'type': 'geojson',
            'data': BusObject.Inbound
        });
          //takes the geojson and adds a layer to the map to show us our bus markers    
        map.addLayer({
            'id': 'IB',
            'type': 'symbol',
            'source': 'IB',
            'layout': {
                'icon-image': 'custom-marker',
                // get the title name from the source's "title" property
                'text-field': ['get', 'title'],
                'text-font': [
                    'Open Sans Semibold',
                    'Arial Unicode MS Bold'
                ],
                'text-offset': [0, 1.25],
                'text-anchor': 'top'
            }
        });
    } else {
        //creates the GeoJSON and adds my outbound bus route
        map.addSource('OB', {
            'type': 'geojson',
            'data': BusObject.Outbound
        });
         //takes the geojson and adds a layer to the map to show us our bus markers    
        map.addLayer({
            'id': 'OB',
            'type': 'symbol',
            'source': 'OB',
            'layout': {
                'icon-image': 'custom-marker',
                // get the title name from the source's "title" property
                'text-field': ['get', 'title'],
                'text-font': [
                    'Open Sans Semibold',
                    'Arial Unicode MS Bold'
                ],
                'text-offset': [0, 1.25],
                'text-anchor': 'top'
            }
        });
    };
      
    }

//this funciton updates the GEOJSON with the live position of the busses and the the layer of the markers is updated to show the movement    
async function updateMarkers(map) {
    count++;
    console.log("Loop # start: " + count)
    BusObject = await collect();
    
        //collects input for direction
    const rawInputDir = document.getElementById("busDirection");
    const selectedDir = rawInputDir.value;

    console.log(Date.now() + " " + BusObject.Inbound.features[0].geometry.coordinates);
    if(selectedDir == "IB"){
        map.getSource('IB').setData(BusObject.Inbound);
    } else {
        map.getSource('OB').setData(BusObject.Outbound);
    };

    console.log("Loop # end: " + count);
}


//this functions leverages data pulled from getBusLocations() and sorts the busses for the desired route, then sorts locations of busses on inbound and outbound routes into two seperate arrays
//the commented out sections of the below function create a sorted array of all of the bus routes. Initially i was going to create this list programatically every time the page is loaded. But since the bus routes themselves wont change I decided to hard code it in.
async function collect(){
    console.log("collect() called");
    //collects input for route
    var rawInput = document.getElementById("routeElement");
    var selectedRoute = rawInput.value;


    const rawLocations = await getBusLocations();
    var RouteLocationsIB = [];
    var RouteLocationsOB = [];
    //var routeList = [];
    rawLocations.forEach((route) => {
        //routeList.push(route.MonitoredVehicleJourney.LineRef);
        if (route.MonitoredVehicleJourney.LineRef == selectedRoute) {
            if (route.MonitoredVehicleJourney.DirectionRef == "OB") {
                RouteLocationsOB.push({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [Number(route.MonitoredVehicleJourney.VehicleLocation.Longitude), Number(route.MonitoredVehicleJourney.VehicleLocation.Latitude)]
                    },
                    "properties":{
                        "BusID": route.MonitoredVehicleJourney.VehicleRef
                    }
                }); 
            }
            else if (route.MonitoredVehicleJourney.DirectionRef == "IB") {
                RouteLocationsIB.push({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [Number(route.MonitoredVehicleJourney.VehicleLocation.Longitude), Number(route.MonitoredVehicleJourney.VehicleLocation.Latitude)]
                    },
                    "properties":{
                        "BusID": route.MonitoredVehicleJourney.VehicleRef
                    }
                }); 
            }
        }
    });
    //console.log(routeList);
    //let uniqueRouteList = [...new Set(routeList)];
    //uniqueRouteList.sort();
    //console.log("test " + uniqueRouteList);


    var geojsonRouteIB = {
        "type": "FeatureCollection", "features": RouteLocationsIB
    }
    var geojsonRouteOB = {
        "type": "FeatureCollection", "features": RouteLocationsOB
    }
    let BusObject = {Inbound: geojsonRouteIB, Outbound: geojsonRouteOB};
    return BusObject;

}


// this async funciton pulls the data from the SFMTA API, and cuts out just the part we need which is the bus details
async function getBusLocations(){
    console.log("getBusLocations() called");
    const url = "https://api.511.org/transit/VehicleMonitoring?api_key=f0e7e4f5-928b-4378-abdd-2f04c0c4d0ae&agency=SF"
    const response = await fetch(url);
    const json = await response.json();
    console.log(json.Siri.ServiceDelivery.VehicleMonitoringDelivery.VehicleActivity)
    // console.log(json.Siri.ServiceDelivery.VehicleMonitoringDelivery.VehicleActivity[0].MonitoredVehicleJourney.VehicleLocation)
    return json.Siri.ServiceDelivery.VehicleMonitoringDelivery.VehicleActivity;
}

