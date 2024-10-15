import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

(async () => {
  const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.js');
  GlobalWorkerOptions.workerSrc = workerSrc.default;
})();

// Função para extrair o nome do texto do PDF usando regex
const extractName = (text) => {
  const namePattern = /por\s+([\w\s,]+?)\s+foi apresentado no festival/i;
  const match = text.match(namePattern);
  return match ? match[1].trim() : 'Nome não encontrado';
};

// Função para clonar o ArrayBuffer com segurança
const cloneArrayBuffer = (buffer) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(buffer); // Abordagem moderna
  }
  return buffer.slice(0); // Fallback para navegadores mais antigos
};

// Função principal para extrair e renomear PDFs
const extractAndRenamePDFs = async (pdfFiles) => {
  const filesArray = Array.from(pdfFiles);

  for (const file of filesArray) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const clonedBuffer = cloneArrayBuffer(arrayBuffer); // Clonando o buffer com segurança

      const uint8Array = new Uint8Array(clonedBuffer);
      const pdfDoc = await getDocument({ data: uint8Array }).promise;
      const firstPage = await pdfDoc.getPage(1);
      const textContent = await firstPage.getTextContent();

      const fullText = textContent.items.map((item) => item.str).join(' ').trim();
      const extractedName = extractName(fullText);
      console.log(`Nome encontrado: ${extractedName}`);

      const pdfLibDoc = await PDFDocument.load(clonedBuffer);
      const newBlob = await pdfLibDoc.save();
      saveAs(new Blob([newBlob]), `${extractedName}.pdf`);
    } catch (error) {
      console.error(`Erro ao processar o arquivo ${file.name}:`, error);
    }
  }
};

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
