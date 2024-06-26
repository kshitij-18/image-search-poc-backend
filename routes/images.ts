import { Router, Request, Response } from 'express';
import ApplicationSingleton from '../application-model';
const router = Router();

// endpoint for fetching images based on search result
router.get('/', async (req: Request, res: Response) => {
    const { search, limit = 10, skip = 0 } = req.query;
    const [tokenizer, model, database] = await ApplicationSingleton.getInstance();
    const aggregationPipeline = [];
    const collection = database.db('image-search').collection('images');
    if (search) {
        // creating query embeddings
        const textInputs = tokenizer(search, { padding: true, truncation: true, });
        const { text_embeds } = await model(textInputs);
        const queryEmbeddings = text_embeds.tolist()[0];
        aggregationPipeline.push(...[{
            "$vectorSearch": {
              "index": "image_vector_index",
              "path": "imageEmbeddings",
              "queryVector":queryEmbeddings,
              "numCandidates": 100,
              "limit": limit
            }
          }, 
          {
            $project: {
                _id: 0,
                imageUrl: 1,
                score: { $meta: "vectorSearchScore" }
            }
          }])
    }
    aggregationPipeline.push(...[{$project: { imageEmbeddings: 0 }}]);
    const results = await collection.aggregate([
        ...aggregationPipeline,
        {$skip: skip}, 
        {$limit: limit},
    ]).toArray()
    const [{ total }] = await collection.aggregate([
        ...aggregationPipeline,
        {
            $group: {
                _id: null,
                total: {
                    $sum: 1
                }
            }
        }
    ]).toArray();
    res.json({
        total,
        limit,
        skip,
        data: results
    })
});

export default router;