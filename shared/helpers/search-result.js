class SearchResult {
  constructor(data, start, limit, total) {
    this.data = data;
    this.start = start;
    this.limit = limit;
    this.total = total;
  }
}

module.exports = SearchResult;