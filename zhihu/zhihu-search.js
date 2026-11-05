var body = $response.body;
var url = $request.url;
try {
  var o = JSON.parse(body);
  if (url.indexOf("/search/preset_words?") !== -1 && o && o.preset_words && Array.isArray(o.preset_words.words)) {
    o.preset_words.words = o.preset_words.words.filter(function (w) {
      var q = (w && w.query) || "";
      return q.indexOf("会员") === -1;
    });
    body = JSON.stringify(o);
  } else if (url.indexOf("/search/recommend_query/v2") !== -1 && o && o.recommend_queries && Array.isArray(o.recommend_queries.queries)) {
    o.recommend_queries.queries = o.recommend_queries.queries.filter(function (q) {
      return !(q && q.ad_commercial_json);
    });
    body = JSON.stringify(o);
  }
} catch (e) {}
$done({ body: body });
