// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');
const store = new GeoTagStore();

/**
 * The module "geotag-store" exports a class PaginatedGeoTagResult. 
 * It represents paginated results for GeoTags.
 */
const PaginatedGeoTagResult = require('../models/paginated-geotag-result');
// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {
  res.render('index', {
      taglist: [],
      latitude: "",
      longitude: ""
  });
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

// TODO: ... your code here ...
//returns an object now instead of an array
router.get('/api/geotags', (req, res) => {
    const { searchterm, latitude, longitude } = req.query;   //req.query contains the parameters attached to the url

    let page = parseInt (req.query.page) || 1; //default to page 1 if not provided
    const limit = 3; //change limit here if you want more items per page

    //to prevent 0 or negative values for page and limit which would break the pagination logic
    page = Math.max(page, 1);

    //fetch all tags from the store
    let results = store.getAllGeoTags();

    // If both latitude and longitude are provided, filter by radius
    if (latitude && longitude) {
        results = store.searchNearbyGeoTags(latitude, longitude, 0.01, searchterm);
    } 
    // If only a searchterm is provided, filter the whole list
    else if (searchterm) {
        const kw = searchterm.toLowerCase(); //convert to lowercase before comparing
        results = results.filter(tag => 
            tag.name.toLowerCase().includes(kw) || 
            (tag.hashtag && tag.hashtag.toLowerCase().includes(kw))
        );
    }

    //pagination logic
    const totalItems = results.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit)); //at least 1 page even if there are no items

    page = Math.min(page, totalPages); //randfall: if requested page exceeds total pages, return last page
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pagedResults = results.slice(startIndex, endIndex);  //extract the items for the current page

    //convert the final list into JSON and send it back as the response
    const paginatedResult = new PaginatedGeoTagResult(pagedResults, page, limit, totalItems);
    res.json(paginatedResult);
});


/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.post('/api/geotags', (req, res) => {
  //req.body contains the JSON data sent by the frontend's AJAX request
    const { name, latitude, longitude, hashtag } = req.body;
    
    //create new tag object
    const newTag = new GeoTag(name, latitude, longitude, hashtag);
    
    //add to store (which assigns the ID)
    const savedTag = store.addGeoTag(newTag);

    //return 201 means Created, set location header, and return the JSON
    res.status(201)
       .location(`/api/geotags/${savedTag.id}`)
       .json(savedTag);
});

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.get('/api/geotags/:id', (req, res) => {
  //req.params.id gets the id from the url
    const tag = store.getGeoTagById(req.params.id);
    //If the tag was found, send it back
    if (tag) {
        res.json(tag);
    } else {
        res.status(404).json({ message: "GeoTag not found" }); //If not, send 404 error
    }
});

/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

// TODO: ... your code here ...
router.put('/api/geotags/:id', (req, res) => {
  //req.params.id: which tag should be updated and req.body: with what new data
    const updatedTag = store.updateGeoTag(req.params.id, req.body);
    if (updatedTag) {
        res.json(updatedTag);
    } else {
        res.status(404).json({ message: "GeoTag not found" });
    }
});

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.delete('/api/geotags/:id', (req, res) => {
    //get tag before deleting to send it back
    const deletedtag = store.getGeoTagById(req.params.id);
    //delete tag
    const success = store.removeGeoTagById(req.params.id);
    
    if (success) {
        res.json(deletedtag); //wiederspruch readme line 50? here we send back the deleted object (readme says not to)
    } else {
        res.status(404).json({ message: "GeoTag not found" });
    }
});

module.exports = router;
