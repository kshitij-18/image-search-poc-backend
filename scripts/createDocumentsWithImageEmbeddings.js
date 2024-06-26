import fs from 'fs/promises';
import { MongoClient } from 'mongodb'
import createEmbeddings from './createEmbeddings.js';
import { config } from 'dotenv';

config();


const copyTestImageData = async () => {
    const basePath ="Test_Images\\imagenet-mini\\val"
    const directories = await fs.readdir(basePath);
    await fs.mkdir('images');
    for (const dir of directories) {
        const filesInDir = await fs.readdir(`${basePath}\\${dir}`);
        await Promise.all(filesInDir.map(file => fs.copyFile(`${basePath}\\${dir}\\${file}`, `images\\${file}`)));
    }
}

const createDataInDb = async () => {
    const images = await fs.readdir('images');
    const dataToInsert = [];
    console.log('MONGO URL', process.env.MONGODB_URL)

    for (const image of images) {
        const imageUrl = `images\\${image}`;
        const imageEmbeddings = await createEmbeddings(imageUrl);
        console.log('created embedding for '+imageUrl);
        const data = {
            imageUrl,
            imageEmbeddings
        }
        dataToInsert.push(data);
    }

    const mongoClient = new MongoClient(process.env.MONGODB_URL);
    console.log('CONNECTED TO DB');
    const db = await mongoClient.db('image-search');
    const collection = await db.createCollection('images');

    await collection.insertMany(dataToInsert);
    console.log('DATA STORAGE SUCCESSFUL');
}

createDataInDb();