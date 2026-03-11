const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString:
      "postgresql://postgres:wJTCIubgNDfUI7Xg@db.xhamtmnhkcbsdynexdwd.supabase.co:5432/postgres",
  });
  await client.connect();

  console.log('Checking "Organization" table...');
  const res = await client.query('SELECT * FROM "Organization"');
  console.log("Organizations:", res.rows.length);
  if (res.rows.length > 0) {
    console.log("First Org ID:", res.rows[0].id);
  }

  console.log('Checking "User" table...');
  const res2 = await client.query(
    'SELECT id, name, email, "organizationId" FROM "User"',
  );
  console.log(
    "Users:",
    res2.rows.map((u) => ({ email: u.email, org: u.organizationId })),
  );

  await client.end();
}
main().catch(console.error);
