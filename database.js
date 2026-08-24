const DB_NAME="POSUniversalDB"; const DB_VERSION=2; let db=null;

function openDatabase(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,DB_VERSION);
request.onupgradeneeded=e=>{const database=e.target.result;
if(!database.objectStoreNames.contains("business")) database.createObjectStore("business",{keyPath:"id"});
if(!database.objectStoreNames.contains("products")){const s=database.createObjectStore("products",{keyPath:"id",autoIncrement:true});s.createIndex("name","name",{unique:false});s.createIndex("sku","sku",{unique:false});s.createIndex("category","category",{unique:false});}
if(!database.objectStoreNames.contains("customers")) database.createObjectStore("customers",{keyPath:"id",autoIncrement:true});
if(!database.objectStoreNames.contains("sales")) database.createObjectStore("sales",{keyPath:"id",autoIncrement:true});
if(!database.objectStoreNames.contains("cash")) database.createObjectStore("cash",{keyPath:"id",autoIncrement:true});
if(!database.objectStoreNames.contains("categories")) database.createObjectStore("categories",{keyPath:"id",autoIncrement:true});
if(!database.objectStoreNames.contains("settings")) database.createObjectStore("settings",{keyPath:"id"});
if(!database.objectStoreNames.contains("inventoryMovements")){const s=database.createObjectStore("inventoryMovements",{keyPath:"id",autoIncrement:true});s.createIndex("productId","productId",{unique:false});}
};
request.onsuccess=e=>{db=e.target.result;resolve(db)}; request.onerror=e=>reject(e.target.error);});}

function dbPut(storeName,data){return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,"readwrite");const req=tx.objectStore(storeName).put(data);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function dbGet(storeName,id){return new Promise((resolve,reject)=>{const req=db.transaction(storeName,"readonly").objectStore(storeName).get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function dbGetAll(storeName){return new Promise((resolve,reject)=>{const req=db.transaction(storeName,"readonly").objectStore(storeName).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function dbDelete(storeName,id){return new Promise((resolve,reject)=>{const req=db.transaction(storeName,"readwrite").objectStore(storeName).delete(id);req.onsuccess=()=>resolve(true);req.onerror=()=>reject(req.error);});}
function dbCount(storeName){return new Promise((resolve,reject)=>{const req=db.transaction(storeName,"readonly").objectStore(storeName).count();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
