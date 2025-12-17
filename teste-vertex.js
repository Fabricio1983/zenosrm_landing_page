const { VertexAI } = require('@google-cloud/vertexai');

async function testarConexao() {
  console.log("🔍 Iniciando teste de conexão com Vertex AI...");

  // O SDK busca automaticamente o arquivo no caminho da variável GOOGLE_APPLICATION_CREDENTIALS
  const project = process.env.GCP_PROJECT_ID; 
  const location = 'us-central1'; // Ou a região que você configurou

  try {
    const vertexAI = new VertexAI({project: project, location: location});
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro', // Testando com o modelo Pro que você ativou
    });

    const request = {
      contents: [{role: 'user', parts: [{text: 'Responda apenas: Conexão Vertex AI ativa!'}]}],
    };

    const result = await generativeModel.generateContent(request);
    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    console.log("✅ SUCESSO!");
    console.log("🤖 Resposta do Gemini Pro:", text);
    console.log("---");
    console.log("Sua integração está pronta para o lançamento do SRM.");

  } catch (error) {
    console.error("❌ ERRO NA CONEXÃO:");
    console.error(error.message);
    console.log("\nVerifique se:");
    console.log("1. O arquivo JSON no Replit está correto.");
    console.log("2. O Secret GOOGLE_APPLICATION_CREDENTIALS aponta para o caminho certo.");
    console.log("3. A API Vertex AI está ativada no Google Cloud Console.");
  }
}

testarConexao();