const fs = require('fs');
const path = require('path');

// mt_sensor.jsonを読み込む
const mtSensorPath = path.join(__dirname, '../../data/mt_sensor.json');
const mtSensorData = JSON.parse(fs.readFileSync(mtSensorPath, 'utf8'));

// 変換処理
const sensors = [];

// 各グループ（1-6）を処理
for (const [groupNum, sensorList] of Object.entries(mtSensorData)) {
  for (const sensorStr of sensorList) {
    // "X000: 左循環減速検出LS" の形式を解析
    const match = sensorStr.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const sensorCode = match[1].trim();
      const sensorName = match[2].trim();
      
      sensors.push({
        sensorCode,
        sensorName,
        description: null,
      });
    }
  }
}

// センサコードでソート
sensors.sort((a, b) => a.sensorCode.localeCompare(b.sensorCode));

// 出力データ
const outputData = {
  sensors,
  generatedAt: new Date().toISOString(),
  source: 'mt_sensor.json',
};

// ファイルに保存
const outputPath = path.join(__dirname, '../../data/parsed_data_mt_sensor.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');

console.log('変換完了:');
console.log(`  入力: ${mtSensorPath}`);
console.log(`  出力: ${outputPath}`);
console.log(`  センサ数: ${sensors.length}件`);



