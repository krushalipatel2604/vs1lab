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

    constructor() {
        this.#geotags = [];
        this.#loadExamples();
    }

    #loadExamples() {
        const examples = GeoTagExamples.tagList;

        for (const [name, lat, lon, hashtag] of examples) {
            const tag = new GeoTag(name, lat, lon, hashtag);
            this.addGeoTag(tag);
        }
    }

    addGeoTag(geotag) {
        this.#geotags.push(geotag);
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
