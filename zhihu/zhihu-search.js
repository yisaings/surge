var body = $response.body;
var url = $request.url;
try {
  var o = JSON.parse(body);
  if (url.indexOf("/search/preset_words?") !== -1 && o && o.preset_words) {
    o.preset_words.words = [];
    body = JSON.stringify(o);
  } else if (url.indexOf("/search/recommend_query/v2") !== -1 && o && o.recommend_queries) {
    o.recommend_queries.queries = [];
    body = JSON.stringify(o);
  } else if (url.indexOf("/search/hot_search") !== -1 && o && Array.isArray(o.hot_search_queries)) {
    o.hot_search_queries = [];
    body = JSON.stringify(o);
  }
} catch (e) {}
$done({ body: body });
