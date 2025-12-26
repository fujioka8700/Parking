const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function parseFaultManualDetailed() {
  const filePath = '/data/TP_manual.xls';
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  
  console.log('=== エクセルファイル詳細解析 ===\n');
  
  // 「異常コード」シートを重点的に解析
  const faultCodeSheetName = '異常コード ';
  const worksheet = workbook.Sheets[faultCodeSheetName];
  
  if (!worksheet) {
    console.error('「異常コード」シートが見つかりません');
    return;
  }
  
  // 生のセルデータを取得
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  console.log(`シート範囲: ${worksheet['!ref']}`);
  console.log(`行数: ${range.e.r + 1}, 列数: ${range.e.c + 1}\n`);
  
  // 最初の20行を詳細に表示
  console.log('=== 最初の20行の生データ ===');
  for (let row = 0; row < Math.min(20, range.e.r + 1); row++) {
    console.log(`\n--- 行 ${row + 1} ---`);
    for (let col = 0; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v !== undefined && cell.v !== '') {
        console.log(`  [${cellAddress}] (列${col}): ${cell.v}`);
      }
    }
  }
  
  // JSON形式に変換（ヘッダー行を指定）
  console.log('\n\n=== JSON形式での解析（ヘッダー行を探す） ===');
  
  // ヘッダー行を探す（「コード」「名称」「内容」などのキーワードを含む行）
  let headerRow = -1;
  for (let row = 0; row < Math.min(10, range.e.r + 1); row++) {
    const rowData = [];
    for (let col = 0; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        rowData.push(String(cell.v));
      }
    }
    const rowText = rowData.join(' ');
    if (rowText.includes('コード') && (rowText.includes('名称') || rowText.includes('内容'))) {
      headerRow = row;
      console.log(`ヘッダー行候補: 行 ${row + 1}`);
      console.log(`  内容: ${rowText}`);
      break;
    }
  }
  
  // ヘッダー行が見つかった場合、その行をヘッダーとして使用
  if (headerRow >= 0) {
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      range: headerRow,
      defval: '',
      raw: false
    });
    
    console.log(`\nヘッダー行 ${headerRow + 1} を使用してデータを解析`);
    console.log(`データ行数: ${data.length}`);
    console.log(`列名: ${Object.keys(data[0] || {}).join(', ')}`);
    
    console.log('\n=== 最初の10行のデータ ===');
    data.slice(0, 10).forEach((row, i) => {
      console.log(`\n行 ${i + 1}:`);
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (value !== '' && value !== null && value !== undefined) {
          console.log(`  ${key}: ${value}`);
        }
      });
    });
    
    // 故障コードが含まれる行を抽出
    console.log('\n=== 故障コードデータの抽出 ===');
    const faultCodes = [];
    data.forEach((row, index) => {
      // コード列を探す（Mで始まるコード、または数字のコード）
      const codeKeys = Object.keys(row).filter(k => k.includes('コード') || k.includes('__EMPTY'));
      const nameKeys = Object.keys(row).filter(k => k.includes('名称') || k.includes('__EMPTY'));
      const contentKeys = Object.keys(row).filter(k => k.includes('内容') || k.includes('__EMPTY'));
      
      // 実際のデータを探す
      let code = '';
      let name = '';
      let content = '';
      let checkItems = '';
      
      Object.keys(row).forEach(key => {
        const value = String(row[key] || '').trim();
        // Mで始まるコード（M32, M33など）を探す
        if (/^M\d+/.test(value)) {
          code = value;
        }
        // 数字のみのコード（1, 2, 3など）を探す
        if (/^\d+$/.test(value) && value.length <= 3 && !code) {
          code = value;
        }
      });
      
      // 名称と内容を探す
      const allValues = Object.values(row).map(v => String(v || '').trim()).filter(v => v);
      if (allValues.length > 1 && code) {
        name = allValues.find(v => v && v !== code && !/^\d+$/.test(v)) || '';
        content = allValues.find(v => v && v !== code && v !== name && v.length > 20) || '';
        checkItems = allValues.find(v => v && v !== code && v !== name && v !== content && v.length > 10) || '';
      }
      
      if (code) {
        faultCodes.push({
          rowIndex: index + headerRow + 2,
          code,
          name,
          content,
          checkItems,
          rawRow: row
        });
      }
    });
    
    console.log(`\n故障コード数: ${faultCodes.length}`);
    console.log('\n=== 最初の5つの故障コード ===');
    faultCodes.slice(0, 5).forEach(fc => {
      console.log(`\nコード: ${fc.code}`);
      console.log(`  名称: ${fc.name}`);
      console.log(`  内容: ${fc.content.substring(0, 100)}...`);
      console.log(`  チェック項目: ${fc.checkItems.substring(0, 100)}...`);
    });
    
    // 結果をJSONファイルに保存
    const outputPath = '/data/fault_codes_detailed.json';
    fs.writeFileSync(
      outputPath,
      JSON.stringify({ faultCodes, totalCount: faultCodes.length }, null, 2),
      'utf-8'
    );
    console.log(`\n詳細解析結果を保存しました: ${outputPath}`);
  }
}

if (require.main === module) {
  try {
    parseFaultManualDetailed();
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

module.exports = { parseFaultManualDetailed };

