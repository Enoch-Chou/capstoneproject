let map;
let service;
let infowindow;

/*Utilize JavaScript Maps API and Places API to create info window for embedded map.*/ 
function initMap() {
    if (editedKeywordExtraction(document.getElementById('query').value) === 'Place'){
        document.getElementById("map").style.display = "block";
        infowindow = new google.maps.InfoWindow();
        map = new google.maps.Map(document.getElementById("map"), {
            center: google.maps.LatLng(-33.867, 151.195),
            zoom: 15
        });

        console.log(document.getElementById('displayAnswer').value);
        var search = document.getElementById('displayAnswer').value;
        console.log(search);
        const request = {
            query: search,
            fields: ["name", "geometry"]
        };

        service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
            map.setCenter(results[0].geometry.location);
            }
        });
    } else {
        document.getElementById("map").style.display = "none";
    }
}

/* Use Marker object to display marker in Google maps.*/
function createMarker(place) {
    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location
    });
    
    google.maps.event.addListener(marker, "click", () => {
        infowindow.setContent(place.name);
        infowindow.open(map);
    });
}