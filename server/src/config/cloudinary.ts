import { v2 as cloudinaryV2 } from 'cloudinary';


const connectCloudinary = async ()=>{
    try{
        await cloudinaryV2.config({
            cloud_name:process.env.CLOUD_NAME,
            api_key:process.env.API_KEY,
            api_secret: process.env.API_SECRET,
        });
        console.log("Cloudinary Connected!")
    }
    catch(error){
        if(error instanceof Error){
            console.log(`Error:${error.message}`);
        }
        else{
            console.error(`Unexpected error: ${error}`);
        }
        process.exit(1);
    }
}

export {connectCloudinary, cloudinaryV2 }