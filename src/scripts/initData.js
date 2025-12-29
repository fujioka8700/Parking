const XLSX = require('xlsx');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// エクセルファイルから故障マスタデータを解析
function parseFaultMasterFromExcel(workbook) {
  console.log('=== 故障マスタデータの解析 ===\n');

  const faultCodeSheetName = '異常コード ';
  const worksheet = workbook.Sheets[faultCodeSheetName];

  if (!worksheet) {
    console.error('「異常コード」シートが見つかりません');
    return [];
  }

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const faults = [];
  const processedDisplayCodes = new Set();

  for (let row = 0; row <= range.e.r; row++) {
    try {
      const col0 = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      const col1 = worksheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
      const col2 = worksheet[XLSX.utils.encode_cell({ r: row, c: 2 })];

      const val0 = col0 && col0.v ? String(col0.v).trim() : '';
      const val1 = col1 && col1.v ? String(col1.v).trim() : '';
      const val2 = col2 && col2.v ? String(col2.v).trim() : '';

      // ヘッダー行をスキップ
      if (
        val0.includes('コード') &&
        (val0.includes('名称') || val0.includes('内容'))
      ) {
        continue;
      }

      let faultCode = '';
      let displayCode = null;
      let faultName = '';
      let faultContent = null;

      // パターン1: Mコードがある行（列0にMコード）
      if (val0.match(/^M\d+$/)) {
        faultCode = val1 && val1.match(/^\d+$/) ? val1 : null;
        displayCode = val0; // MコードをdisplayCodeとして保存
        faultName = val2 || '';
      }
      // パターン2: 表示コードのみの行
      else if (!val0.match(/^M\d+$/) && val1 && val1.match(/^\d+$/) && val2) {
        faultCode = val1;
        displayCode = null;
        faultName = val2 || '';
      } else {
        continue;
      }

      if (!faultCode) {
        continue;
      }

      // 重複チェック
      if (processedDisplayCodes.has(faultCode)) {
        continue;
      }

      // 内容とチェック項目を取得
      const col3 = worksheet[XLSX.utils.encode_cell({ r: row, c: 3 })];
      faultContent = col3 && col3.v ? String(col3.v).trim() : null;

      let solution = '';
      for (let col = 4; col <= range.e.c; col++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell && cell.v) {
          const value = String(cell.v).trim();
          if (value) {
            solution += (solution ? ' ' : '') + value;
          }
        }
      }
      solution = solution || null;

      const isActive = faultName !== '欠番' && faultName !== '';

      if (!faultName && faultName !== '欠番') {
        continue;
      }

      faults.push({
        faultCode,
        displayCode,
        faultName,
        faultContent,
        solution,
        isActive,
      });

      processedDisplayCodes.add(faultCode);
    } catch (error) {
      console.error(`エラー: 行${row + 1} - ${error.message}`);
    }
  }

  // 欠番の表示コードを特定し、データが存在しない場合は追加
  const allDisplayCodes = new Set(faults.map((f) => f.faultCode));
  for (let i = 1; i <= 120; i++) {
    const code = String(i);
    if (!allDisplayCodes.has(code)) {
      faults.push({
        faultCode: code,
        displayCode: null,
        faultName: '欠番',
        faultContent: null,
        solution: null,
        isActive: false,
      });
    }
  }

  console.log(`解析結果: ${faults.length}件`);
  return faults;
}

// エクセルファイルからセンサ状態データを解析
function parseSensorStatusFromExcel(workbook) {
  console.log('\n=== センサ状態マスタデータの解析 ===\n');

  const sensorSheetName = 'センサ状態対応表';
  const worksheet = workbook.Sheets[sensorSheetName];

  if (!worksheet) {
    console.error('「センサ状態対応表」シートが見つかりません');
    return [];
  }

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const sensors = [];
  const processedCodes = new Set();

  for (let row = 0; row < range.e.r; row++) {
    const codeRow = [];
    const nameRow = [];

    for (let col = 0; col <= range.e.c; col++) {
      const cellAddr1 = XLSX.utils.encode_cell({ r: row, c: col });
      const cellAddr2 = XLSX.utils.encode_cell({ r: row + 1, c: col });
      const cell1 = worksheet[cellAddr1];
      const cell2 = worksheet[cellAddr2];

      if (cell1 && cell1.v) {
        const value = String(cell1.v).trim();
        if (/^X\d{2}[0-9A-F]$/i.test(value)) {
          codeRow.push({ col, code: value.toUpperCase() });
        }
      }

      if (cell2 && cell2.v) {
        const value = String(cell2.v).trim();
        const excludePatterns = [
          /^X\d{2}[0-9A-F]$/i,
          /^画面表示$/,
          /^入力状態の表示$/,
          /^センサ状態\d+$/,
          /^タワーパーク/,
          /^MT型/,
        ];
        const shouldExclude = excludePatterns.some((pattern) =>
          pattern.test(value),
        );

        if (value && !shouldExclude && value.length > 0) {
          nameRow.push({ col, name: value });
        }
      }
    }

    if (codeRow.length > 0 && nameRow.length > 0) {
      for (const codeItem of codeRow) {
        if (processedCodes.has(codeItem.code)) {
          continue;
        }

        const nameItem = nameRow.find((n) => n.col === codeItem.col);
        if (nameItem) {
          sensors.push({
            sensorCode: codeItem.code,
            sensorName: nameItem.name,
            description: null,
          });
          processedCodes.add(codeItem.code);
        } else {
          sensors.push({
            sensorCode: codeItem.code,
            sensorName: codeItem.code,
            description: null,
          });
          processedCodes.add(codeItem.code);
        }
      }
    } else if (codeRow.length > 0) {
      for (const codeItem of codeRow) {
        if (processedCodes.has(codeItem.code)) {
          continue;
        }
        sensors.push({
          sensorCode: codeItem.code,
          sensorName: codeItem.code,
          description: null,
        });
        processedCodes.add(codeItem.code);
      }
    }
  }

  console.log(`解析結果: ${sensors.length}件`);
  return sensors;
}

// エクセルファイルを解析してJSONファイルを生成（故障マスタのみ）
async function parseExcelToJson() {
  console.log('=== エクセルファイルを解析してJSONファイルを生成 ===\n');

  const filePath = '/data/TP_manual.xls';
  if (!fs.existsSync(filePath)) {
    throw new Error(`エクセルファイルが見つかりません: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  // 故障マスタのみを解析（センサ状態はparsed_data_mt_sensor.jsonから読み込む）
  const faults = parseFaultMasterFromExcel(workbook);

  // JSONファイルに保存（故障マスタのみ）
  const outputPath = '/data/parsed_data.json';
  const data = {
    faults,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');

  console.log(`\nJSONファイルを生成しました: ${outputPath}`);
  console.log(`  故障マスタ: ${faults.length}件`);

  return data;
}

// parsed_data_mt_sensor.jsonからセンサ状態データを読み込む
function loadMtSensorData() {
  console.log('=== MTセンサデータの読み込み ===\n');

  const mtSensorPath = '/data/parsed_data_mt_sensor.json';
  if (!fs.existsSync(mtSensorPath)) {
    throw new Error(
      `MTセンサデータファイルが見つかりません: ${mtSensorPath}\n` +
        '先にconvertMtSensor.jsを実行してparsed_data_mt_sensor.jsonを生成してください。',
    );
  }

  const data = JSON.parse(fs.readFileSync(mtSensorPath, 'utf8'));

  console.log(`MTセンサデータファイルを読み込みました: ${mtSensorPath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  センサ状態: ${data.sensors?.length || 0}件`);

  return data.sensors || [];
}

// パスを指定してMTセンサデータを読み込む（Vercel環境用）
function loadMtSensorDataFromPath(mtSensorPath) {
  console.log('=== MTセンサデータの読み込み ===\n');

  if (!fs.existsSync(mtSensorPath)) {
    throw new Error(
      `MTセンサデータファイルが見つかりません: ${mtSensorPath}\n` +
        '先にconvertMtSensor.jsを実行してparsed_data_mt_sensor.jsonを生成してください。',
    );
  }

  const data = JSON.parse(fs.readFileSync(mtSensorPath, 'utf8'));

  console.log(`MTセンサデータファイルを読み込みました: ${mtSensorPath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  センサ状態: ${data.sensors?.length || 0}件`);

  return data.sensors || [];
}

// データベースに既存データがあるかチェック
async function hasExistingData() {
  try {
    const faultCount = await prisma.faultMaster.count();
    const sensorCount = await prisma.sensorStatus.count();
    return faultCount > 0 || sensorCount > 0;
  } catch (error) {
    console.error('データチェックエラー:', error);
    // エラーが発生した場合は、安全のためfalseを返す（データ投入を試みる）
    return false;
  }
}

// JSONファイルからデータベースに保存
async function saveFaultMasterToDB(faults) {
  console.log('=== 故障マスタデータのデータベース保存 ===\n');

  let successCount = 0;
  let errorCount = 0;

  for (const fault of faults) {
    try {
      await prisma.faultMaster.upsert({
        where: { faultCode: fault.faultCode },
        update: {
          displayCode: fault.displayCode,
          faultName: fault.faultName,
          faultContent: fault.faultContent,
          solution: fault.solution,
          isActive: fault.isActive,
        },
        create: {
          faultCode: fault.faultCode,
          displayCode: fault.displayCode,
          faultName: fault.faultName,
          faultContent: fault.faultContent,
          solution: fault.solution,
          isActive: fault.isActive,
        },
      });
      successCount++;
    } catch (error) {
      console.error(`エラー: ${fault.faultCode} - ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n登録結果:`);
  console.log(`  成功: ${successCount}件`);
  console.log(`  エラー: ${errorCount}件`);
}

// JSONファイルからデータベースに保存
async function saveSensorStatusToDB(sensors) {
  console.log('\n=== センサ状態マスタデータのデータベース保存 ===\n');

  let successCount = 0;
  let errorCount = 0;

  for (const sensor of sensors) {
    try {
      await prisma.sensorStatus.upsert({
        where: { sensorCode: sensor.sensorCode },
        update: {
          sensorName: sensor.sensorName,
          description: sensor.description,
        },
        create: {
          sensorCode: sensor.sensorCode,
          sensorName: sensor.sensorName,
          description: sensor.description,
        },
      });
      successCount++;
    } catch (error) {
      console.error(`エラー: ${sensor.sensorCode} - ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n登録結果:`);
  console.log(`  成功: ${successCount}件`);
  console.log(`  エラー: ${errorCount}件`);
}

// JSONファイルからデータベースに読み込む（本番環境用）
async function loadFromJson() {
  console.log('=== JSONファイルからデータベースに読み込み ===\n');

  // 既存データのチェック
  const hasData = await hasExistingData();
  if (hasData) {
    console.log('既存のデータが検出されました。データ投入をスキップします。');
    const faultCount = await prisma.faultMaster.count();
    const sensorCount = await prisma.sensorStatus.count();
    console.log(`  故障マスタ: ${faultCount}件`);
    console.log(`  センサ状態: ${sensorCount}件`);
    return;
  }

  console.log('既存データが見つかりませんでした。データを投入します。\n');

  // 故障マスタデータの読み込み
  const jsonPath = '/data/parsed_data.json';
  if (!fs.existsSync(jsonPath)) {
    // Vercel環境では/dataディレクトリが存在しない可能性があるため、
    // プロジェクトルートからの相対パスも試す
    const altPath = './data/parsed_data.json';
    if (!fs.existsSync(altPath)) {
      throw new Error(
        `JSONファイルが見つかりません: ${jsonPath} または ${altPath}\n` +
          '開発環境で先にエクセルファイルを解析してJSONファイルを生成してください。',
      );
    }
    const data = JSON.parse(fs.readFileSync(altPath, 'utf8'));
    const mtSensors = loadMtSensorDataFromPath('./data/parsed_data_mt_sensor.json');
    await saveFaultMasterToDB(data.faults || []);
    await saveSensorStatusToDB(mtSensors);
    console.log('\n=== データベース保存完了 ===');
    return;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`JSONファイルを読み込みました: ${jsonPath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  故障マスタ: ${data.faults?.length || 0}件`);

  // MTセンサデータの読み込み
  const mtSensors = loadMtSensorData();

  await saveFaultMasterToDB(data.faults || []);
  await saveSensorStatusToDB(mtSensors);

  console.log('\n=== データベース保存完了 ===');
}

async function main() {
  try {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

    if (isDevelopment && !isVercel) {
      // 開発環境：エクセル解析（故障マスタ） → JSON生成 → MTセンサデータ読み込み → DB保存
      console.log('【開発環境モード】\n');
      
      // 故障マスタ：エクセルから解析
      const data = await parseExcelToJson();
      await saveFaultMasterToDB(data.faults);
      
      // センサ状態：parsed_data_mt_sensor.jsonから読み込み
      const mtSensors = loadMtSensorData();
      await saveSensorStatusToDB(mtSensors);
      
      console.log('\n=== データ初期化完了 ===');
    } else {
      // 本番環境（Vercel含む）：JSONファイルからDB保存（既存データチェック付き）
      console.log('【本番環境モード】\n');
      await loadFromJson();
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
    // Vercel環境では、エラーが発生してもビルドを続行できるようにexit(0)にする
    // ただし、重要なエラーはログに記録される
    if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
      console.error('Vercel環境でのデータ初期化エラー（ビルドは続行されます）');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseExcelToJson,
  loadFromJson,
  saveFaultMasterToDB,
  saveSensorStatusToDB,
  hasExistingData,
};
