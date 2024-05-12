import { Client, Storage } from 'appwrite'




const client = new Client();
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_PROJECT_ID);



export const storage = new Storage(client);
