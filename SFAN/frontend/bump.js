const fs = require('fs');

const files = [
    'dashboard_broker.html',
    'dashboard_individual.html',
    'dashboard_policyholder.html',
    'dashboard/main_broker.js',
    'dashboard/main_individual.js',
    'dashboard/main_policyholder.js'
];

files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf-8');
        content = content.replace(/\.js\?v=\d+/g, '.js?v=99');
        fs.writeFileSync(f, content, 'utf-8');
    }
});
