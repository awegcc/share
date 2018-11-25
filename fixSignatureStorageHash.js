const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://user:password@localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.collection("pblocks").findOne({"signatures.0.storageHash":{$exists:false}}, (err, pb) => {
    if (err) throw err;
      //console.log(pb);
      let id = pb._id;
      console.log('_id: ', id);
      if(pb.contracts.length < 1) {
	      console.log('no contracts find');
        db.close();
	      return;
      }
      let storageHash = pb.contracts[0].storageHash;
      console.log('storageHash: ', storageHash);
      let signatures = pb.signatures;
      if(signatures.length < 1) {
	      console.log('no signatures find');
        db.close();
	      return;
      }
      signatures[0].storageHash = storageHash;
      console.log('signatures: ', signatures);
      dbo.collection("pblocks").update({_id:id}, {$set:{signatures:signatures}}, (err, ret) => {
        console.log('done');
        db.close();
	      return;
      });
  });
});
