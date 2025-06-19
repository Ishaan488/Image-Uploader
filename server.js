import express from 'express'
import mongoose from 'mongoose';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path'


const app = express();
app.use(express.static(path.join(path.resolve(),'public')))

cloudinary.config({ 
        cloud_name: 'dherpwuc8', 
        api_key: '952377239925465', 
        api_secret: 'SCWG27JKcLlnFK1hEtrgR0vyGnM' // Click 'View API Keys' above to copy your API secret
    });

mongoose.connect("mongodb+srv://ishaanbajpai732004:beaBAjB1aumvNut4@cluster0.dzi2tdz.mongodb.net/", {
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
  


//     if(file){
// res.render("index.ejs",{url:cloudinaryRes.secure_url});
//     }
//     else{
//       res.render("index.js");
//     }

    // try{
    // } catch(error){
    //   res.render("index.js");
    // }



    // res.json({message:"file uploaded",
    //     filePath:file,
    //     cloudinaryRes
    // })
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})


const port = 3000;
app.listen(port, (req, res) => { console.log(`Server is running on port ${port}`) }); 