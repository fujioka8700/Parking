const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ファイルパスを解決する（Vercel環境対応）
function resolveDataPath(filename) {
  const cwd = process.cwd();
  const scriptDir = __dirname;
  
  // デバッグ情報を出力（Vercel環境でのトラブルシューティング用）
  console.log(`[デバッグ] 現在の作業ディレクトリ: ${cwd}`);
  console.log(`[デバッグ] スクリプトの場所: ${scriptDir}`);
  
  const possiblePaths = [
    // Docker環境用
    `/data/${filename}`,
    // Vercel環境用（プロジェクトルートから）
    path.join(cwd, 'data', filename),
    path.join(cwd, 'src', 'data', filename),
    // 相対パス（スクリプトの場所から）
    path.join(scriptDir, '..', '..', 'data', filename),
    path.join(scriptDir, '..', '..', '..', 'data', filename),
    path.join(scriptDir, '..', 'data', filename),
    // 現在のディレクトリから
    path.join(cwd, filename),
    `./data/${filename}`,
    // Vercel環境でsrcディレクトリがルートの場合
    path.join(cwd, '..', 'data', filename),
    path.join(scriptDir, '..', '..', '..', '..', 'data', filename),
  ];

  console.log(`[デバッグ] 検索するパス:`);
  for (const filePath of possiblePaths) {
    console.log(`  - ${filePath}`);
    if (fs.existsSync(filePath)) {
      console.log(`✓ ファイルが見つかりました: ${filePath}`);
      return filePath;
    }
  }

  console.error(`✗ ファイルが見つかりませんでした: ${filename}`);
  return null;
}

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
  // まずパスを解決する
  const outputPath = resolveDataPath('parsed_data_tower_code.json') || '/data/parsed_data_tower_code.json';
  // ディレクトリが存在しない場合は作成
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const data = {
    faults,
    generatedAt: new Date().toISOString(),
    parkingType: "タワーパーク",
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');

  console.log(`\nJSONファイルを生成しました: ${outputPath}`);
  console.log(`  駐車場タイプ: ${data.parkingType || '不明'}`);
  console.log(`  故障マスタ: ${faults.length}件`);

  return data;
}

// parsed_data_mt_sensor.jsonからセンサ状態データを読み込む
function loadMtSensorData() {
  console.log('=== MTセンサデータの読み込み ===\n');

  const mtSensorPath = resolveDataPath('parsed_data_mt_sensor.json') || '/data/parsed_data_mt_sensor.json';
  if (!fs.existsSync(mtSensorPath)) {
    throw new Error(
      `MTセンサデータファイルが見つかりません: ${mtSensorPath}\n` +
        '先にconvertMtSensor.jsを実行してparsed_data_mt_sensor.jsonを生成してください。',
    );
  }

  const data = JSON.parse(fs.readFileSync(mtSensorPath, 'utf8'));

  console.log(`MTセンサデータファイルを読み込みました: ${mtSensorPath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  駐車場タイプ: ${data.parkingType || '不明'}`);
  console.log(`  センサ状態: ${data.sensors?.length || 0}件`);

  return { sensors: data.sensors || [], parkingType: data.parkingType || 'タワーパーク（MT）' };
}

// parsed_data_m_sensor.jsonからセンサ状態データを読み込む
function loadMSensorData() {
  console.log('=== Mセンサデータの読み込み ===\n');

  const mSensorPath = resolveDataPath('parsed_data_m_sensor.json') || '/data/parsed_data_m_sensor.json';
  if (!fs.existsSync(mSensorPath)) {
    throw new Error(
      `Mセンサデータファイルが見つかりません: ${mSensorPath}\n` +
        'parsed_data_m_sensor.jsonが存在することを確認してください。',
    );
  }

  const data = JSON.parse(fs.readFileSync(mSensorPath, 'utf8'));

  console.log(`Mセンサデータファイルを読み込みました: ${mSensorPath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  駐車場タイプ: ${data.parkingType || '不明'}`);
  console.log(`  センサ状態: ${data.sensors?.length || 0}件`);

  return { sensors: data.sensors || [], parkingType: data.parkingType || 'タワーパーク（M）' };
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
  console.log(`  駐車場タイプ: ${data.parkingType || '不明'}`);
  console.log(`  センサ状態: ${data.sensors?.length || 0}件`);

  return { sensors: data.sensors || [], parkingType: data.parkingType || 'タワーパーク（MT）' };
}

// パスを指定してMセンサデータを読み込む（Vercel環境用）
function loadMSensorDataFromPath(mSensorPath) {
  console.log('=== Mセンサデータの読み込み ===\n');

  if (!fs.existsSync(mSensorPath)) {
    throw new Error(
      `Mセンサデータファイルが見つかりません: ${mSensorPath}\n` +
        'parsed_data_m_sensor.jsonが存在することを確認してください。',
    );
  }

  const data = JSON.parse(fs.readFileSync(mSensorPath, 'utf8'));

  console.log(`Mセンサデータファイルを読み込みました: ${mSensorPath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  駐車場タイプ: ${data.parkingType || '不明'}`);
  console.log(`  センサ状態: ${data.sensors?.length || 0}件`);

  return { sensors: data.sensors || [], parkingType: data.parkingType || 'タワーパーク（M）' };
}

// パスを指定してCセンサデータを読み込む（Vercel環境用）
function loadCSensorDataFromPath(cSensorPath) {
  console.log('=== Cセンサデータの読み込み ===\n');

  if (!fs.existsSync(cSensorPath)) {
    throw new Error(
      `Cセンサデータファイルが見つかりません: ${cSensorPath}\n` +
        'parsed_data_c_sensor.jsonが存在することを確認してください。',
    );
  }

  const data = JSON.parse(fs.readFileSync(cSensorPath, 'utf8'));

  console.log(`Cセンサデータファイルを読み込みました: ${cSensorPath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  駐車場タイプ: ${data.parkingType || '不明'}`);
  console.log(`  センサ状態: ${data.sensors?.length || 0}件`);

  return { sensors: data.sensors || [], parkingType: data.parkingType || 'リフトパーク（C）' };
}

// パスを指定してC前側センサデータを読み込む（Vercel環境用）
function loadCFrontSensorDataFromPath(cFrontSensorPath) {
  console.log('=== C前側センサデータの読み込み ===\n');

  if (!fs.existsSync(cFrontSensorPath)) {
    throw new Error(
      `C前側センサデータファイルが見つかりません: ${cFrontSensorPath}\n` +
        'parsed_data_c_front_sensor.jsonが存在することを確認してください。',
    );
  }

  const data = JSON.parse(fs.readFileSync(cFrontSensorPath, 'utf8'));

  console.log(`C前側センサデータファイルを読み込みました: ${cFrontSensorPath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  駐車場タイプ: ${data.parkingType || '不明'}`);
  console.log(`  センサ状態: ${data.sensors?.length || 0}件`);

  return { sensors: data.sensors || [], parkingType: data.parkingType || 'リフトパーク（縦列・前側）' };
}

// パスを指定してリフトパーク故障コードデータを読み込む（Vercel環境用）
function loadLiftCodeDataFromPath(liftCodePath) {
  console.log('=== リフトパーク故障コードデータの読み込み ===\n');

  if (!fs.existsSync(liftCodePath)) {
    throw new Error(
      `リフトパーク故障コードデータファイルが見つかりません: ${liftCodePath}\n` +
        'parsed_data_lift_code.jsonが存在することを確認してください。',
    );
  }

  const data = JSON.parse(fs.readFileSync(liftCodePath, 'utf8'));

  console.log(`リフトパーク故障コードデータファイルを読み込みました: ${liftCodePath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  駐車場タイプ: ${data.parkingType || '不明'}`);
  console.log(`  故障マスタ: ${data.faults?.length || 0}件`);

  return { faults: data.faults || [], parkingType: data.parkingType || 'リフトパーク' };
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
async function saveFaultMasterToDB(faults, parkingType = 'タワーパーク') {
  console.log(`=== 故障マスタデータのデータベース保存（${parkingType}）===\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const fault of faults) {
    try {
      // solutionがnullやundefinedの場合でも、明示的にnullを設定する
      const solutionValue = fault.solution !== undefined ? fault.solution : null;
      
      // デバッグ: faultCode 5-7のsolutionを確認
      if (['5', '6', '7'].includes(fault.faultCode)) {
        console.log(`[デバッグ] faultCode: ${fault.faultCode}, solution存在: ${solutionValue !== null && solutionValue !== undefined}, solution長: ${solutionValue ? solutionValue.length : 0}`);
      }
      
      // 既存レコードの確認（faultCodeとparkingTypeの複合キーで検索）
      const existing = await prisma.faultMaster.findUnique({
        where: { 
          faultCode_parkingType: {
            faultCode: fault.faultCode,
            parkingType: parkingType,
          }
        },
        select: { id: true, solution: true },
      });
      
      if (existing) {
        // 既存レコードがある場合、明示的にupdateを実行
        await prisma.faultMaster.update({
          where: { 
            faultCode_parkingType: {
              faultCode: fault.faultCode,
              parkingType: parkingType,
            }
          },
          data: {
            displayCode: fault.displayCode,
            faultName: fault.faultName,
            faultContent: fault.faultContent,
            solution: solutionValue, // solutionを明示的に更新
            isActive: fault.isActive,
            parkingType: parkingType,
          },
        });
        
        // 念のため、solutionが正しく保存されたか確認（faultCode 5-7のみ）
        if (['5', '6', '7'].includes(fault.faultCode)) {
          const saved = await prisma.faultMaster.findUnique({
            where: { 
              faultCode_parkingType: {
                faultCode: fault.faultCode,
                parkingType: parkingType,
              }
            },
            select: { solution: true },
          });
          if (saved && saved.solution !== solutionValue) {
            console.warn(`[警告] faultCode ${fault.faultCode}のsolutionが正しく保存されていません。再度更新します。`);
            // 再度更新を試みる（solutionのみ）
            await prisma.faultMaster.update({
              where: { 
                faultCode_parkingType: {
                  faultCode: fault.faultCode,
                  parkingType: parkingType,
                }
              },
              data: { solution: solutionValue },
            });
          } else if (saved && saved.solution === solutionValue) {
            console.log(`[確認] faultCode ${fault.faultCode}のsolutionが正しく保存されました。`);
          }
        }
      } else {
        // 新規レコードを作成
        await prisma.faultMaster.create({
          data: {
            faultCode: fault.faultCode,
            displayCode: fault.displayCode,
            faultName: fault.faultName,
            faultContent: fault.faultContent,
            solution: solutionValue,
            isActive: fault.isActive,
            parkingType: parkingType,
          },
        });
      }
      
      successCount++;
    } catch (error) {
      console.error(`エラー: ${fault.faultCode} - ${error.message}`);
      if (error.stack) {
        console.error(`スタックトレース: ${error.stack}`);
      }
      errorCount++;
    }
  }

  console.log(`\n登録結果:`);
  console.log(`  成功: ${successCount}件`);
  console.log(`  エラー: ${errorCount}件`);
}

// JSONファイルからデータベースに保存
async function saveSensorStatusToDB(sensors, parkingType) {
  console.log(`\n=== センサ状態マスタデータのデータベース保存（${parkingType}）===\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const sensor of sensors) {
    try {
      await prisma.sensorStatus.upsert({
        where: {
          sensorCode_parkingType: {
            sensorCode: sensor.sensorCode,
            parkingType: parkingType,
          },
        },
        update: {
          sensorName: sensor.sensorName,
          description: sensor.description,
        },
        create: {
          sensorCode: sensor.sensorCode,
          sensorName: sensor.sensorName,
          description: sensor.description,
          parkingType: parkingType,
        },
      });
      successCount++;
    } catch (error) {
      console.error(`エラー: ${sensor.sensorCode} (${parkingType}) - ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n登録結果:`);
  console.log(`  成功: ${successCount}件`);
  console.log(`  エラー: ${errorCount}件`);
}

// JSONファイルからデータベースに読み込む
async function loadFromJson() {
  console.log('=== JSONファイルからデータベースに読み込み ===\n');

  // Vercel環境では、--force-resetでデータベースがリセットされているため、
  // 既存データのチェックをスキップしてデータを投入する
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  
  // 既存データチェックを削除し、常にデータを投入する
  // （各駐車場タイプごとに個別にチェックするため）
  console.log('データを投入します。\n');

  // 故障マスタデータの読み込み
  const jsonPath = resolveDataPath('parsed_data_tower_code.json');
  if (!jsonPath) {
    // Vercel環境では、エラーが発生してもビルドを続行できるようにする
    if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
      console.warn('警告: parsed_data_tower_code.jsonが見つかりませんでした。データ投入をスキップします。');
      console.warn('データファイルがGitリポジトリに含まれていることを確認してください。');
      return;
    }
    throw new Error(
      `JSONファイルが見つかりません: parsed_data_tower_code.json\n` +
        `現在の作業ディレクトリ: ${process.cwd()}\n` +
        `スクリプトの場所: ${__dirname}\n` +
        'parsed_data_tower_code.jsonが存在することを確認してください。',
    );
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`JSONファイルを読み込みました: ${jsonPath}`);
  console.log(`  生成日時: ${data.generatedAt || '不明'}`);
  console.log(`  駐車場タイプ: ${data.parkingType || '不明'}`);
  console.log(`  故障マスタ: ${data.faults?.length || 0}件`);

  const parkingType = data.parkingType || 'タワーパーク';
  await saveFaultMasterToDB(data.faults || [], parkingType);

  // MTセンサデータの読み込み（オプション）
  const mtSensorPath = resolveDataPath('parsed_data_mt_sensor.json');
  if (mtSensorPath) {
    try {
      const mtSensorData = loadMtSensorDataFromPath(mtSensorPath);
      await saveSensorStatusToDB(mtSensorData.sensors, mtSensorData.parkingType);
    } catch (error) {
      console.warn(`警告: MTセンサデータの読み込みに失敗しました: ${error.message}`);
      console.warn('故障マスタデータのみ投入します。');
    }
  } else {
    console.warn('警告: parsed_data_mt_sensor.jsonが見つかりませんでした。');
    console.warn('故障マスタデータのみ投入します。');
  }

  // Mセンサデータの読み込み（オプション）
  const mSensorPath = resolveDataPath('parsed_data_m_sensor.json');
  if (mSensorPath) {
    try {
      const mSensorData = loadMSensorDataFromPath(mSensorPath);
      await saveSensorStatusToDB(mSensorData.sensors, mSensorData.parkingType);
    } catch (error) {
      console.warn(`警告: Mセンサデータの読み込みに失敗しました: ${error.message}`);
    }
  } else {
    console.warn('警告: parsed_data_m_sensor.jsonが見つかりませんでした。');
  }

  // Cセンサデータの読み込み（オプション）
  const cSensorPath = resolveDataPath('parsed_data_c_sensor.json');
  if (cSensorPath) {
    try {
      const cSensorData = loadCSensorDataFromPath(cSensorPath);
      await saveSensorStatusToDB(cSensorData.sensors, cSensorData.parkingType);
    } catch (error) {
      console.warn(`警告: Cセンサデータの読み込みに失敗しました: ${error.message}`);
    }
  } else {
    console.warn('警告: parsed_data_c_sensor.jsonが見つかりませんでした。');
  }

  // C前側センサデータの読み込み（オプション）
  const cFrontSensorPath = resolveDataPath('parsed_data_c_front_sensor.json');
  if (cFrontSensorPath) {
    try {
      const cFrontSensorData = loadCFrontSensorDataFromPath(cFrontSensorPath);
      await saveSensorStatusToDB(cFrontSensorData.sensors, cFrontSensorData.parkingType);
    } catch (error) {
      console.warn(`警告: C前側センサデータの読み込みに失敗しました: ${error.message}`);
    }
  } else {
    console.warn('警告: parsed_data_c_front_sensor.jsonが見つかりませんでした。');
  }

  // リフトパーク故障コードデータの読み込み（オプション）
  const liftCodePath = resolveDataPath('parsed_data_lift_code.json');
  if (liftCodePath) {
    try {
      const liftCodeData = loadLiftCodeDataFromPath(liftCodePath);
      await saveFaultMasterToDB(liftCodeData.faults, liftCodeData.parkingType);
    } catch (error) {
      console.warn(`警告: リフトパーク故障コードデータの読み込みに失敗しました: ${error.message}`);
    }
  } else {
    console.warn('警告: parsed_data_lift_code.jsonが見つかりませんでした。');
  }

  console.log('\n=== データベース保存完了 ===');
}

async function main() {
  try {
    // 開発環境・本番環境共通：JSONファイルからDB保存（既存データチェック付き）
    console.log('【データ初期化モード】\n');
    await loadFromJson();
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
  loadFromJson,
  saveFaultMasterToDB,
  saveSensorStatusToDB,
  loadMtSensorData,
  loadMSensorData,
  loadCSensorDataFromPath,
  loadLiftCodeDataFromPath,
  hasExistingData,
  resolveDataPath,
};
