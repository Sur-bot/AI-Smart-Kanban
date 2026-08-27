const fs = require('fs');
const path = require('path');

const targetPath = 'C:\\ai-smart-kanban-backend\\src\\controllers\\profileController.js';

let content = fs.readFileSync(targetPath, 'utf8');

// Update getProfile
if (!content.includes('preferences: user.user_metadata?.preferences || {},')) {
  content = content.replace(
    'avatar_url: user.user_metadata?.avatar_url || null,',
    'avatar_url: user.user_metadata?.avatar_url || null,\n      preferences: user.user_metadata?.preferences || {},'
  );
}

// Update updateProfile req.body
if (!content.includes('preferences } = req.body;')) {
  content = content.replace(
    'const { fullName, avatarUrl } = req.body;',
    'const { fullName, avatarUrl, preferences } = req.body;'
  );
}

// Update updateProfile updateData
if (!content.includes('updateData.data.preferences = preferences;')) {
  content = content.replace(
    'if (avatarUrl) updateData.data.avatar_url = avatarUrl;',
    'if (avatarUrl) updateData.data.avatar_url = avatarUrl;\n    if (preferences !== undefined) updateData.data.preferences = preferences;'
  );
}

// Update updateProfile return
if (content.match(/avatar_url: user\.user_metadata\?\.avatar_url,\n\s+\}\);/)) {
  content = content.replace(
    /avatar_url: user\.user_metadata\?\.avatar_url,/,
    'avatar_url: user.user_metadata?.avatar_url,\n      preferences: user.user_metadata?.preferences || {},'
  );
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully patched profileController.js');
