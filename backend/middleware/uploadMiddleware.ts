import multer from "multer"

const storage = multer.memoryStorage();

const fileFilter = (req:any,file:Express.Multer.File,cb:any)=>{
    if(file.mimetype==="application/pdf"){
        cb(null,true);
    }else{
        cb(new Error("only PDF files are allowed"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits : {fileSize:5*1024*1024}
});