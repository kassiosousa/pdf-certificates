import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const FileDownloaderRemote = () => {
  const [fileData, setFileData] = useState([]);

  // Função para carregar a planilha de uma URL
  const loadExcelFromUrl = async (url) => {
    try {
      console.log("Carregando planilha...");
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao baixar a planilha.");

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      console.log("Dados da planilha:", jsonData); // Verificar os dados no console

      const parsedData = jsonData.slice(1).map((row) => ({
        fileName: row[0] || "Sem Nome",
        fileUrl: row[1] || "",
      }));

      setFileData(parsedData.filter(item => item.fileUrl)); // Filtrar links vazios
    } catch (error) {
      console.error("Erro ao carregar a planilha:", error);
    }
  };

  // Carrega a planilha automaticamente ao iniciar o componente
  useEffect(() => {
    const url =
      "./public/documents/XlsReader.xlsx";
    loadExcelFromUrl(url);
  }, []);

  const downloadFile = async (fileName, fileUrl) => {
    // Certifique-se de que a URL está correta
    const url = fileUrl; // Sem proxy

    console.log(`Iniciando download de: ${fileName} - ${url}`);

    try {
        const response = await fetch(url);

        // Verifica se a resposta é válida
        if (!response.ok) {
            throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();

        // Verifica se o blob está vazio
        if (blob.size === 0) {
            console.error("Arquivo vazio ou não encontrado.");
            return;
        }

        // Garante que o nome do arquivo tenha a extensão .pdf
        const validFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
        saveAs(blob, validFileName);
        console.log(`Download concluído: ${validFileName}`);
    } catch (error) {
        console.error(`Erro ao baixar ${fileName}:`, error);
    }
  };

  const downloadAllFiles = () => {
    console.log("Baixando todos os arquivos...");
    fileData.forEach(({ fileName, fileUrl }) => downloadFile(fileName, fileUrl));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Baixar Arquivos do Google Drive</h1>
      <button onClick={downloadAllFiles} disabled={fileData.length === 0}>
        Baixar Todos
      </button>
      <ul>
        {fileData.map(({ fileName, fileUrl }, index) => (
          <li key={index}>
            <strong>{fileName}</strong> -{" "}
            <button onClick={() => downloadFile(fileName, fileUrl)}>
              Baixar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileDownloaderRemote;
