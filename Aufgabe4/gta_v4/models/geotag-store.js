// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

const GeoTag = require('./geotag');
const GeoTagExamples = require('./geotag-examples');

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
class InMemoryGeoTagStore{

    #geotags;
    #idCounter; //
    constructor() {
        this.#geotags = [];
        this.#idCounter = 1;
        this.#loadExamples();
        
    }

    #loadExamples() {
        const examples = GeoTagExamples.tagList;

        for (const [name, lat, lon, hashtag] of examples) {
            const tag = new GeoTag(name, lat, lon, hashtag);
            this.addGeoTag(tag);
        }
    }

    //adds a tag and assigns an id
    addGeoTag(geotag) {
        //
        if(!geotag.id) {
            //postcrement, assign the number then increment the counter
            geotag.id = this.#idCounter++;
        
        } 
        //in case the tag already has an id, check if that is is greater then or equal to our counter. 
        //If it is update our counter by 1 (so that tags don't accidentally get the same id) 
        else if (geotag.id >= this.#idCounter) { 
            this.#idCounter = geotag.id + 1;
        }
        this.#geotags.push(geotag); //add tag to the array
        return geotag; //return the newly created tag

    }

    //Get all tags
    getAllGeoTags() {
        return this.#geotags;
    }

    //Get a specific tag by ID
    getGeoTagById(id) {
        const targetId = parseInt(id); //convert the id to an integer before looping
    
    //loop through every tag in the array
    for (const tag of this.#geotags) {
        // If the ids match, return the tag immediately
        if (tag.id === targetId) {
            return tag;
        }
    }
    
    //nothing was found, return undefined
    return undefined;
    }

    //Update an existing tag
    updateGeoTag(id, newData) {
        //Find the index of the tag in the array
        // convert the incoming id to a number in case it was passed as a string from the url
        const index = this.#geotags.findIndex(tag => tag.id === parseInt(id));
        //if findIndex doesn't find a tag it returns -1
        if (index !== -1) {
            //get the specific tag object from the array using it's index
            const tag = this.#geotags[index];

            //update properties if the user sent new data for it
            //If newData.X is not undefined -> use the new name 
            //Else keep the old name
            tag.name = newData.name !== undefined ? newData.name : tag.name;
            tag.latitude = newData.latitude !== undefined ? newData.latitude : tag.latitude;
            tag.longitude = newData.longitude !== undefined ? newData.longitude : tag.longitude;
            tag.hashtag = newData.hashtag !== undefined ? newData.hashtag : tag.hashtag;

            //return updated tag object (router sends it back to the client)
            return tag;
        }
        return null; // Not found
    }

    //Delete by id instead of Name
    removeGeoTagById(id) {
       const targetId = parseInt(id); //Convert before the loop

    //Loop through the array
        for (let i = 0; i < this.#geotags.length; i++) {
            
            //Check if the current tag's id matches the one we want to delete
            if (this.#geotags[i].id === targetId) {
                
                //splice(index, howMany) removes items from an array
                //Here: Go to index 'i', and remove '1' item
                this.#geotags.splice(i, 1); 
                
                return true; //We found it and deleted it, so we return true immediately
            }
        }

        //never found the id, nothing was deleted
        return false;
    }

    
    removeGeoTag(name) {
        this.#geotags = this.#geotags.filter(tag => tag.name !== name);
    }
        


    getNearbyGeoTags(latitude, longitude, radius = 0.01) {
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        return this.#geotags.filter(tag => {
            const dist = this.#distance(
                latitude,
                longitude,
                tag.latitude,
                tag.longitude
            );

            return dist <= radius;
        });
    }

    searchNearbyGeoTags(latitude, longitude, radius, keyword) {
        const nearby = this.getNearbyGeoTags(latitude, longitude, radius);

        if (!keyword || keyword.trim() === "") {
            return nearby;
        }

        const kw = keyword.toLowerCase();

        return nearby.filter(tag => {
            return (
                tag.name.toLowerCase().includes(kw) ||
                (tag.hashtag && tag.hashtag.toLowerCase().includes(kw))
            );
        });
    }

    #distance(lat1, lon1, lat2, lon2) {
        const dx = lat1 - lat2;
        const dy = lon1 - lon2;
        return Math.sqrt(dx * dx + dy * dy);
    }

}

module.exports = InMemoryGeoTagStore
