let map;
let service;
let infowindow;

function initMap() {
    if (editedKeywordExtraction(document.getElementById('query').value) == 'Place'){
        document.getElementById('type').value = "Question Type: Place";
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
    } else if (editedKeywordExtraction(document.getElementById('query').value) == 'Time'){
        document.getElementById('type').value = "Question Type: Time";
    }
}

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