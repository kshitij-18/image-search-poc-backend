import express from 'express';
import cors from 'cors'
import 'dotenv/config';
import imageSearchRouter from './routes/images';
import ApplicationSingleton from './application-model';

const app = express();

const PORT = 3000;

const init = async () => {
    
    app.use(express.json());
    app.use(cors());
    app.use(express.static('images'))
    
    app.use('', imageSearchRouter)
    await ApplicationSingleton.init();

    app.listen(PORT, () => console.log('LISTENING ON PORT 3000'));
}

init();