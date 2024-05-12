
import {storage} from  "../api/AppwriteConfig"
import React,{useState} from "react";
import { v4 as uuidv4 } from "uuid"
import QRCodeSVG from 'qrcode.react'
import Myself from "./Myself";

const FileShare = ()=>{

    const [qrValue, setQRValue] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [ loader, setLoader ] = useState(false);

    const handleUpload = async (e)=>{
        e.preventDefault()
        const files = e.target.files;
        const uploadPromises = [];
        setLoader(true)
        for(let i = 0 ; i<files.length;++i){
            const file = files[i];
            const uploadPromise = storage.createFile(import.meta.env.VITE_STORAGE_BUCKET_ID,
                uuidv4(),
                file
            )
            uploadPromises.push(uploadPromise);
        }
        try {
           const res = await Promise.all(uploadPromises);
           console.log(res)
           setUploadedFiles(res);
           generateQRCode(res)
           scheduleDeletion(res);
        } catch (error) {
            console.log(error)
        }finally{
            setLoader(false)
        }
    }
    const generateQRCode=(uploadedFiles)=>{
        const route = '/download';
        const fileIds = uploadedFiles.map((file)=>file.$id).join(",");
        const url = `${window.location.origin}${route}?files=${fileIds}`;
        console.log(url)
        setQRValue(url);
    }
    const scheduleDeletion = ()=>{
        setTimeout(()=>{
            uploadedFiles.forEach((file)=>{
                deleteFilesFromBucket(file.$id)
            })
        },300000)
    }
    const deleteFilesFromBucket = (fileid)=>{
        storage.deleteFile(import.meta.env.VITE_STORAGE_BUCKET_ID, fileid)
                .then((res)=>{
                    console.log(res)
                }).catch((err)=>{
                    console.log(err)
                })
    }
    return(
        <>
        <Myself />
        <div className="   flex flex-col items-center justify-center h-screen  gradient-bg">
        <h1 className="text-3xl font-bold mb-8 shadow-2xl shadow-black border p-4 border-black rounded-full ">Appwrite <span className="font-semibold bg-amber-100 rounded-lg">File-Sharing</span></h1>
        <form className="flex flex-col items-center space-y-4 text-xl">
        <input type="file" multiple name="" id="upload-files" onChange={handleUpload} />
        </form>
        <div className="m-8 flex flex-col justify-center items-center">
            {uploadedFiles.length==0 && !loader && 

            <>
            <p className=" underline text-2xl font-bold bg-slate-200 border-4 rounded-sm m-4" >Steps:-</p>
            <ul className="text-xl font-medium list-text ">
                <li>1• Choose File/Files within 5-MB  to upload.</li>
                <li>2• Once uploaded, a QR code is genrated.</li>
                <li>3• Scan from other devices to download uploaded files</li>
            </ul>
            </>
            }
            { loader && 
            <div className="flex justify-center items-center mt-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-gray-900"></div>
          </div>
          
            }
            {qrValue && (
            <>
            <QRCodeSVG value={qrValue}/>
            <div className="text-center m-10">
                <p className="text-2xl font-serif"><span className="font-bold bg-white underline mx-2 px-2">NOTE:-</span> The Uploaded files will be automatically deleted after 5 minutes.</p>
            </div>
            </>
        )}
        </div>
        </div>
        </>
    );
}
export default FileShare;