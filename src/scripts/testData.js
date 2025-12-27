const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testData() {
  try {
    const count = await prisma.faultMaster.count();
    console.log(`故障マスタ件数: ${count}件`);
    
    const sample = await prisma.faultMaster.findMany({
      take: 5,
      orderBy: { faultCode: 'asc' }
    });
    
    console.log('\nサンプルデータ:');
    sample.forEach(f => {
      console.log(`  ${f.faultCode} (表示: ${f.displayCode || 'N/A'}) - ${f.faultName}`);
    });
    
    const sensorCount = await prisma.sensorStatus.count();
    console.log(`\nセンサ状態マスタ件数: ${sensorCount}件`);
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testData();

