// Simple table test for markdown renderer
const fs = require('fs');

// Load the markdown renderer
const markdownCode = fs.readFileSync('scripts/markdown.js', 'utf8');
eval(markdownCode);

// Test table markdown
const testMarkdown = `
# Table Test

Here's a simple table:

| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |
| Bob  | 35  | Chicago |

And a more complex table:

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Tables | ✅ | High | Working |
| Code blocks | ✅ | High | Enhanced |
| Task lists | ✅ | Medium | New feature |

End of test.
`;

console.log('Testing table rendering...');
const rendered = markdownRenderer.render(testMarkdown);
console.log('Rendered HTML:');
console.log(rendered);

// Check if tables were rendered
const hasTable = rendered.includes('<table class="markdown-table">');
const hasTableContainer = rendered.includes('<div class="table-container">');
const hasTableHeaders = rendered.includes('<thead>');
const hasTableBody = rendered.includes('<tbody>');

console.log('\nTable rendering results:');
console.log('Has table element:', hasTable);
console.log('Has table container:', hasTableContainer);
console.log('Has table headers:', hasTableHeaders);
console.log('Has table body:', hasTableBody);

if (hasTable && hasTableContainer && hasTableHeaders && hasTableBody) {
    console.log('✅ Table rendering is working correctly!');
} else {
    console.log('❌ Table rendering has issues');
}
