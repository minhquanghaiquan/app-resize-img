const express = require('express');
const router = express.Router();
var multer  = require('multer');
const sharp = require('sharp');
const AdmZip = require('adm-zip');
var fs = require('fs'); 
var path = require('path')




var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads') 
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
   
var upload = multer({ storage: storage }).single('imageUpload');

// '/'+req.file.path.split(path.sep).slice(1).join('/')
function resize(data,size) {
    const dir = __dirname.split(path.sep);
    // console.log(array)
    const index = dir.length ; 
    const newDir = dir.slice(0,index-1).join('/') ; 
    // console.log(newArray.join('/'));
    return new Promise ((resolve, reject) =>{
		sharp(newDir+'/'+data.path)
        .resize(size, size)
        .toFile(newDir+'/'+'public/uploads/thumb/thumb_'+size+'x'+size+'_'+data.originalname, function (err, info) {
            if(!err) {
                console.log('sharp worked');
                resolve();
            }else {
                console.log(err)
                reject();
            }
        })
	})
}

router.get('/', function(req, res) {
    res.render('index')
})

router.post('/',upload ,  function(req, res) {
    console.log(req.file);
    
    Promise.all([
        resize(req.file , 512),
        resize(req.file , 256),
        resize(req.file , 128)
    ]).then(() => {

        const dir = __dirname.split(path.sep);
    // console.log(array)
        const index = dir.length ; 
        const newDir = dir.slice(0,index-1).join('/') ; 
        var uploadDir = fs.readdirSync(newDir+"/public/uploads/thumb/"); 
        console.log(uploadDir);

        const newUploadDir=uploadDir.filter((item)=>{
            return (item.includes(req.file.originalname)===true);
        } )
        console.log(newUploadDir);

        const zip = new AdmZip();

        for(var i = 0; i < newUploadDir.length;i++){
            zip.addLocalFile(newDir+"/public/uploads/thumb/"+newUploadDir[i]);
        }
        //save file zip in local
        const downloadName = `${Date.now()}.zip`;
        zip.writeZip(newDir+'/public/'+downloadName);
        //send file zip
        // const data = zip.toBuffer();
        // res.set('Content-Type','application/octet-stream');
        // res.set('Content-Disposition',`attachment; filename=${downloadName}`);
        // res.set('Content-Length',data.length);
        // res.send(data);
        res.redirect('public/'+downloadName);
    }).catch( (err) => {
        console.log(err);
    })
})


module.exports = router;