// Run with PGLITE_TEST_MODULE pointing to an installed @electric-sql/pglite entry.
// Local disposable PostgreSQL only; never reads production credentials.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.PGLITE_TEST_MODULE);
const migration=fs.readFileSync(new URL('../supabase-v9.6-audit-safety.sql',import.meta.url),'utf8');
async function setup() {
  const db=new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
    create table landing_pages(id integer primary key,status text,content jsonb,html_snapshot text);
    insert into landing_pages values(1,'published','{"price":45,"hasUnpublishedChanges":false}','old');
    insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');`);
  return db;
}
const db=await setup();
try {
  await db.exec(migration);await db.exec(migration);
  await db.exec(`update landing_pages set draft_content='{"price":55}' where id=1`);
  assert.equal((await db.query('select content from landing_pages')).rows[0].content.price,45);
  await db.exec(`update landing_pages set content='{"price":99}' where id=1`);
  let row=(await db.query('select * from landing_pages')).rows[0];
  assert.equal(row.content.price,45);assert.equal(row.draft_content.price,99);
  await db.exec(`update landing_pages set content='{"price":55}',draft_content='{"price":55}',publication_revision=gen_random_uuid() where id=1`);
  assert.equal((await db.query('select content from landing_pages')).rows[0].content.price,55);
  await db.exec(`set test.uid='11111111-1111-4111-8111-111111111111';set role authenticated;`);
  for(let i=0;i<6;i++) assert.equal((await db.query('select consume_seo_audit() as allowed')).rows[0].allowed,i<5);
  await db.exec(`set test.uid='22222222-2222-4222-8222-222222222222'`);
  assert.equal((await db.query('select consume_seo_audit() as allowed')).rows[0].allowed,true);
  await assert.rejects(db.query('select * from seo_audit_usage'),/permission denied/);
  console.log('PASS: migration repeatable; autosave freezes price; old-client writes freeze price; publish advances price; per-user quota and permissions enforced.');
} finally {await db.close();}
const dirty=await setup();
try {
  await dirty.exec(`update landing_pages set content='{"price":55,"hasUnpublishedChanges":true}'`);
  await assert.rejects(dirty.exec(migration),/Republish/);
  await dirty.exec('rollback');
  const cols=await dirty.query("select column_name from information_schema.columns where table_name='landing_pages' and column_name='draft_content'");
  assert.equal(cols.rows.length,0);
  console.log('PASS: ambiguous legacy published data aborts and rolls back the entire migration.');
} finally {await dirty.close();}
