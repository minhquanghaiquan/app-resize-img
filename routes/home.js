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
   
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if(!file.mimetype.match(/jpe|jpeg|png|gif$i/)) {
            req.body.err = 'File is not support. (Only support file: jpe, jpeg, png and gif)'
            cb(null, false)
        }
        cb(null, true)
    }
}).single('imageUpload');

function resize(data,size) {
    return new Promise ((resolve, reject) =>{
		sharp(data.path)
        .resize(size, size)
        .toFile('public/uploads/thumb/thumb_'+size+'x'+size+'_'+data.originalname, function (err, info) {
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

router.post('/', upload ,  function(req, res) {
    var err;
    if(!req.file) {
        err = 'File is empty. Please check input';
    }else {
        if ( req.body.err) {
            err= req.body.err;
        } else {
            if(req.file.size > 1080*1080) {
                err = 'file is too large, image size need too < 1080x1080';
            }
        }
    }
   
    if (err) {
        return res.render('index', {
            err: err
        });
    }
  
    Promise.all([
        resize(req.file , 512),
        resize(req.file , 256),
        resize(req.file , 128)
    ]).then(() => {

        var uploadDir = fs.readdirSync("public/uploads/thumb/"); 
        console.log(uploadDir);

        const newUploadDir=uploadDir.filter((item)=>{
            return (item.includes(req.file.originalname)===true);
        } )
        console.log(newUploadDir);

        const zip = new AdmZip();

        for(var i = 0; i < newUploadDir.length;i++){
            zip.addLocalFile("public/uploads/thumb/"+newUploadDir[i]);
        }
        //save file zip in local
        const downloadName = `${Date.now()}.zip`;
        zip.writeZip('public/'+downloadName);
        //send file zip
        // const data = zip.toBuffer();
        // res.set('Content-Type','application/octet-stream');
        // res.set('Content-Disposition',`attachment; filename=${downloadName}`);
        // res.set('Content-Length',data.length);
        // res.send(data);
        res.redirect('/public/'+downloadName);
    }).catch( (err) => {
        console.log(err);
    })
})

module.exports = router;