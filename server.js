import express from 'express'
import mongoose from 'mongoose';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path'
import "dotenv/config"


const app = express();
app.use(express.static(path.join(path.resolve(),'public')))

cloudinary.config({ 
        cloud_name: `${process.env.cloud_name}`, 
        api_key: `${process.env.api_key}`, 
        api_secret: `${process.env.api_secret}` // Click 'View API Keys' above to copy your API secret
    });

mongoose.connect(`${process.env.connectionString}`, {
    dbName: "Image_Uploader"
})
.then(() => { console.log("MongoDB Connected.") })
.catch((error) => { console.log(error) });

app.get('/',(req,res)=>{
    res.render("index.ejs",{url:null});
})


const imageSchema=new mongoose.Schema({
  filename:String,
  public_id:String,
  imageUrl:String
});

const File=mongoose.model("cloudinary",imageSchema)

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })


app.post('/upload', upload.single('file'), async (req, res)=> {
  if(req.file){
    const file=req.file.path;
    const cloudinaryRes=await cloudinary.uploader.upload(file,{
      folder:"Image_Uploader"
    })
    const db=await File.create({
      filename:file.originalname,
      public_id:cloudinaryRes.public_id,
      imageUrl:cloudinaryRes.secure_url
    })
    res.render("index.ejs",{url:cloudinaryRes.secure_url});
  }
  else{
    res.render("index.ejs",{url:0});
  }
  
})


const port = 3000;
app.listen(port, (req, res) => { console.log(`Server is running on port ${port}`) }); 