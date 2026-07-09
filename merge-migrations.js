const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const outputFile = path.join(__dirname, 'supabase', 'restore_schema.sql');

try {
  console.log('Lendo arquivos de migração de:', migrationsDir);
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Diretório de migrações não encontrado em: ${migrationsDir}`);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`Encontrados ${files.length} arquivos SQL. Concatenando em ordem...`);

  let consolidatedSql = `-- ==================================================\n`;
  consolidatedSql += `-- Script de Restauração de Esquema Consolidado\n`;
  consolidatedSql += `-- Gerado em: ${new Date().toISOString()}\n`;
  consolidatedSql += `-- ==================================================\n\n`;
  consolidatedSql += `BEGIN;\n\n`;

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    consolidatedSql += `\n-- ==========================================\n`;
    consolidatedSql += `-- APLICANDO MIGRACAO: ${file}\n`;
    consolidatedSql += `-- ==========================================\n\n`;
    consolidatedSql += content;
    consolidatedSql += `\n`;
  }

  consolidatedSql += `\nCOMMIT;\n`;

  fs.writeFileSync(outputFile, consolidatedSql, 'utf8');
  console.log('✅ Sucesso! Todas as migrações foram consolidadas em:', outputFile);
  console.log('Copie o conteúdo deste arquivo e execute-o no SQL Editor do Supabase.');
} catch (error) {
  console.error('❌ Erro ao consolidar migrações:', error.message);
}
