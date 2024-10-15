import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // Versão compatível
import { saveAs } from 'file-saver';

// Definindo o caminho do worker diretamente
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

async function extractAndRenamePDFs(pdfFiles) {
  try {
    for (const pdfFile of pdfFiles) {
      const arrayBuffer = await pdfFile.arrayBuffer(); // Certifica-se de obter um ArrayBuffer válido
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const page = await pdfDoc.getPage(1);
      const textContent = await page.getTextContent();
      const fullText = textContent.items.map(item => item.str).join(' ');

      // Use regex para extrair o nome do certificado
      const regex = /por (.*?) foi apresentado no festival/i;
      const match = fullText.match(regex);
      const name = match ? match[1] : "Nome não encontrado";

      console.log(`Nome encontrado: ${name}`);

      // Cria um novo Blob com o nome do certificado
      const newBlob = new Blob([arrayBuffer], { type: "application/pdf" });
      saveAs(newBlob, `${name}.pdf`);
    }
  } catch (error) {
    console.error(`Erro ao processar o arquivo ${pdfFiles.name}:`, error);
  }
}

// Componente PdfReader
const PdfReader = () => {
  const handleFileInput = async (event) => {
    const files = event.target.files;
    await extractAndRenamePDFs(files);
  };

  return (
    <div>
      <h1>Renomear Certificados PDF</h1>
      <input type="file" multiple accept="application/pdf" onChange={handleFileInput} />
    </div>
  );
};

export default PdfReader;
