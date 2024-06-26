import { AutoTokenizer, CLIPTextModelWithProjection, PreTrainedModel, PreTrainedTokenizer } from '@xenova/transformers';
import { MongoClient } from 'mongodb'
import 'dotenv/config';

class ApplicationSingleton {
    static modelId = 'Xenova/clip-vit-base-patch16';
    static tokenizer: null | PreTrainedTokenizer = null;
    static textModel: null | PreTrainedModel = null;
    static database: null | MongoClient = null;
    static dbConnectionString: string = process.env.MONGODB_URL || '';

    static async getInstance() {
        // Load tokenizer and text model
        if (this.tokenizer === null) {
            this.tokenizer = await AutoTokenizer.from_pretrained(this.modelId);
        }

        if (this.textModel === null) {
            this.textModel = await CLIPTextModelWithProjection.from_pretrained(this.modelId, {
                quantized: false,
            });
        }

        if (this.database === null) {
            this.database = await MongoClient.connect(
                this.dbConnectionString,
            );
            console.log('COnnected to DB')
        }

        return Promise.all([
            this.tokenizer,
            this.textModel,
            this.database,
        ]);
    }

    static async init() {
        return this.getInstance();
    }
}

export default ApplicationSingleton;