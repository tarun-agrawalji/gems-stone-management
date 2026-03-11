const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString:
      "postgresql://postgres:wJTCIubgNDfUI7Xg@db.xhamtmnhkcbsdynexdwd.supabase.co:5432/postgres",
  });
  await client.connect();

  console.log('Checking "Lot" table columns...');
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Lot'
  `);
  console.log("Lot columns:", res.rows.map((r) => r.column_name).join(", "));

  console.log('Checking "Purchase" table columns...');
  const res2 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Purchase'
  `);
  console.log(
    "Purchase columns:",
    res2.rows.map((r) => r.column_name).join(", "),
  );

  await client.end();
}
main().catch(console.error);
