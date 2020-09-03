/* Utilize JavaScript Maps API and Places API to display an embedded map through a info window.*/
function initMap() {
    if (classifyQuestionType(document.getElementById('query').value) === 'Place'){
        document.getElementById("map").style.display = "block";
        const infowindow = new google.maps.InfoWindow();
        const map = new google.maps.Map(document.getElementById("map"), {
            center: google.maps.LatLng(-33.867, 151.195),
            zoom: 15
        });

        var search = document.getElementById('displayAnswer').value;
        const request = {
            query: search,
            fields: ["name", "geometry"]
        };

        const service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (let i = 0; i < results.length; i++) {
                    createMarker(results[i], map, infowindow);
                }
                map.setCenter(results[0].geometry.location);
                }
        });
    } else {
        document.getElementById("map").style.display = "none";
    }
}

/* Use Marker object to display marker in Google maps.*/
function createMarker(place, map, infowindow) {
    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location
    });
    
    google.maps.event.addListener(marker, "click", () => {
        infowindow.setContent(place.name);
        infowindow.open(map);
    });
}
