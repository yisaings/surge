var body = $response.body;
try {
  var o = JSON.parse(body);
  if (o && Array.isArray(o.data)) {
    var QA = { answer: 1, question: 1 };
    var NONQA = { video: 1, zvideo: 1, live: 1, article: 1, column: 1, ad: 1, promotion: 1, mall: 1, game: 1, novel: 1, story: 1, knowledge: 1 };
    o.data = o.data.filter(function (it) {
      if (!it || typeof it !== "object") return false;
      if (it.type === "ComponentCardList") return false;
      var ex = it.extra || {};
      var ct = ex.content_type || "";
      if (QA[ct]) return true;
      if (NONQA[ct]) return false;
      var tid = ex.test_id || "";
      var pre = tid.split(".")[0];
      if (QA[pre]) return true;
      if (NONQA[pre]) return false;
      return true;
    });
  }
  if (o && o.fresh_text) {
    o.fresh_text = "";
  }
  body = JSON.stringify(o);
} catch (e) {}
$done({ body: body });
