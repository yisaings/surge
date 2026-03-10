let headers = $request.headers;

let AU = "";
let UA = "";
let BUVID = "";

if ($argument){
  let args = $argument.split("&");
  args.forEach(item=>{
    let [k,v] = item.split("=");
    if(k=="AU") AU = decodeURIComponent(v);
    if(k=="UA") UA = decodeURIComponent(v);
    if(k=="BUVID") BUVID = decodeURIComponent(v);
  });
}

// 删除旧 header
for (let h in headers){
  if (h.toLowerCase()=="authorization" || h.toLowerCase()=="user-agent"){
    delete headers[h];
  }
}

// 写入新 header
if(AU){
  headers["authorization"] = AU;
}

if(UA){
  headers["user-agent"] = UA;
}

if(BUVID){
  headers["buvid"] = BUVID;
}

$done({headers});