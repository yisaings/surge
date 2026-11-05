var body = $response.body;
try {
  var o = JSON.parse(body);
  if (o && o.card && Array.isArray(o.card.member_list)) {
    o.card.member_list = [];
  }
  if (o && o.contacts) {
    o.contacts.is_show_contacts = false;
  }
  body = JSON.stringify(o);
} catch (e) {}
$done({ body: body });
