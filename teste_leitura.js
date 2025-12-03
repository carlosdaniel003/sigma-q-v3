// Salve como teste_leitura.js na raiz do projeto
// Execute com: node teste_leitura.js

const fs = require('fs');
const path = require('path');

console.log("=== DIAGNÓSTICO DE LEITURA DE ARQUIVOS ===");
console.log("Diretório Atual (CWD):", process.cwd());

const pastaPublic = path.join(process.cwd(), 'public', 'defeitos');
console.log("Procurando arquivos em:", pastaPublic);

if (fs.existsSync(pastaPublic)) {
    console.log("✅ Pasta 'public/defeitos' ENCONTRADA!");
    
    const arquivos = fs.readdirSync(pastaPublic);
    console.log("📂 Arquivos encontrados na pasta:");
    arquivos.forEach(f => console.log(`   - ${f}`));

    const esperados = ["defeitos_af.xlsx", "defeitos_lcm.xlsx", "defeitos_produto_acabado.xlsx", "defeitos_pth.xlsx"];
    const faltantes = esperados.filter(e => !arquivos.includes(e));

    if (faltantes.length > 0) {
        console.error("❌ ALERTA: Os seguintes arquivos essenciais NÃO foram encontrados:");
        faltantes.forEach(f => console.error(`   - ${f}`));
    } else {
        console.log("✅ TODOS os arquivos esperados estão presentes.");
    }

} else {
    console.error("❌ ERRO GRAVE: A pasta 'public/defeitos' NÃO EXISTE.");
    console.error("   Certifique-se de criar a pasta e mover os arquivos .xlsx para lá.");
}
console.log("==========================================");