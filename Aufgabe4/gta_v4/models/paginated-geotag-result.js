//Helper class to represent paginated results for GeoTags
class PaginatedGeoTagResult {
    constructor(items, page, limit, totalItems) {
        this.items = items;
        this.page = page;
        this.limit = limit;
        this.totalItems = totalItems;
        this.totalPages = Math.ceil(totalItems / limit);
    }
}

module.exports = PaginatedGeoTagResult;