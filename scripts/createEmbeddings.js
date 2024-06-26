const { FilesetResolver, ImageEmbedder } = await import("@mediapipe/tasks-vision");
import {
  AutoProcessor,
  RawImage,
  CLIPVisionModelWithProjection,
} from "@xenova/transformers";
import path from "node:path";
import fs from 'node:fs'
import { Image } from 'image-js'

const createEmbeddings = async (imageUrl) => {
  const modelId = "Xenova/clip-vit-base-patch16";
  const processor = await AutoProcessor.from_pretrained(modelId);
  const visionModel = await CLIPVisionModelWithProjection.from_pretrained(
    modelId,
    {
      quantized: false,
    }
  );
  const imageData = await RawImage.read(imageUrl);
  const imageInputs = await processor(imageData);
  const { image_embeds: imageEmbeddings } = await visionModel(imageInputs);
  return imageEmbeddings.tolist()[0];
};

export default createEmbeddings;
