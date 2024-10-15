import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const FileDownloader = () => {
  const [fileData, setFileData] = useState([]);

  // Função para ler a planilha Excel após o upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Verificar os dados lidos
        console.log("Dados da planilha:", jsonData);

        // Transformar dados em objetos com nome e URL
        const parsedData = jsonData.slice(1).map((row) => ({
            fileName: row[0],
            fileUrl: row[1], // Aqui ainda vamos usar a segunda coluna, que contém o nome do arquivo local
        }));
        setFileData(parsedData);
    };

    reader.readAsArrayBuffer(file);
};


  // Função para baixar um arquivo individual
  const downloadFile = async (fileName, fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch (error) {
      console.error(`Erro ao baixar ${fileName}:`, error);
    }
  };

  // Função para baixar todos os arquivos listados
  const downloadAllFiles = () => {
    fileData.forEach(({ fileName, fileUrl }) => downloadFile(fileName, fileUrl));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Baixar Arquivos do Google Drive</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button onClick={downloadAllFiles} disabled={fileData.length === 0}>
        Baixar Todos
      </button>
      <ul>
        {fileData.map(({ fileName, fileUrl }, index) => (
          <li key={index}>
            {fileName} -{" "}
            <button onClick={() => downloadFile(fileName, fileUrl)}>
              Baixar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileDownloader;
