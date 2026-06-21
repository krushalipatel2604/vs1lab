// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

// Here the API used for geolocations is selected
// The following declaration is a 'mockup' that always works and returns a fixed position.
var GEOLOCATION_API = {
    getCurrentPosition: function (onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1775140116396
        });
    }
};

// This is the real API.
// If there are problems with it, comment out the line.
GEOLOCATION_API = navigator.geolocation;

function GeoTag(name, latitude, longitude, hashtag = null, id = null) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.hashtag = hashtag;
    this.id = id;
}

//run once the page loads
let mapManager = null;
let mapInitialized = false;

let currentPage = 1;
let currentTotalPages = 1;
const pageLimit = 3; //number of items per page for pagination


/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 * Auslesen der Position mit `findLocation`
 * Im Erfolgsfall `latitude` und `longitude` Eingabefelder des Tagging-Formulars *und* 
 * des Discovery-Formulars (versteckte Eingabefelder) suchen und in deren `value`-Attribute Koordinaten schreiben.
 * Rufen sie die neue `updateLocation`-Funktion nach dem Laden des Dokuments automatisch auf.
 */
// ... your code here ...1. Teilaufgabe: Koordinaten in die Formulare eintragen


function updateLocation() {
    console.log("Updating location...");

    const tagLatitude = document.getElementById('tag-latitude');
    const tagLongitude = document.getElementById('tag-longitude');
    const discoveryLatitude = document.getElementById('discovery-latitude');
    const discoveryLongitude = document.getElementById('discovery-longitude');

    const existingLatitude = tagLatitude.value;
    const existingLongitude = tagLongitude.value;

    // If coordinates are already present in the form, use them. Otherwise, find the current location.
    if (existingLatitude !== "" && existingLongitude !== "") {
        applyLocation(existingLatitude, existingLongitude);
    } else {
        LocationHelper.findLocation((helper) => {
            applyLocation(helper.latitude, helper.longitude);
        });
    }
}

function applyLocation(latitude, longitude) {
    const tagLatitude = document.getElementById('tag-latitude');
    const tagLongitude = document.getElementById('tag-longitude');
    const discoveryLatitude = document.getElementById('discovery-latitude');
    const discoveryLongitude = document.getElementById('discovery-longitude');

    if (tagLatitude) tagLatitude.value = latitude;
    if (tagLongitude) tagLongitude.value = longitude;
    if (discoveryLatitude) discoveryLatitude.value = latitude;
    if (discoveryLongitude) discoveryLongitude.value = longitude;

    const mapImage = document.getElementById("mapView");
    if (mapImage) mapImage.remove();

    const mapContainer = document.getElementById("map");
    if (mapContainer) {
        const mapText = mapContainer.querySelector("p, span");
        if (mapText) mapText.remove();
    }
    if(!mapInitialized) {
        mapManager = new MapManager();
        mapManager.initMap(latitude, longitude);
        mapInitialized = true;
    }


    let taglist = [];
    
    // Prüfen, ob der Container existiert und das Attribut lesen
    if (mapContainer) {
        const tagsJSON = mapContainer.getAttribute('data-tags');
        
        if (tagsJSON) {
            taglist = JSON.parse(tagsJSON);
        }
    }

    // UpdateMarkers mit dem Parameter 'taglist' aufrufen
    mapManager.updateMarkers(latitude, longitude, taglist);
}

function getDiscoverySearchParameters() {
    const searchterm = document.getElementById('searchterm').value;
    const latitude = document.getElementById('discovery-latitude').value;
    const longitude = document.getElementById('discovery-longitude').value;

    return new URLSearchParams({
        searchterm: searchterm,
        latitude: latitude,
        longitude: longitude,
        page: currentPage,
        limit: pageLimit
    });
}

function updateDiscoveryResults(geotags) {
    const discoveryResults = document.getElementById('discoveryResults');

    if (discoveryResults) {
        discoveryResults.innerHTML = '';

        for (const geotag of geotags) {
            const listItem = document.createElement('li');
            listItem.textContent = `${geotag.name} ( ${geotag.latitude},${geotag.longitude}) ${geotag.hashtag ?? ''}`;
            discoveryResults.appendChild(listItem);
        }
    }
}

async function goToPreviousPage() {
    if(currentPage <= 1) {
        return; //already on the first page, do nothing
    }
    currentPage--;
    await refreshDiscoveryWidget();
}

async function goToNextPage() {
    if(currentPage >= currentTotalPages) {
        return; //already on the last page, do nothing
    }
    currentPage++;
    await refreshDiscoveryWidget();
}


function updatePaginationControls(paginationData) {
    const paginationControls = document.getElementById('paginationControls');

    if (!paginationControls) {
        return;
    }

    currentPage = paginationData.page;
    currentTotalPages = paginationData.totalPages;

    paginationControls.innerHTML = ''; // Clear existing controls

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Zurück';
    prevButton.type = 'button';
    prevButton.disabled = paginationData.page <= 1;
    prevButton.addEventListener('click', goToPreviousPage);

    const pageInfo = document.createElement('span');
    pageInfo.textContent = ' Seite ' + currentPage + ' von ' + currentTotalPages + ' ';

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Weiter';
    nextButton.type = 'button';
    nextButton.disabled = paginationData.page >= paginationData.totalPages;
    nextButton.addEventListener('click', goToNextPage);

    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(pageInfo);
    paginationControls.appendChild(nextButton);
}

function updateDiscoveryMap(geotags) {
    const mapContainer = document.getElementById('map');
    const latitude = document.getElementById('discovery-latitude').value;
    const longitude = document.getElementById('discovery-longitude').value;

    if (mapContainer) {
        mapContainer.setAttribute('data-tags', JSON.stringify(geotags));
    }

    const mapImage = document.getElementById('mapView');
    if (mapImage) {
        mapImage.remove();
    }

    if (mapContainer) {
        const mapText = mapContainer.querySelector('p, span');
        if (mapText) {
            mapText.remove();
        }
    }

    if(!mapInitialized) {
        mapManager = new MapManager();
        mapManager.initMap(latitude, longitude);
        mapInitialized = true;
    }
    mapManager.updateMarkers(latitude, longitude, geotags);
}

async function refreshDiscoveryWidget() {
    const queryParameters = getDiscoverySearchParameters();

    const response = await fetch(`/api/geotags?${queryParameters.toString()}`, {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`Discovery request failed with status ${response.status}`);
    }

    const paginationData = await response.json();

    currentTotalPages = paginationData.totalPages;
    currentPage = paginationData.page;

    const geotags = paginationData.items;

    updateDiscoveryResults(geotags);
    updateDiscoveryMap(geotags);
    updatePaginationControls(paginationData);

    return paginationData;
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    //alert("Please change the script 'geotagging.js'");
    
    updateLocation(); // Update location once the page has loaded
    
    // Register event listeners for both forms
    const tagForm = document.getElementById('tag-form');
    const discoveryForm = document.getElementById('discoveryFilterForm');
    
    // Event listener for the tagging form
    if (tagForm) {
        tagForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            if (!tagForm.checkValidity()) {
                tagForm.reportValidity();
                return;
            }

            const name = document.getElementById('name').value;
            const latitude = document.getElementById('tag-latitude').value;
            const longitude = document.getElementById('tag-longitude').value;
            const hashtag = document.getElementById('hashtag').value;

            const geotag = new GeoTag(name, latitude, longitude, hashtag);

            try {
                const response = await fetch('/api/geotags', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(geotag)
                });

                if (!response.ok) {
                    throw new Error(`Tagging request failed with status ${response.status}`);
                }

                const createdTag = await response.json();
                console.log('Created GeoTag:', createdTag);

                currentPage = 1; // Reset to first page to show the newly added tag
                await refreshDiscoveryWidget();
            } catch (error) {
                console.error('Error while sending GeoTag:', error);
            }
        });
    }
    
    // Event listener for the discovery form
    if (discoveryForm) {
        discoveryForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            if (!discoveryForm.checkValidity()) {
                discoveryForm.reportValidity();
                return;
            }

            try {
                currentPage = 1; // Reset to first page on new search
                const paginationData = await refreshDiscoveryWidget();
                console.log('Discovery results:', paginationData);
            } catch (error) {
                console.error('Error while fetching discovery results:', error);
            }
        });
    }
});