import { InferenceSession, Tensor } from "onnxruntime-web";

export async function runONNXModel(inputFeatures, embeddings, metadata, topK = 9) {
    try {
        // Load the ONNX model
        const session = await InferenceSession.create("/song_recommender_model.onnx");

        // Ensure input is a Float32Array and reshape to [1, input_dim]
        const inputTensor = new Tensor("float32", new Float32Array(inputFeatures), [1, inputFeatures.length]);

        // Run inference to get the embedding for the input song
        const output = await session.run({ input: inputTensor });
        const baseEmbeddingTensor = output.output; // Replace 'output' with your actual model's output key
        const baseEmbedding = Array.from(baseEmbeddingTensor.data); // Convert Tensor to a normal array

        // Compute cosine similarities with all preloaded embeddings
        const similarities = embeddings.map((embedding, index) => {
            const dotProduct = embedding.reduce((sum, val, i) => sum + val * baseEmbedding[i], 0);
            const normA = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
            const normB = Math.sqrt(baseEmbedding.reduce((sum, val) => sum + val * val, 0));
            const similarity = dotProduct / (normA * normB);
            return { index, similarity };
        });

        // Sort by similarity in descending order
        similarities.sort((a, b) => b.similarity - a.similarity);

        // Retrieve the top K matches
        const topMatches = similarities.slice(0, topK).map(item => ({
            ...metadata[item.index],
            similarity: item.similarity
        }));

        return topMatches;

    } catch (error) {
        console.error("Error running ONNX model:", error);
        throw error;
    }
}
