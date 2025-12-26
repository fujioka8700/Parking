import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface ExcelRow {
  [key: string]: any;
}

interface ParsedData {
  sheetNames: string[];
  totalSheets: number;
  firstSheetData: {
    sheetName: string;
    totalRows: number;
    columns: string[];
    sampleRows: ExcelRow[];
    allRows: ExcelRow[];
  };
  allSheetsData: {
    [sheetName: string]: {
      totalRows: number;
      columns: string[];
      sampleRows: ExcelRow[];
    };
  };
}

export function parseFaultManual(): ParsedData {
  // エクセルファイルのパス（プロジェクトルートからの相対パス）
  const filePath = path.join(process.cwd(), '..', 'data', 'TP_manual.xls');
  
  console.log('エクセルファイルのパス:', filePath);
  console.log('ファイルの存在確認:', fs.existsSync(filePath));
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`エクセルファイルが見つかりません: ${filePath}`);
  }
  
  // ファイルを読み込む
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  
  // シート名の一覧
  const sheetNames = workbook.SheetNames;
  console.log('\n=== シート情報 ===');
  console.log('シート数:', sheetNames.length);
  console.log('シート名一覧:', sheetNames);
  
  const result: ParsedData = {
    sheetNames,
    totalSheets: sheetNames.length,
    firstSheetData: {
      sheetName: '',
      totalRows: 0,
      columns: [],
      sampleRows: [],
      allRows: [],
    },
    allSheetsData: {},
  };
  
  // 各シートを解析
  sheetNames.forEach((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName];
    
    // JSON形式に変換
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    if (data.length === 0) {
      console.log(`\nシート "${sheetName}" は空です`);
      return;
    }
    
    // 列名を取得
    const columns = Object.keys(data[0]);
    
    console.log(`\n=== シート "${sheetName}" の情報 ===`);
    console.log('行数:', data.length);
    console.log('列数:', columns.length);
    console.log('列名:', columns);
    
    // 最初の5行を表示
    console.log('\n--- 最初の5行のデータ ---');
    data.slice(0, 5).forEach((row, i) => {
      console.log(`\n行 ${i + 1}:`);
      columns.forEach(col => {
        const value = row[col];
        if (value !== '' && value !== null && value !== undefined) {
          console.log(`  ${col}: ${value}`);
        }
      });
    });
    
    // データ構造を保存
    const sheetData = {
      totalRows: data.length,
      columns,
      sampleRows: data.slice(0, 10), // 最初の10行をサンプルとして保存
    };
    
    result.allSheetsData[sheetName] = sheetData;
    
    // 最初のシートの詳細情報を保存
    if (index === 0) {
      result.firstSheetData = {
        sheetName,
        totalRows: data.length,
        columns,
        sampleRows: data.slice(0, 10),
        allRows: data,
      };
    }
  });
  
  return result;
}

// スクリプトとして直接実行された場合
if (require.main === module) {
  try {
    const result = parseFaultManual();
    
    console.log('\n=== 解析結果サマリー ===');
    console.log(`総シート数: ${result.totalSheets}`);
    console.log(`最初のシート名: ${result.firstSheetData.sheetName}`);
    console.log(`最初のシートの行数: ${result.firstSheetData.totalRows}`);
    console.log(`最初のシートの列数: ${result.firstSheetData.columns.length}`);
    console.log(`最初のシートの列名: ${result.firstSheetData.columns.join(', ')}`);
    
    // JSONファイルに結果を保存
    const outputPath = path.join(process.cwd(), '..', 'data', 'excel_analysis_result.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    console.log(`\n解析結果を保存しました: ${outputPath}`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

